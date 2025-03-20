import { Application, Request, Response } from "express";
import { GetProductPriceValidation, GetProductValidation } from "./validators/get-product";
import { AppDataSource } from "../db/database";
import { Product } from "../db/models/product";

export const initHandlers = (app: Application) => {
    app.get("/ping", (req: Request, res: Response) => {
        res.send({"message": "hello world"})
    })

    app.get("/products", async (req: Request, res: Response) => {
        try{
            const productRepository = AppDataSource.getRepository(Product)
            if(req.query.priceLimit){
                const validation = GetProductPriceValidation.validate(req.query)
                if(validation.error){
                    res.status(400).send(validation.error.details)
                    return
                }
                const getProductPriceReq = validation.value.priceLimit
                const productList = await AppDataSource
                    .getRepository(Product)
                    .createQueryBuilder("product")
                    .where("product.price < :priceLimit", { priceLimit: getProductPriceReq }).getMany()
                if(productList === null){
                    res.status(404).send({"message": "resource not found"})
                    return
                }
                res.status(200).send(productList)
            }else{
                const productList = await productRepository.find()
                res.status(200).send(productList)  
            }
              
        }catch(error){
            if(error instanceof Error){
                console.log(`Internal error: ${error.message}`)
            }
            res.status(500).send({"message": "internal error"})
        }
    })

    app.get("/products?priceLimit=:priceLimit", async (req: Request, res: Response) => {
        try{
            res.send(req.params)
            const validation = GetProductPriceValidation.validate(req.params)
            if(validation.error){
                res.status(400).send(validation.error.details)
                return
            }
            const getProductPriceReq = validation.value.priceLimit
            const productList = await AppDataSource.getRepository(Product).createQueryBuilder("product").where("product.price < :priceMax", {priceMax: getProductPriceReq})

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

    app.delete("/products/:id", async (req: Request, res: Response) => {
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
            res.status(200).send(`Resource with id ${getProductRequest.id} was deleted successefully`)
        } catch(error) {
            if (error instanceof Error) {
                console.log(`Internal error: ${error.message}`)
            }
            res.status(500).send({"message": "internal error"})
        }
    })

    app.patch("/products/:id", async (req: Request, res: Response) => {
        try {
            const validation = GetProductValidation.validate(req.params);
            if (validation.error) {
                res.status(400).send(validation.error.details)
                return
            }
    
            const patchProductRequest = validation.value
            const productRepository = AppDataSource.getRepository(Product)
            const product = await productRepository.findOne({
                where: { id: patchProductRequest.id }
            })
            if (product === null) {
                res.status(404).send({ "message": "resource not found" })
                return
            }
    
            const patchUpdate = req.body
            Object.assign(product, patchUpdate)
            await productRepository.save(product);
            res.json(product);
            
        } catch(error) {
            if (error instanceof Error) {
                console.log(`Internal error: ${error.message}`)
            }
            res.status(500).send({"message": "internal error"})
        }
    }
)}