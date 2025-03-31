import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const productsRouter = express.Router();

// Obtener todos los productos (con filtros, paginación, etc.)
productsRouter.get('/', getProducts);

// Obtener un producto por ID
productsRouter.get('/:pid', getProductById);

// Crear un nuevo producto
productsRouter.post('/', createProduct);

// Actualizar un producto
productsRouter.put('/:pid', updateProduct);

// Eliminar un producto
productsRouter.delete('/:pid', deleteProduct);

export default productsRouter;
