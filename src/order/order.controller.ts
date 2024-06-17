import { RolesGuard } from '@auth/guards/role.guard';
import { JwtPayload } from '@auth/interfaces';
import { CurrentUser, Roles } from '@common/decorators';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Order, Role } from '@prisma/client';
import { CreateOrderDto } from './dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Patch(':id')
  async updateOrder(@Param('id') id: number, @Body() orderData: Partial<Order>, @CurrentUser() user: JwtPayload) {
    const telegramNotification: { text: string; userRole: string } = { text: '', userRole: '' };
    if (user.roles.includes(Role.ADMIN) || user.roles.includes(Role.COURIER)) {
      telegramNotification.text = `🚀Ваш заказ №${id} был обновлен!`;
      telegramNotification.userRole = 'user';
    }
    if ('courierId' in orderData) {
      telegramNotification.text = `🚚Получен новый заказ на доставку №${id}`;
      telegramNotification.userRole = 'courier';
    }
    console.log(telegramNotification);
    return this.orderService.updateOrder(Number(id), orderData, telegramNotification, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.COURIER)
  @Get('courier/:courierId')
  async getCourierOrders(@Param('courierId') courierId: string): Promise<Order[]> {
    return this.orderService.getCourierOrders(courierId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('all')
  async getAllOrders(): Promise<Order[]> {
    try {
      const orders = await this.orderService.getAllOrders();
      return orders;
    } catch (error) {
      throw new Error('Ошибка полученя заказов');
    }
  }

  @Get('user/:customerId')
  async getUserOrders(@Param('customerId') customerId: string): Promise<Order[]> {
    return this.orderService.getUserOrders(customerId);
  }

  @Get(':id/with-items')
  async getOrderWithItems(@Param('id') id: number): Promise<Order> {
    return this.orderService.getOrderWithItems(Number(id));
  }

  @Get(':id')
  async getOrderById(@Param('id') id: number): Promise<Order> {
    return this.orderService.getOrderById(Number(id));
  }

  @Post('createQR')
  async createOrderQR(@Body() file_path: Partial<Order>, @CurrentUser() user: JwtPayload) {
    this.orderService.createOrderQR(file_path.qr, user.id);
  }

  @Post('create')
  async createOrder(@Body() orderData: CreateOrderDto, @CurrentUser() user: JwtPayload) {
    return this.orderService.createOrder(orderData, user.id);
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: number): Promise<void> {
    return this.orderService.deleteOrder(Number(id));
  }
}
