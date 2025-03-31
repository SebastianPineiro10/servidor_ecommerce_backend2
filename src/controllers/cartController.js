import express from 'express';
import {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  clearCart,
} from '../controllers/cartController.js';

const cartsRouter = express.Router();

// Crear un nuevo carrito
cartsRouter.post('/', createCart);

// Obtener un carrito por ID
cartsRouter.get('/:cid', getCartById);

// Agregar un producto a un carrito
cartsRouter.post('/:cid/products/:pid', addProductToCart);

// Eliminar un producto de un carrito
cartsRouter.delete('/:cid/products/:pid', removeProductFromCart);

// Vaciar un carrito
cartsRouter.delete('/:cid', clearCart);

export default cartsRouter;

