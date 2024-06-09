import { IsString } from 'class-validator';

export class OrderItemDto {
  @IsString()
  url: string;
  count: number;
  note?: string;
}
