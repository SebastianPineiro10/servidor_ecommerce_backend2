import fs from 'fs';
import path from 'path';

// Obtener el __dirname de manera compatible con ES6 (ESM)
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const productsFilePath = path.join(__dirname, '../data/products.json');

class ProductManager {
    readProducts() {
        try {
            const data = fs.readFileSync(productsFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    getProductById(id) {
        const products = this.readProducts();
        return products.find(product => product.id === id);
    }

    addProduct(product) {
        const products = this.readProducts();
        products.push(product);
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
        return product;
    }

    updateProduct(id, updatedProduct) {
        const products = this.readProducts();
        const index = products.findIndex(p => p.id === id);

        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct };
            fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
            return products[index];
        }

        return null;
    }

    deleteProduct(id) {
        const products = this.readProducts();
        const updatedProducts = products.filter(p => p.id !== id);
        
        if (updatedProducts.length === products.length) return null; // No encontrado
        
        fs.writeFileSync(productsFilePath, JSON.stringify(updatedProducts, null, 2));
        return true;
    }
}

export default ProductManager;
