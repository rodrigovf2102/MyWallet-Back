import joi from "joi";

const operationSchema = joi.object({
    value: joi.number().greater(0).required(),
    description: joi.string().max(30).required(),
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