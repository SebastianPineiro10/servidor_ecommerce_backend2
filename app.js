import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import cookieParser from 'cookie-parser';
import session from 'express-session'; // Configuración de sesiones
import { connectDB } from './src/config/dbConfig.js';

// Importar rutas
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import viewsRouter from './src/routes/views.router.js';
import sessionRouter from './src/routes/sessionRoutes.js';

// Importar managers
import ProductManagerMongo from './src/managers/productManager.mongo.js';

// Conexión a la base de datos
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración del motor de plantillas Handlebars
app.engine(
  'handlebars',
  engine({
    defaultLayout: 'main', // Configura "main" como el layout principal
    helpers: {
      eq: (a, b) => a === b,
      gt: (a, b) => a > b,
      multiply: (price, quantity) => (price * quantity).toFixed(2),
      calculateTotal: (products) =>
        products.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2),
      firstThumbnail: (thumbnails) =>
        thumbnails && thumbnails.length > 0 ? thumbnails[0] : 'default-image.jpg',
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middleware global
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de express-session
app.use(
  session({
    secret: 'claveSecretaSuperSegura', // Cambia a una clave segura
    resave: false, // Evita guardar sesiones sin cambios
    saveUninitialized: true, // Inicializa sesiones vacías
    cookie: { secure: false }, // Cambia a true si usas HTTPS
  })
);

// Usar las rutas
app.use('/api/session', sessionRouter); // Rutas de login/registro
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter); // Asegúrate de que esta ruta esté definida al final

// Inicializar ProductManager para Socket.IO
const productManager = new ProductManagerMongo();

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Enviar los productos iniciales cuando un cliente se conecta
  productManager.getProducts().then((products) => {
    socket.emit('initialProducts', products.payload);
  });

  // Escuchar el evento de agregar un nuevo producto
  socket.on('newProduct', async (productData) => {
    try {
      const newProduct = await productManager.addProduct(productData);
      const updatedProducts = await productManager.getProducts();
      io.emit('productAdded', newProduct);
      io.emit('productsUpdated', updatedProducts.payload);
    } catch (error) {
      console.error('Error al agregar producto:', error.message);
      socket.emit('productError', { message: error.message });
    }
  });

  // Escuchar el evento de eliminar un producto
  socket.on('deleteProduct', async (code) => {
    try {
      const result = await productManager.deleteProductByCode(code);
      if (result) {
        const updatedProducts = await productManager.getProducts();
        io.emit('productDeleted', { code });
        io.emit('productsUpdated', updatedProducts.payload);
      } else {
        console.error(`Producto con código ${code} no encontrado`);
        socket.emit('productError', { message: 'Producto no encontrado' });
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error.message);
      socket.emit('productError', { message: error.message });
    }
  });
});

// Middleware para manejar rutas inexistentes y redirigir al login
app.use((req, res, next) => {
  res.redirect('/login'); // Redirige al login para rutas no encontradas
});

// Middleware para manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error detectado:', err.stack);
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
