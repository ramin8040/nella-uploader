import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateTrackDto {
  @IsString()
  @IsNotEmpty({ message: 'عنوان آهنگ الزامی است' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'نام هنرمند الزامی است' })
  artist: string;

  @IsString()
  @IsOptional()
  album?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;
}
