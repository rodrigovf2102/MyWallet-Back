import joi from 'joi';
import db from '../db.js'
import { stripHtml } from "string-strip-html";
import dayjs from 'dayjs';

dayjs.locale('pt-br');

async function getOperations(req, res) {
    const operacoes = res.locals.operacoes
    operacoes.reverse()
    if (operacoes) {
        res.status(201).send(operacoes);
        return;
    }
}

async function postOperation(req, res) {
    let { valor, descricao, tipo } = req.body;
    let validOperation = { value: valor, description: descricao, type: tipo };
    valor = stripHtml(valor, { skipHtmlDecoding: true }).result.trim();
    descricao = stripHtml(descricao, { skipHtmlDecoding: true }).result.trim();
    tipo = stripHtml(tipo, { skipHtmlDecoding: true }).result.trim();
    if (tipo === 'entrada') {
        validOperation.type = 'green';
    } else {
        validOperation.type = 'red';
    }
    validOperation.value = Number(valor);
    validOperation.description = descricao;
    validOperation.date = dayjs().format('DD/MM');
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
}

export { getOperations, postOperation }