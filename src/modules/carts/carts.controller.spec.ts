import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { CartResponseDto } from './dtos/cart-response.dto';
import { CartsService } from './carts.service';

describe('CartsController', () => {
    let controller: CartsController;
    let service: CartsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CartsController],
            providers: [
                {
                    provide: CartsService,
                    useValue: {
                        getOrCreateCart: jest.fn(),
                        addToCart: jest.fn(),
                        updateCartItem: jest.fn(),
                        removeFromCart: jest.fn(),
                        clearCart: jest.fn(),
                        mergeCart: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<CartsController>(CartsController);
        service = module.get<CartsService>(CartsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getCart', () => {
        it('should return user cart', async () => {
            const mockCart = {
                id: '1',
                userId: 'user1',
                cartItems: [],
                totalPrice: 0,
                totalItems: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(service, 'getOrCreateCart').mockResolvedValue(mockCart as unknown as CartResponseDto);

            const result = await controller.getCart('user1');

            expect(result).toBeDefined();
            expect(result.data).toEqual(mockCart);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(service.getOrCreateCart).toHaveBeenCalledWith('user1');
        });
    });
});
