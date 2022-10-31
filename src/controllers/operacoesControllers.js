import joi from 'joi';
import db from '../db.js'
import { stripHtml } from "string-strip-html";
import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';

dayjs.locale('pt-br');

async function getOperations(req, res) {
    const session = res.locals.session;
    try {
        const operacoes = await db.collection('operacoes').find({ userId: session.userId }).toArray();
        if (!operacoes) {
            res.status(404).send('Error: operations not found');
            return;
        }
        operacoes.reverse()
        res.status(201).send(operacoes);
        return;
    } catch (error) {
        res.status(500).send('Error: unable to acess database');
        console.log(error)
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
    try {
        const session = res.locals.session;
        validOperation.userId = session.userId;
        await db.collection('operacoes').insertOne(validOperation);
        res.status(201).send('Operation inserted');
    } catch (error) {
        res.status(500).send('Error: unable to acess database');
        console.log(error)
        return;
    }
}

async function deleteOperation(req,res){ 
    let {id} = req.body;
    try {
        await db.collection('operacoes').deleteOne({_id:ObjectId(id)});
        res.status(200).send('Operation deleted');
    } catch (error) {
        res.status(500).send('Error: unable to acess database');
        console.log(error)
        return;
    }
}

async function updateOperation(req, res) {

    let { valor, descricao, tipo, id } = req.body;
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

    try {
        const session = res.locals.session;
        validOperation.userId = session.userId;
        await db.collection('operacoes').updateOne({_id:ObjectId(id)},
        {$set:{value:validOperation.value,description:validOperation.description}});
        res.status(201).send('Operation updated');
    } catch (error) {
        res.status(500).send('Error: unable to acess database');
        console.log(error)
        return;
    }
}

export { getOperations, postOperation, deleteOperation, updateOperation }