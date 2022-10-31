import db from '../server.js'

async function tokenVerification(req, res, next) {
    
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
        res.locals.session = session;
    } catch (error) {
        res.status(500).send('Error: unable to acess database');
        console.log(error)
        return;
    }
    next();
}

export {  tokenVerification };