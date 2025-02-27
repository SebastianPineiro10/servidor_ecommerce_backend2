/* import fs from 'fs';

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    // Obtiene todos los productos
    async getProducts() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    // Añadir un nuevo producto
    async addProduct(product) {
        const products = await this.getProducts();
        products.push(product);
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return product;
    }

    // Eliminar un producto por código
    async deleteProductByCode(code) {
        const products = await this.getProducts();
        const index = products.findIndex(product => product.code === code);
        if (index === -1) return false;  // Si no se encuentra el producto, retorna false
        
        // Eliminar el producto
        products.splice(index, 1);
        
        // Guardar el array actualizado
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return true;  // Producto eliminado exitosamente
    }
}

export default ProductManager; */
