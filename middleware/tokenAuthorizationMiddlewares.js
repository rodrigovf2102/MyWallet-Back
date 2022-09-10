import db from '../db.js'

async function tokenVerificationGetUser(req, res, next) {
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
        const user = await db.collection('users').findOne({ _id: session.userId });
        if (!user) {
            res.status(404).send('Error: user not found');
            return;
        }
        res.locals.user = user;
    } catch (error) {
        res.status(500).send('Error: unable to acess database');
        console.log(error)
        return;
    }
    next();
}

async function tokenVerificationGetOperations(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if (!token) {
        res.status(401).send('Error: access denied, empty token, sign-in again');
        return;
    }
    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            res.status(401).send('Error: access denied, token not found!, sign-in again');
            return;
        }
        const operacoes = await db.collection('operacoes').find({ userId: session.userId }).toArray();
        if (!operacoes) {
            res.status(404).send('Error: operations not found');
            return;
        }
        res.locals.operacoes = operacoes;
    } catch (error) {
        res.status(500).send('Error: unable to acess database');
        console.log(error)
        return;
    }
    next();
}

export { tokenVerificationGetUser,tokenVerificationGetOperations};