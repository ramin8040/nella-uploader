import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ImportDriveDto {
  @IsString()
  @IsNotEmpty({ message: 'پیوند یا شناسه گوگل درایو الزامی است' })
  driveUrl: string;

  @IsString()
  @IsOptional()
  customTitle?: string;

  @IsString()
  @IsOptional()
  customArtist?: string;
}
