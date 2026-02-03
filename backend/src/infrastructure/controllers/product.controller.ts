import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ProductRepositoryPort } from '../../domain/ports/spi/product-repository.port';
import { Product } from '../../domain/entities/product';
import { v4 as uuidv4 } from 'uuid';

@Controller('products')
export class ProductController {
    constructor(
        @Inject(ProductRepositoryPort)
        private readonly productRepo: ProductRepositoryPort,
    ) { }

    @Get()
    async getProducts() {
        return this.productRepo.findAll();
    }

    @Post('seed')
    async seedProducts() {
        const products: Product[] = [
            new Product(
                uuidv4(),
                'Marvelous Mug',
                'A mug that keeps your coffee hot forever (not really, but it looks cool).',
                25000,
                100,
                'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80',
            ),
            new Product(
                uuidv4(),
                'Fantastic T-Shirt',
                '100% Cotton, 200% Awesome.',
                55000,
                50,
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
            ),
            new Product(
                uuidv4(),
                'Super Sneakers',
                'Run faster than your problems.',
                120000,
                20,
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
            ),
        ];

        await this.productRepo.seed(products);
        return { message: 'Products seeded successfully', count: products.length };
    }
}
