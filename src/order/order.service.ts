import { JwtPayload } from '@auth/interfaces';
import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Order, Profile } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { CreateOrderDto, OrderItemDto } from './dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  async getUserOrders(customerId: string) {
    return this.prismaService.order.findMany({
      where: {
        customerId: customerId,
      },
    });
  }

  async getCourierOrders(courierId: string) {
    return this.prismaService.order.findMany({
      where: {
        courierId: courierId,
      },
    });
  }

  async getOrderById(id: number) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getOrderWithItems(orderId: number) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async createOrderQR(file_path: string, userId: string) {
    return this.prismaService.order.create({
      data: {
        customerId: userId,
        qr: file_path,
        status: 'Неизвестно',
      },
    });
  }

  async createOrder(orderData: CreateOrderDto, userId: string) {
    const { delivery_type, promo, items } = orderData;

    let newOrder;
    try {
      newOrder = await this.prismaService.order.create({
        data: {
          customerId: userId,
          deliveryType: delivery_type,
          promo,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create order');
    }

    const orderId = newOrder.id;

    try {
      await this.addItemsToOrder(orderId, items);
    } catch (error) {
      // If error occurred while adding items, delete the order
      await this.prismaService.order.delete({
        where: {
          id: orderId,
        },
      });
      throw new InternalServerErrorException('Failed to add items to order');
    }

    return newOrder;
  }

  private async addItemsToOrder(orderId: number, items: OrderItemDto[]) {
    for (const item of items) {
      await this.prismaService.orderItems.create({
        data: {
          orderId: orderId,
          url: item.url,
          count: item.count,
          note: item.note,
        },
      });
    }
  }

  async deleteOrder(id: number): Promise<void> {
    const order = await this.prismaService.order.delete({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
  }

  async getAllOrders() {
    const orders = await this.prismaService.order.findMany({
      include: {
        customer: {
          include: {
            Profile: true,
          },
        },
        items: true,
      },
    });
    return orders;
  }

  async updateOrder(
    id: number,
    data: Partial<Order>,
    telegramNotification: { text: string; userRole: string },
    user: JwtPayload,
  ): Promise<Order> {
    let profile: Profile | null = null;
    const order = await this.prismaService.order.findUnique({ where: { id } });
    if (!order) {
      throw new ConflictException(`Заказ с таким id не найден`);
    }
    if (telegramNotification.userRole === 'user') {
      profile = await this.prismaService.profile.findFirst({
        where: {
          userId: user.id,
        },
      });
      if (!profile) {
        throw new NotFoundException('Профиль пользователя не найден');
      }
    }
    if (telegramNotification.userRole === 'courier') {
      const user = await this.prismaService.user.findFirst({
        where: {
          id: data.courierId,
        },
      });
      profile = await this.prismaService.profile.findFirst({
        where: {
          userId: user.id,
        },
      });
      if (!profile) {
        throw new NotFoundException('Профиль пользователя не найден');
      }
    }
    if (telegramNotification.text !== '' && profile.telegramId) {
      await this.telegramService.sendMessageToUser(profile.telegramId, telegramNotification.text);
    }
    return this.prismaService.order
      .update({
        where: {
          id,
        },
        data,
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }
}
