import express from 'express';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import joi from 'joi';
import dayjs from 'dayjs';
import { strict as assert } from "assert";
import { stripHtml } from "string-strip-html";
import db from './db.js'
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

dayjs.locale('pt-br');
const server = express();
server.use(cors());
server.use(express.json());

const signupSchema = joi.object({
    name: joi.string().empty().required(),
    email: joi.string().email().required(),
    senha: joi.required()
})

const signinSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.required()
})

const operationSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().required(),
    type: joi.string().allow('')
})


server.post('/sign-up', async (req, res) => {
    let { name, email, senha } = req.body;

    name = stripHtml(name, { skipHtmlDecoding: true }).result.trim();
    email = stripHtml(email, { skipHtmlDecoding: true }).result.trim();
    senha = stripHtml(senha, { skipHtmlDecoding: true }).result.trim();

    const user = { name: name, email: email, senha: senha };

    const validation = signupSchema.validate(user, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        res.status(422).send(errors);
        return;
    }

    try {
        const hasName = await db.collection('users').findOne({ name: name });
        const hasEmail = await db.collection('users').findOne({ email: email });
        if (hasEmail || hasName) {
            res.status(401).send('Error: email or user already used');
            return;
        }
        const passwordHash = bcrypt.hashSync(senha, 10);
        await db.collection('users').insertOne({ nome: name, email: email, senha: passwordHash });
        res.sendStatus(201);
    } catch (error) {
        res.status(500).send('Error: unable to storage new user on databse');
        return;
    }
})

server.post('/sign-in', async (req, res) => {
    let { email, senha } = req.body;

    email = stripHtml(email, { skipHtmlDecoding: true }).result.trim();
    senha = stripHtml(senha, { skipHtmlDecoding: true }).result.trim();

    const validUser = { email: email, senha: senha };

    const validation = signinSchema.validate(validUser, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        res.status(422).send(errors);
        return;
    }
    try {
        const user = await db.collection('users').findOne({ email: email });
        if (user && bcrypt.compareSync(senha, user.senha)) {
            const token = uuid();
            await db.collection('sessions').insertOne({ userId: user._id, token });
            res.status(200).send(token);
            return;
        } else {
            res.status(401).send('Error: user or password invalid');
            return;
        }
    } catch (error) {
        res.status(500).send('Error: unable to acess info on database');
        return;
    }

})

server.get('/operacao', async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    console.log(token)
    if (!token) {
        res.status(401).send('Error: access denied, empty token, sign-in again');
        return;
    }
    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            res.status(401).send('Error: access denied, token not found, sign-in again');
            return;
        }
        const operacoes = await db.collection('operacoes').find({ userId: session.userId }).toArray();
        if (!operacoes) {
            res.status(404).send('Error: operations not found');
            return;
        }
        if (operacoes) {
            res.status(201).send(operacoes);
            return;
        }
    } catch (error) {
        res.status(500).send('Error: unable to acess database');
        return;
    }
})

server.get('/user', async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    console.log(token)
    if (!token) {
        res.status(401).send('Error: access denied, empty token, sign-in again');
        return;
    }
    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            res.status(401).send('Error: access denied, token not found, sign-in again');
            return;
        }
        const user = await db.collection('users').findOne({ _id: session.userId });
        if (!user) {
            res.status(404).send('Error: user not found');
            return;
        }
        if (user) {
            res.status(200).send(user.nome);
            return;
        }
    } catch (error) {
        res.status(500).send('Error: unable to acess database');
        console.log(error)
        return;
    }
})

server.post('/operacao', async (req, res) => {
    let { valor, descricao, tipo } = req.body;

    let validOperation = { value: valor, description: descricao, type: tipo };

    const validation = operationSchema.validate(validOperation, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        res.status(422).send(errors);
        return;
    }

    valor = stripHtml(valor, { skipHtmlDecoding: true }).result.trim();
    descricao = stripHtml(descricao, { skipHtmlDecoding: true }).result.trim();
    tipo = stripHtml(tipo, { skipHtmlDecoding: true }).result.trim();

    if(tipo === 'entrada'){
        validOperation.type = 'green';
    } else{
        validOperation.type = 'red';
    }
    validOperation.value = Number(valor);
    validOperation.description = descricao;
    validOperation.date = dayjs().format('DD/MM');
    console.log(validOperation.value,validOperation.date)

    const { authorization } = req.headers;

    const token = authorization?.replace('Bearer ', '');

    if (!token) {
        res.status(401).send('Error: access denied, empty token, sign-in again');
        return;
    }
    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            res.status(401).send('Error: access denied, token not found, sign-in again');
            return;
        }
        validOperation.userId = session.userId;
        await db.collection('operacoes').insertOne(validOperation);
        res.status(201).send('Operation inserted');
    } catch (error) {
        res.status(500).send('Error: unable to acess database');
        console.log(error)
        return;
    }
})

server.listen(5000);