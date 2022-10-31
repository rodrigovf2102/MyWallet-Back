import db from '../server.js'
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';


async function postNewUser(req, res) {
    let { name, email, senha } = req.body;

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
        console.log(error);
        return;
    }
}

async function postUserSignIn(req, res) {
    let { email, senha } = req.body;
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
        console.log(error);
        return;
    }
}

async function getUser(req, res) {
    const session = res.locals.session;
    try {
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
}

export { postNewUser, postUserSignIn, getUser }