import fs from 'fs';
import path from 'path';

// Obtener el __dirname de manera compatible con ES6 (ESM)
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const cartsFilePath = path.join(__dirname, '../data/carts.json');

class CartManager {
    // Leer todos los carritos
    readCarts() {
        try {
            const data = fs.readFileSync(cartsFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') { 
                fs.writeFileSync(cartsFilePath, JSON.stringify([]));
                return [];
            }
            return []; 
        }
    }

    // Obtener carrito por ID
    getCartById(id) {
        const carts = this.readCarts();
        return carts.find(cart => cart.id === id);
    }

    // Agregar un carrito
    addCart(cart) {
        const carts = this.readCarts();
        carts.push(cart);
        fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
        return cart;
    }

    // Actualizar un carrito
    updateCart(id, updatedCart) {
        const carts = this.readCarts();
        const index = carts.findIndex(c => c.id === id);

        if (index !== -1) {
            carts[index] = { ...carts[index], ...updatedCart };
            fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
            return carts[index];
        }

        return null;
    }

    // Eliminar un carrito
    deleteCart(id) {
        const carts = this.readCarts();
        const updatedCarts = carts.filter(c => c.id !== id);

        if (updatedCarts.length === carts.length) return null; 

        fs.writeFileSync(cartsFilePath, JSON.stringify(updatedCarts, null, 2));
        return true;
    }

    // Verificar si un producto está en el carrito
    productExistsInCart(cartId, productId) {
        const cart = this.getCartById(cartId);
        if (!cart) return false; // Si el carrito no existe, retornamos false

        const productInCart = cart.products.find(item => item.product === productId);
        return !!productInCart; // Retornamos si el producto está en el carrito
    }
}

export default CartManager;
