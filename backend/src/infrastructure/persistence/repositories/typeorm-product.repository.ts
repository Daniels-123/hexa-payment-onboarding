import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepositoryPort } from '../../../domain/ports/spi/product-repository.port';
import { Product } from '../../../domain/entities/product';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class TypeOrmProductRepository implements ProductRepositoryPort {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly repo: Repository<ProductEntity>,
    ) { }

    async findAll(): Promise<Product[]> {
        const products = await this.repo.find();
        return products.map(this.toDomain);
    }

    async findById(id: string): Promise<Product | null> {
        const product = await this.repo.findOneBy({ id });
        return product ? this.toDomain(product) : null;
    }

    async updateStock(id: string, newStock: number): Promise<void> {
        await this.repo.update(id, { stock: newStock });
    }

    async seed(products: Product[]): Promise<void> {
        const entities = products.map(this.toPersistence);
        await this.repo.save(entities);
    }

    private toDomain(entity: ProductEntity): Product {
        return new Product(
            entity.id,
            entity.name,
            entity.description,
            entity.price,
            entity.stock,
            entity.imgUrl,
        );
    }

    private toPersistence(domain: Product): ProductEntity {
        const entity = new ProductEntity();
        if (domain.id) entity.id = domain.id;
        entity.name = domain.name;
        entity.description = domain.description;
        entity.price = domain.price;
        entity.stock = domain.stock;
        entity.imgUrl = domain.imgUrl;
        return entity;
    }
}
