import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTransactionRepository } from './typeorm-transaction.repository';
import { TransactionEntity } from '../entities/transaction.entity';
import { Transaction, TransactionStatus } from '../../../domain/entities/transaction';
import { Product } from '../../../domain/entities/product';
import { Delivery, DeliveryStatus } from '../../../domain/entities/delivery';
import { Customer } from '../../../domain/entities/customer';

describe('TypeOrmTransactionRepository', () => {
    let repository: TypeOrmTransactionRepository;
    let repo: Repository<TransactionEntity>;

    const mockRepo = {
        save: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TypeOrmTransactionRepository,
                {
                    provide: getRepositoryToken(TransactionEntity),
                    useValue: mockRepo,
                },
            ],
        }).compile();

        repository = module.get<TypeOrmTransactionRepository>(TypeOrmTransactionRepository);
        repo = module.get<Repository<TransactionEntity>>(getRepositoryToken(TransactionEntity));
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    const createDomainTransaction = () => {
        const product = new Product('1', 'Prod', 'Desc', 100, 10, 'url');
        const customer = new Customer('1', 'John', 'john@test.com', '123', 'Address', 'City');
        const delivery = new Delivery('1', DeliveryStatus.PENDING, 10, customer);
        return new Transaction('1', 110, 'COP', TransactionStatus.PENDING, 'REF-1', product, delivery, new Date());
    };

    describe('save', () => {
        it('should save and return transaction', async () => {
            const transaction = createDomainTransaction();

            // Mock what save returns (the entity with IDs)
            mockRepo.save.mockImplementation((entity) => Promise.resolve({
                ...entity,
                id: '1',
                product: {
                    id: transaction.product.id, name: 'Prod', description: 'Desc', price: 100, stock: 10, imgUrl: 'url'
                },
                delivery: {
                    id: transaction.delivery.id, status: transaction.delivery.status, fee: transaction.delivery.fee,
                    customer: {
                        id: transaction.delivery.customer.id, fullName: 'John', email: 'john@test.com', phoneNumber: '123', address: 'Address', city: 'City'
                    }
                }
            }));

            const result = await repository.save(transaction);
            expect(mockRepo.save).toHaveBeenCalled();
            expect(result.id).toBe('1');
            expect(result.product.id).toBe(transaction.product.id);
        });

        it('should save transaction with new sub-entities (no IDs)', async () => {
            const product = new Product('1', 'Prod', 'Desc', 100, 10, 'url');
            const customer = new Customer('', 'John', 'john@test.com', '123', 'Address', 'City');
            const delivery = new Delivery('', DeliveryStatus.PENDING, 10, customer);
            const transaction = new Transaction('', 110, 'COP', TransactionStatus.PENDING, 'REF-1', product, delivery, new Date());

            mockRepo.save.mockImplementation((entity) => Promise.resolve({
                ...entity,
                id: '2',
                delivery: { ...entity.delivery, id: '2', customer: { ...entity.delivery.customer, id: '2' } }
            }));

            await repository.save(transaction);
            expect(mockRepo.save).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return found transaction', async () => {
            const entity = {
                id: '1',
                amount: 110,
                currency: 'COP',
                status: 'PENDING',
                reference: 'REF-1',
                createdAt: new Date(),
                product: { id: '1', name: 'Prod', description: 'Desc', price: 100, stock: 10, imgUrl: 'url' },
                delivery: {
                    id: '1', status: 'PENDING', fee: 10,
                    customer: {
                        id: '1', fullName: 'John', email: 'john@test.com', phoneNumber: '123', address: 'Address', city: 'City'
                    }
                }
            };
            mockRepo.findOne.mockResolvedValue(entity);

            const result = await repository.findById('1');
            expect(result).toBeDefined();
            expect(result?.product.name).toBe('Prod');
        });

        it('should return null if not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);
            const result = await repository.findById('1');
            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update specific fields', async () => {
            const transaction = createDomainTransaction();
            mockRepo.update.mockResolvedValue(undefined);

            await repository.update(transaction);

            expect(mockRepo.update).toHaveBeenCalledWith('1', {
                status: transaction.status,
                externalTransactionId: "",
            });
        });
    });
});
