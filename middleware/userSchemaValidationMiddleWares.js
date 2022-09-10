import joi from 'joi';

const signupSchema = joi.object({
    name: joi.string().empty().required(),
    email: joi.string().email().required(),
    senha: joi.required()
})

const signinSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().required()
})

async function validateSignUp(req, res, next) {
    let { name, email, senha } = req.body;
    const user = { name: name, email: email, senha: senha };
    const validation = signupSchema.validate(user, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        res.status(422).send(errors);
        return;
    }
    next();
}

async function validateSignIn(req, res, next) {
    let { email, senha } = req.body;
    const validUser = { email: email, senha: senha };
    const validation = signinSchema.validate(validUser, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        res.status(422).send(errors);
        return;
    }
    next()
}

export { validateSignUp, validateSignIn };