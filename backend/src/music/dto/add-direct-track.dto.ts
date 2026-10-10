import { IsNotEmpty, IsString, IsOptional, IsUrl, IsNumber } from 'class-validator';

export class AddDirectTrackDto {
  @IsString()
  @IsNotEmpty({ message: 'لینک مستقیم آهنگ الزامی است' })
  directUrl: string;

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

export class ProbeUrlDto {
  @IsString()
  @IsNotEmpty({ message: 'نشانی اینترنتی الزامی است' })
  url: string;
}
