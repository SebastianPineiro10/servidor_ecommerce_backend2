import express from 'express';
import ProductManagerMongo from '../managers/productManager.mongo.js';

const productsRouter = express.Router();
const productManager = new ProductManagerMongo();

// Obtener todos los productos (con filtros, paginación, etc.)
productsRouter.get('/', async (req, res) => {
  try {
    const options = {
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort,
      query: req.query.query
    };
    const result = await productManager.getProducts(options);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Obtener un producto por ID
productsRouter.get('/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    res.status(200).json({
      status: 'success',
      payload: product
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

// Crear un nuevo producto
productsRouter.post('/', async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Producto creado exitosamente',
      payload: newProduct
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Actualizar un producto
productsRouter.put('/:pid', async (req, res) => {
  try {
    const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Producto actualizado exitosamente',
      payload: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Eliminar un producto
productsRouter.delete('/:pid', async (req, res) => {
  try {
    await productManager.deleteProduct(req.params.pid);
    res.status(200).json({
      status: 'success',
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

export default productsRouter;
