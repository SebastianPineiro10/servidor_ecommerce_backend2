import express from 'express';
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import ProductManager from './src/managers/productManager.js';
import CartManager from './src/managers/cartManager.js';
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import viewsRouter from './src/routes/views.router.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Puerto del servidor
const PORT = 8080;

// Middleware para procesar solicitudes JSON
app.use(express.json());

// Archivos estáticos
app.use(express.static("public"));

// Instanciación de managers
const cartManager = new CartManager();

// Rutas de productos y carritos
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// Configuración de WebSocket
const productManager = new ProductManager("./src/data/products.json");

io.on("connection", (socket) => {
    console.log("Nuevo usuario conectado");

    // Enviar productos iniciales al cliente
    productManager.getProducts().then(products => {
        socket.emit("initialProducts", products);
    });

    // Escuchar la adición de un nuevo producto
    socket.on("newProduct", async (productData) => {
        try {
            const newProduct = await productManager.addProduct(productData);
            io.emit("productAdded", newProduct);  // Emitir el producto agregado
        } catch (error) {
            console.log("Error al agregar nuevo producto", error);
        }
    });

    // Escuchar la eliminación de productos
    socket.on("deleteProduct", async (code) => {
        try {
            const result = await productManager.deleteProductByCode(code);
            if (result) {
                io.emit("productDeleted", { code });  // Notificar a todos los clientes que el producto fue eliminado
            } else {
                console.log("Producto no encontrado para eliminar");
            }
        } catch (error) {
            console.log("Error al eliminar el producto:", error);
        }
    });
});

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
