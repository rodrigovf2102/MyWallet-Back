import joi from "joi";

const operationSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().required(),
    type: joi.string().allow('')
})

async function operationValidate(req,res,next){
    let { valor, descricao, tipo } = req.body;
    let validOperation = { value: valor, description: descricao, type: tipo };
    const validation = operationSchema.validate(validOperation, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        res.status(422).send(errors);
        return;
    }
    next();
}

export default operationValidate;