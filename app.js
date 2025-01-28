import express from 'express';
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import ProductManager from './src/managers/productManager.js';
import CartManager from './src/managers/cartManager.js';

const app = express();
//Este es el puerto de mi servidor
const PORT = 8080;

// Es el Middleware para poder habilitar las consultas que se hagan en nuestro servidor para poder recibir JSON
app.use(express.json());

// Instancias de los manejadores
const productManager = new ProductManager();
const cartManager = new CartManager();

// Estas son las Rutas de productos y carritos
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// De esta forma podemos iniciar el servidor en el puerto que definimos
app.listen(PORT, () => {
    console.log(`Servidor iniciando en http://localhost:${PORT}`);
});
