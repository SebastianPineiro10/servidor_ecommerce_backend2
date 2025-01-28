import express from 'express';
import ProductManager from '../managers/productManager.js';

const productsRouter = express.Router();
const productManager = new ProductManager();

// Ruta GET /api/products: Listar productos con límite opcional
productsRouter.get("/", (req, res) => {
    const { limit } = req.query;
    let products = productManager.readProducts();

    if (limit) {
        products = products.slice(0, parseInt(limit));
    }

    res.status(200).send(products);
});

// Ruta GET /api/products/:pid: Obtener producto por ID
productsRouter.get("/:pid", (req, res) => {
    const product = productManager.getProductById(parseInt(req.params.pid));

    if (!product) {
        return res.status(404).send({ message: "Producto no encontrado" });
    }

    res.status(200).send(product);
});

// Ruta POST /api/products: Crear un nuevo producto
productsRouter.post("/", (req, res) => {
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

    const product = productManager.addProduct(newProduct);
    res.status(201).send(product);
});

// Ruta PUT /api/products/:pid: Actualizar un producto por ID
productsRouter.put("/:pid", (req, res) => {
    const updatedProduct = req.body;
    const product = productManager.updateProduct(parseInt(req.params.pid), updatedProduct);

    if (!product) {
        return res.status(404).send({ message: "Producto no encontrado" });
    }

    res.status(200).send(product);
});

// Ruta DELETE /api/products/:pid: Eliminar un producto por ID
productsRouter.delete("/:pid", (req, res) => {
    const success = productManager.deleteProduct(parseInt(req.params.pid));

    if (!success) {
        return res.status(404).send({ message: "Producto no encontrado" });
    }

    res.status(200).send({ message: "Producto eliminado" });
});

export default productsRouter;


