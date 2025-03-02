import express from 'express';
import CartManagerMongo from '../managers/cartManager.mongo.js';

const cartsRouter = express.Router();
const cartManager = new CartManagerMongo();

// Crear un nuevo carrito (solo si no existe uno en la sesión)
cartsRouter.post('/', async (req, res) => {
  try {
    if (!req.session?.cartId) {
      const newCart = await cartManager.createCart();
      req.session.cartId = newCart._id; // Guardar el carrito creado en la sesión
      return res.status(201).json({
        status: 'success',
        message: 'Carrito creado exitosamente',
        payload: newCart
      });
    } else {
      return res.status(200).json({
        status: 'success',
        message: 'Carrito ya existe',
        payload: req.session.cartId
      });
    }
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
    if (cart._id.toString() === req.session.cartId.toString()) {
      res.status(200).json({
        status: 'success',
        payload: cart
      });
    } else {
      res.status(403).json({
        status: 'error',
        message: 'No autorizado para acceder a este carrito'
      });
    }
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

    if (cid !== req.session.cartId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'No autorizado para modificar este carrito'
      });
    }

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

    if (cid !== req.session.cartId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'No autorizado para modificar este carrito'
      });
    }

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

    if (cid !== req.session.cartId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'No autorizado para modificar este carrito'
      });
    }

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

    if (cid !== req.session.cartId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'No autorizado para modificar este carrito'
      });
    }

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

    if (cid !== req.session.cartId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'No autorizado para modificar este carrito'
      });
    }

    const updatedCart = await cartManager.clearCart(cid);
    res.status(200).json({
      status: 'success',
      message: 'Todos los productos eliminados del carrito',
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
