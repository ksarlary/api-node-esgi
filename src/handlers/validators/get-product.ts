import Joi from "joi"

export const GetProductValidation = Joi.object<ProductId>({
    id: Joi.number().required()
})

export const GetProductPriceValidation = Joi.object<ProductPriceLimit>({
    priceLimit: Joi.number().required()
})

export interface ProductPriceLimit{
    priceLimit: number
}

export interface ProductId{
    id: number
}