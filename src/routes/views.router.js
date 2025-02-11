import express from 'express';
import ProductManager from '../managers/productManager.js';

const viewsRouter = express.Router();
const productManager = new ProductManager("./src/data/products.json");

viewsRouter.get("/", async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render("home", { products });
    } catch (error) {
        res.status(500).send({ message: "Error al obtener productos" });
    }
});

viewsRouter.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render("realTimeProducts", { products });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

export default viewsRouter;
