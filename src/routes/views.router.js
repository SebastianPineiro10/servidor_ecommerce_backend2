import express from 'express';
import ProductManagerMongo from '../managers/productManager.mongo.js';
import CartManagerMongo from '../managers/cartManager.mongo.js';

const viewsRouter = express.Router();
const productManager = new ProductManagerMongo();
const cartManager = new CartManagerMongo();

// Middleware para asegurarse de que existe un carrito en la sesión
viewsRouter.use(async (req, res, next) => {
  if (!req.session?.cartId) {
    try {
      const newCart = await cartManager.createCart();
      req.session.cartId = newCart._id;
    } catch (error) {
      console.error('Error al crear carrito de sesión:', error);
    }
  }
  next();
});

// Vista principal - Home
viewsRouter.get('/', async (req, res) => {
  try {
    const result = await productManager.getProducts();
    res.render('home', {
      products: result.payload,
      title: 'Productos',
      cartId: req.session?.cartId || null 
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Vista de productos con paginación
viewsRouter.get('/products', async (req, res) => {
  try {
    const options = {
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort,
      query: req.query.query
    };

    // Construir la URL base para los enlaces de paginación
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/products`;

    // Construir queryString para mantener otros parámetros
    const buildQueryString = (pg) => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pg);
      if (req.query.limit) queryParams.append('limit', req.query.limit);
      if (req.query.sort) queryParams.append('sort', req.query.sort);
      if (req.query.query) queryParams.append('query', req.query.query);
      return queryParams.toString();
    };

    // Obtener productos con paginación
    const result = await productManager.getProducts(options);

    // Actualizar los enlaces con la URL base real
    if (result.hasPrevPage) {
      result.prevLink = `${baseUrl}?${buildQueryString(result.prevPage)}`;
    }

    if (result.hasNextPage) {
      result.nextLink = `${baseUrl}?${buildQueryString(result.nextPage)}`;
    }

    res.render('products', {
      products: result,
      title: 'Catálogo de Productos',
      // Si hay un carrito almacenado en la sesión, pasarlo a la vista
      cartId: req.session?.cartId || null
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Vista de detalle de producto
viewsRouter.get('/products/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    res.render('product-detail', {
      product,
      title: product.title,
      // Si hay un carrito almacenado en la sesión, pasarlo a la vista
      cartId: req.session?.cartId || null
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// Vista de carrito
viewsRouter.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    res.render('cart', {
      cart,
      title: 'Tu Carrito',
      isEmpty: cart.products.length === 0
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// Vista de productos en tiempo real
viewsRouter.get('/realtimeproducts', async (req, res) => {
  try {
    const result = await productManager.getProducts();
    res.render('realTimeProducts', {
      products: result.payload,
      title: 'Productos en Tiempo Real'
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default viewsRouter;