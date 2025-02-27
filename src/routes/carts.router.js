import express from 'express';
import CartManagerMongo from '../managers/cartManager.mongo.js';

const cartsRouter = express.Router();
const cartManager = new CartManagerMongo();

// Crear un nuevo carrito
cartsRouter.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({
      status: 'success',
      message: 'Carrito creado exitosamente',
      payload: newCart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Obtener un carrito por ID
cartsRouter.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    res.status(200).json({
      status: 'success',
      payload: cart
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
});

// Agregar un producto al carrito
cartsRouter.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const quantity = req.body.quantity || 1;
    const updatedCart = await cartManager.addProductToCart(cid, pid, quantity);
    res.status(200).json({
      status: 'success',
      message: 'Producto agregado al carrito exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Eliminar un producto del carrito
cartsRouter.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.removeProductFromCart(cid, pid);
    res.status(200).json({
      status: 'success',
      message: 'Producto eliminado del carrito exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Actualizar el carrito con un arreglo de productos
cartsRouter.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    const updatedCart = await cartManager.updateCart(cid, products);
    res.status(200).json({
      status: 'success',
      message: 'Carrito actualizado exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Actualizar la cantidad de un producto en el carrito
cartsRouter.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
    res.status(200).json({
      status: 'success',
      message: 'Cantidad actualizada exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Eliminar todos los productos del carrito
cartsRouter.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const updatedCart = await cartManager.clearCart(cid);
    res.status(200).json({
      status: 'success',
      message: 'Carrito vaciado exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default cartsRouter;