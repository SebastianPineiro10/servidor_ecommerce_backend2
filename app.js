import express from 'express';
import session from 'express-session'; // Importar express-session
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import viewsRouter from './src/routes/views.router.js';
import { connectDB } from './src/config/dbConfig.js';
import ProductManagerMongo from './src/managers/productManager.mongo.js';

// Conectar a la base de datos MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.engine('handlebars', engine({
  helpers: {
    eq: (a, b) => a === b,
    gt: (a, b) => a > b,
    multiply: (price, quantity) => {
      return (price * quantity).toFixed(2);  // Calcula el subtotal
    },
    calculateTotal: (products) => {
      return products.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0).toFixed(2);  // Calcula el total del carrito
    },
    firstThumbnail: (thumbnails) => {
      if (thumbnails && thumbnails.length > 0) {
        return thumbnails[0];  // Retorna el primer thumbnail
      }
      return 'default-image.jpg';  // Si no hay thumbnails, devuelve una imagen predeterminada
    }
  }
}));

app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Puerto del servidor
const PORT = 8080;

// Configuración de la sesión
app.use(session({
  secret: 'mi_clave_secreta', // Cambia esto a una clave más segura en producción
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Si usas HTTPS, cambia secure a true
}));

// Middleware para procesar solicitudes JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static('public'));

// Rutas de productos, carritos y vistas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

const productManager = new ProductManagerMongo();

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');

  // Enviar productos iniciales al cliente
  productManager.getProducts().then(products => {
    socket.emit('initialProducts', products.payload);
  });

  // Escuchar la adición de un nuevo producto
  socket.on('newProduct', async (productData) => {
    try {
      const newProduct = await productManager.addProduct(productData);
      const updatedProducts = await productManager.getProducts();
      io.emit('productAdded', newProduct);
      io.emit('productsUpdated', updatedProducts.payload);
    } catch (error) {
      console.log('Error al agregar nuevo producto', error);
      socket.emit('productError', { message: error.message });
    }
  });

  // Escuchar la eliminación de productos
  socket.on('deleteProduct', async (code) => {
    try {
      const result = await productManager.deleteProductByCode(code);
      if (result) {
        const updatedProducts = await productManager.getProducts();
        io.emit('productDeleted', { code });
        io.emit('productsUpdated', updatedProducts.payload);
      } else {
        console.log('Producto con código ' + code + ' no encontrado para eliminar');
        socket.emit('productError', { message: 'Producto no encontrado' });
      }
    } catch (error) {
      console.log('Error al eliminar el producto:', error);
      socket.emit('productError', { message: error.message });
    }
  });
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
