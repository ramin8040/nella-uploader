import { IsOptional, IsString } from 'class-validator';

export class UpdateTrackDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  artist?: string;

  @IsString()
  @IsOptional()
  album?: string;
}
