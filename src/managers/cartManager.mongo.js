import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

class CartManagerMongo {
  async createCart() {
    try {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      return newCart.toObject();
    } catch (error) {
      throw new Error(`Error al crear carrito: ${error.message}`);
    }
  }

  async getCartById(id) {
    try {
      const cart = await Cart.findById(id).populate('products.product').lean();
      if (!cart) {
        throw new Error(`Carrito con ID ${id} no encontrado`);
      }
      return cart;
    } catch (error) {
      throw new Error(`Error al obtener carrito: ${error.message}`);
    }
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    try {
      // Verificar que el carrito existe
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      // Verificar que el producto existe
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Producto con ID ${productId} no encontrado`);
      }

      // Buscar si el producto ya está en el carrito
      const productIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (productIndex !== -1) {
        // Si el producto ya existe, incrementar la cantidad
        cart.products[productIndex].quantity += quantity;
      } else {
        // Si no existe, agregar el producto al carrito
        cart.products.push({
          product: productId,
          quantity
        });
      }

      // Guardar los cambios en el carrito
      await cart.save();

      // Retornar el carrito actualizado y poblado
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al agregar producto al carrito: ${error.message}`);
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      // Verificar que el carrito existe
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      // Guardar el tamaño original para verificar luego si se eliminó algún producto
      const originalLength = cart.products.length;

      // Filtrar el producto a eliminar
      cart.products = cart.products.filter(
        item => item.product.toString() !== productId
      );

      // Verificar si se eliminó algún producto
      if (cart.products.length === originalLength) {
        throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
      }

      // Guardar los cambios
      await cart.save();

      // Retornar el carrito actualizado
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al eliminar producto del carrito: ${error.message}`);
    }
  }

  async updateCart(cartId, products) {
    try {
      // Verificar que el carrito existe
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      // Validar que products sea un array
      if (!Array.isArray(products)) {
        throw new Error('El formato de productos no es válido');
      }

      // Verificar que todos los productos existan
      for (const item of products) {
        if (!item.product || !item.quantity || item.quantity <= 0) {
          throw new Error('Formato de producto inválido');
        }
        const productExists = await Product.findById(item.product);
        if (!productExists) {
          throw new Error(`Producto con ID ${item.product} no encontrado`);
        }
      }

      // Actualizar los productos del carrito
      cart.products = products;

      // Guardar los cambios
      await cart.save();

      // Retornar el carrito actualizado
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al actualizar carrito: ${error.message}`);
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      // Validar la cantidad
      if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
        throw new Error('La cantidad debe ser un número entero positivo');
      }

      // Verificar que el carrito existe
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      // Buscar el producto en el carrito
      const productIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      // Verificar que el producto existe en el carrito
      if (productIndex === -1) {
        throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
      }

      // Actualizar la cantidad
      cart.products[productIndex].quantity = quantity;

      // Guardar los cambios
      await cart.save();

      // Retornar el carrito actualizado
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al actualizar cantidad del producto: ${error.message}`);
    }
  }

  async clearCart(cartId) {
    try {
      // Verificar que el carrito existe
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      // Vaciar el carrito
      cart.products = [];

      // Guardar los cambios
      await cart.save();

      // Retornar el carrito actualizado
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al vaciar el carrito: ${error.message}`);
    }
  }
}

export default CartManagerMongo;