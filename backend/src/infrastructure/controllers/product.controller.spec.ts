import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductRepositoryPort } from '../../domain/ports/spi/product-repository.port';
import { Product } from '../../domain/entities/product';

jest.mock('uuid', () => ({
    v4: () => 'test-uuid',
}));

describe('ProductController', () => {
    let controller: ProductController;
    let repo: ProductRepositoryPort;

    const mockRepo = {
        findAll: jest.fn(),
        seed: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [
                {
                    provide: ProductRepositoryPort,
                    useValue: mockRepo,
                },
            ],
        }).compile();

        controller = module.get<ProductController>(ProductController);
        repo = module.get<ProductRepositoryPort>(ProductRepositoryPort);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getProducts', () => {
        it('should return an array of products', async () => {
            const result: Product[] = [
                new Product('1', 'Test', 'Desc', 100, 10, 'url'),
            ];
            mockRepo.findAll.mockResolvedValue(result);

            expect(await controller.getProducts()).toBe(result);
        });
    });

    describe('seedProducts', () => {
        it('should seed products', async () => {
            mockRepo.seed.mockResolvedValue(undefined);
            const result = await controller.seedProducts();
            expect(result).toEqual({
                message: 'Products seeded successfully',
                count: 3,
            });
            expect(mockRepo.seed).toHaveBeenCalled();
        });
    });
});
