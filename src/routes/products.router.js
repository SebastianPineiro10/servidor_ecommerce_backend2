import express from 'express';
import ProductManager from '../managers/productManager.js';

const productsRouter = express.Router();

const productManager = new ProductManager("./src/data/products.json"); 

// Listar productos con límite opcional
productsRouter.get("/", async (req, res) => {
    const { limit } = req.query;
    let products = await productManager.getProducts();  

    if (limit) {
        products = products.slice(0, parseInt(limit));
    }

    res.status(200).send(products);
});

// Obtener producto por ID
productsRouter.get("/:pid", async (req, res) => {
    const product = await productManager.getProductById(parseInt(req.params.pid));

    if (!product) {
        return res.status(404).send({ message: "Producto no encontrado" });
    }

    res.status(200).send(product);
});

// Crear un nuevo producto
productsRouter.post("/", async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).send({ message: "Todos los campos son obligatorios" });
    }

    const newProduct = {
        id: Date.now(),
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails: thumbnails || [],
    };

    const product = await productManager.addProduct(newProduct);
    res.status(201).send(product);
});

// Actualizar producto por ID
productsRouter.put("/:pid", async (req, res) => {
    const updatedProduct = req.body;
    const product = await productManager.updateProduct(parseInt(req.params.pid), updatedProduct);

    if (!product) {
        return res.status(404).send({ message: "Producto no encontrado" });
    }

    res.status(200).send(product);
});

// Eliminar producto por ID
productsRouter.delete("/:pid", async (req, res) => {
    const success = await productManager.deleteProduct(parseInt(req.params.pid));

    if (!success) {
        return res.status(404).send({ message: "Producto no encontrado" });
    }

    res.status(200).send({ message: "Producto eliminado" });
});

export default productsRouter;

