import { Application, Request, Response } from "express";
import { GetProductPriceValidation, GetProductValidation } from "./validators/get-product";
import { AppDataSource } from "../db/database";
import { Product } from "../db/models/product";
import { LessThan } from "typeorm"

export const initHandlers = (app: Application) => {
    app.get("/ping", (req: Request, res: Response) => {
        res.send({"message": "hello world"})
    })

    app.get("/products", async (req: Request, res: Response) => {
        try{
            const productRepository = AppDataSource.getRepository(Product)
            const productList = await productRepository.find()

            if(productList === null){
                res.status(404).send({"message": "resource not found"})
                return
            }
            res.status(200).send(productList)
        }catch(error){
            if(error instanceof Error){
                console.log(`Internal error: ${error.message}`)
            }
            res.status(500).send({"message": "internal error"})
        }
    })

    app.get("/products?priceLessThan=:priceLimit", async (req: Request, res: Response) => {
        try{
            const validation = GetProductPriceValidation.validate(req.params)
            if(validation.error){
                res.status(400).send(validation.error.details)
                return
            }
            const getProductPriceReq = validation.value.priceLimit
            const productRepository = AppDataSource.getRepository(Product)
            const productList = await productRepository.createQueryBuilder("product").where("product.price < :priceLimit", {priceLimit: getProductPriceReq})

            if(productList === null){
                res.status(404).send({"message": "resource not found"})
                return
            }
            res.status(200).send(productList)
        }catch(error){
            if(error instanceof Error){
                console.log(`Internal error: ${error.message}`)
            }
            res.status(500).send({"message": "internal error"})
        }
    })

    app.get("/products/:id", async (req: Request, res: Response) => {
        try {
            const validation = GetProductValidation.validate(req.params);
            if (validation.error) {
                res.status(400).send(validation.error.details)
                return
            }
    
            const getProductRequest = validation.value
            const productRepository = AppDataSource.getRepository(Product)
            const product = await productRepository.findOne({
                where: { id: getProductRequest.id }
            })
            if (product === null) {
                res.status(404).send({ "message": "resource not found" })
                return
            }
    
            res.status(200).send(product);
        } catch(error) {
            if (error instanceof Error) {
                console.log(`Internal error: ${error.message}`)
            }
            res.status(500).send({"message": "internal error"})
        }
    })

    app.delete("products/:id", async (req: Request, res: Response) => {
        try {
            const validation = GetProductValidation.validate(req.params);
            if (validation.error) {
                res.status(400).send(validation.error.details)
                return
            }
    
            const getProductRequest = validation.value
            const productRepository = AppDataSource.getRepository(Product)
            const product = await productRepository.findOne({
                where: { id: getProductRequest.id }
            })
            if (product === null) {
                res.status(404).send({ "message": "resource not found" })
                return
            }
    
            
            await productRepository.remove(product)
        } catch(error) {
            if (error instanceof Error) {
                console.log(`Internal error: ${error.message}`)
            }
            res.status(500).send({"message": "internal error"})
        }
    })
}