import express from 'express';
import CartManager from '../managers/cartManager.js';
import ProductManager from '../managers/productManager.js';

const cartsRouter = express.Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

// Ruta GET /api/carts: Obtener todos los carritos
cartsRouter.get("/", (req, res) => {
    const carts = cartManager.readCarts();
    res.status(200).send(carts);
});

// Ruta POST /api/carts: Crear un nuevo carrito
cartsRouter.post("/", (req, res) => {
    const newCart = { id: Date.now(), products: [] };
    const cart = cartManager.addCart(newCart);
    res.status(201).send(cart);
});

// Ruta GET /api/carts/:cid: Obtener productos de un carrito por ID con detalles completos de los productos
cartsRouter.get("/:cid", (req, res) => {
    const cartId = parseInt(req.params.cid); // Convertir el ID del carrito a número
    const cart = cartManager.getCartById(cartId);

    if (!cart) {
        return res.status(404).send({ message: "Carrito no encontrado" });
    }

    // Aquí recorremos cada producto del carrito y obtenemos sus detalles completos
    const cartWithProductDetails = cart.products.map(item => {
        const product = productManager.getProductById(item.product);
        if (product) {
            return {
                product: product,  // Información completa del producto
                quantity: item.quantity  // Cantidad de ese producto en el carrito
            };
        }
    }).filter(item => item !== undefined);  // Filtrar si un producto no es encontrado

    res.status(200).send({
        id: cart.id,
        products: cartWithProductDetails  // Retornar carrito con los detalles completos de los productos
    });
});

// Ruta GET /api/carts/:cid/products/:pid: Obtener un producto específico dentro de un carrito por ID
cartsRouter.get("/:cid/products/:pid", (req, res) => {
    const cartId = parseInt(req.params.cid);  // Obtener el ID del carrito
    const productId = parseInt(req.params.pid); // Obtener el ID del producto

    // Buscar el carrito por ID
    const cart = cartManager.getCartById(cartId);
    if (!cart) {
        return res.status(404).send({ message: "Carrito no encontrado" });
    }

    // Buscar el producto en el carrito por ID
    const cartProduct = cart.products.find(item => item.product === productId);

    if (!cartProduct) {
        return res.status(404).send({ message: "Producto no encontrado en este carrito" });
    }

    // Obtener los detalles del producto
    const product = productManager.getProductById(productId);
    if (!product) {
        return res.status(404).send({ message: "Producto no encontrado" });
    }

    // Responder con las características del producto
    res.status(200).send({
        product: product,  // Detalles del producto
        quantity: cartProduct.quantity  // La cantidad de ese producto en el carrito
    });
});

// Ruta POST /api/carts/:cid/products/:pid: Agregar un producto al carrito
cartsRouter.post("/:cid/products/:pid", (req, res) => {
    const cart = cartManager.getCartById(parseInt(req.params.cid));
    const product = productManager.getProductById(parseInt(req.params.pid));

    if (!cart) {
        return res.status(404).send({ message: "Carrito no encontrado" });
    }

    if (!product) {
        return res.status(404).send({ message: "Producto no encontrado" });
    }

    // Buscar si el producto ya está en el carrito
    const existingProduct = cart.products.find(p => p.product === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1; // Incrementar cantidad
    } else {
        cart.products.push({ product: product.id, quantity: 1 }); // Agregar nuevo producto
    }

    cartManager.updateCart(cart.id, cart); // Actualizar carrito
    res.status(200).send(cart);
    
});

// Ruta DELETE /api/carts/:cid/products/:pid: Eliminar un producto del carrito
cartsRouter.delete("/:cid/products/:pid", (req, res) => {
    const cartId = parseInt(req.params.cid); // ID del carrito
    const productId = parseInt(req.params.pid); // ID del producto a eliminar

    // Buscar el carrito por ID
    const cart = cartManager.getCartById(cartId);
    if (!cart) {
        return res.status(404).send({ message: "Carrito no encontrado" });
    }

    // Buscar el índice del producto dentro del carrito
    const productIndex = cart.products.findIndex(p => p.product === productId);

    if (productIndex === -1) {
        return res.status(404).send({ message: "Producto no encontrado en el carrito" });
    }

    // Eliminar el producto del carrito
    cart.products.splice(productIndex, 1);

    // Actualizar el carrito con los productos restantes
    cartManager.updateCart(cart.id, cart);

    res.status(200).send({ message: "Producto eliminado del carrito", cart });
});

export default cartsRouter;

