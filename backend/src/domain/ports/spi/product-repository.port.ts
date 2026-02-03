import { Product } from '../../entities/product';

export interface ProductRepositoryPort {
    findAll(): Promise<Product[]>;
    findById(id: string): Promise<Product | null>;
    updateStock(id: string, newStock: number): Promise<void>;
    seed(products: Product[]): Promise<void>;
}

export const ProductRepositoryPort = Symbol('ProductRepositoryPort');
