import { IsEmail, IsString } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail({}, { message: 'Некорректный формат электронной почты' })
  newEmail: string;

  @IsString()
  password: string;
}
