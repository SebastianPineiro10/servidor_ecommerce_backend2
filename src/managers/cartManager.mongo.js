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

  async findCartBySessionId(sessionId) {
    try {
      const cart = await Cart.findOne({ sessionId }).populate('products.product').lean();
      return cart;
    } catch (error) {
      throw new Error(`Error al obtener carrito por sesión: ${error.message}`);
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
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Producto con ID ${productId} no encontrado`);
      }

      const productIndex = cart.products.findIndex(item => item.product.toString() === productId);
      if (productIndex !== -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al agregar producto al carrito: ${error.message}`);
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      const originalLength = cart.products.length;
      cart.products = cart.products.filter(item => item.product.toString() !== productId);

      if (cart.products.length === originalLength) {
        throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
      }

      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al eliminar producto del carrito: ${error.message}`);
    }
  }

  async updateCart(cartId, products) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      if (!Array.isArray(products)) {
        throw new Error('El formato de productos no es válido');
      }

      for (const item of products) {
        if (!item.product || !item.quantity || item.quantity <= 0) {
          throw new Error('Formato de producto inválido');
        }
        const productExists = await Product.findById(item.product);
        if (!productExists) {
          throw new Error(`Producto con ID ${item.product} no encontrado`);
        }
      }

      cart.products = products;
      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al actualizar carrito: ${error.message}`);
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
        throw new Error('La cantidad debe ser un número entero positivo');
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      const productIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );
      if (productIndex === -1) {
        throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
      }

      cart.products[productIndex].quantity = quantity;
      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al actualizar cantidad del producto: ${error.message}`);
    }
  }

  async clearCart(cartId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      cart.products = [];
      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al vaciar el carrito: ${error.message}`);
    }
  }
}

export default CartManagerMongo;