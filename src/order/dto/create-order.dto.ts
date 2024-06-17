import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  // @IsIn(['Неизвестно', 'В пути', 'Доставлен на пункт выдачи', 'Получен', 'Отменен', 'Ожидает ответа'])
  delivery_type: string;

  @IsString()
  promo?: string;

  @IsArray()
  @IsNotEmpty()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
