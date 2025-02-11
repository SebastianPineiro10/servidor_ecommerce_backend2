import express from 'express';
import CartManager from '../managers/cartManager.js';
import ProductManager from '../managers/productManager.js';

const cartsRouter = express.Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

// Ruta GET /api/carts: Obtener todos los carritos
cartsRouter.get("/", async (req, res) => {
    const carts = await cartManager.readCarts();
    res.status(200).send(carts);
});

// Ruta POST /api/carts: Crear un nuevo carrito
cartsRouter.post("/", async (req, res) => {
    const newCart = { id: Date.now(), products: [] };
    const cart = await cartManager.addCart(newCart);
    res.status(201).send(cart);
});

// Ruta GET /api/carts/:cid: Obtener productos de un carrito por ID con detalles completos de los productos
cartsRouter.get("/:cid", async (req, res) => {
    const cartId = parseInt(req.params.cid); 
    const cart = await cartManager.getCartById(cartId);

    if (!cart) {
        return res.status(404).send({ message: "Carrito no encontrado" });
    }

    
    const cartWithProductDetails = await Promise.all(cart.products.map(async (item) => {
        const product = await productManager.getProductById(item.product);
        if (product) {
            return {
                product,  
                quantity: item.quantity  
            };
        }
    })).filter(item => item !== undefined);  

    res.status(200).send({
        id: cart.id,
        products: cartWithProductDetails  
    });
});

// Ruta POST /api/carts/:cid/products/:pid: Agregar un producto al carrito
cartsRouter.post("/:cid/products/:pid", async (req, res) => {
    const cart = await cartManager.getCartById(parseInt(req.params.cid));
    const product = await productManager.getProductById(parseInt(req.params.pid));

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

    await cartManager.updateCart(cart.id, cart); // Actualizar carrito
    res.status(200).send(cart);
    
});

// Ruta DELETE /api/carts/:cid/products/:pid: Eliminar un producto del carrito
cartsRouter.delete("/:cid/products/:pid", async (req, res) => {
    const cartId = parseInt(req.params.cid); 
    const productId = parseInt(req.params.pid); 

    // Buscar el carrito por ID
    const cart = await cartManager.getCartById(cartId);
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
    await cartManager.updateCart(cart.id, cart);

    res.status(200).send({ message: "Producto eliminado del carrito" });
});

export default cartsRouter;
