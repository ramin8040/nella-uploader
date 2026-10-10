import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'نام کاربری الزامی است' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'رمز عبور الزامی است' })
  password: string;

  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
