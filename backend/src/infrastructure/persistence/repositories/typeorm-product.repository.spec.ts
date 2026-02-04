import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmProductRepository } from './typeorm-product.repository';
import { ProductEntity } from '../entities/product.entity';
import { Product } from '../../../domain/entities/product';

describe('TypeOrmProductRepository', () => {
    let repository: TypeOrmProductRepository;
    let repo: Repository<ProductEntity>;

    const mockRepo = {
        find: jest.fn(),
        findOneBy: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TypeOrmProductRepository,
                {
                    provide: getRepositoryToken(ProductEntity),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        repository = module.get<TypeOrmProductRepository>(TypeOrmProductRepository);
        repo = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findAll', () => {
        it('should return products', async () => {
            const entity = new ProductEntity();
            entity.id = '1';
            entity.name = 'Test';
            entity.price = 100;
            entity.stock = 10;
            mockRepo.find.mockResolvedValue([entity]);

            const result = await repository.findAll();
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('1');
        });
    });

    describe('findById', () => {
        it('should return product if found', async () => {
            const entity = new ProductEntity();
            entity.id = '1';
            mockRepo.findOneBy.mockResolvedValue(entity);

            const result = await repository.findById('1');
            expect(result).toBeDefined();
            expect(result?.id).toBe('1');
        });

        it('should return null if not found', async () => {
            mockRepo.findOneBy.mockResolvedValue(null);
            const result = await repository.findById('1');
            expect(result).toBeNull();
        });
    });

    describe('updateStock', () => {
        it('should update stock', async () => {
            mockRepo.update.mockResolvedValue(undefined);
            await repository.updateStock('1', 5);
            expect(mockRepo.update).toHaveBeenCalledWith('1', { stock: 5 });
        });
    });

    describe('seed', () => {
        it('should save products', async () => {
            const product = new Product('1', 'Name', 'Desc', 100, 10, 'url');
            mockRepo.save.mockResolvedValue(undefined);
            await repository.seed([product]);
            expect(mockRepo.save).toHaveBeenCalled();
        });
    });
});
