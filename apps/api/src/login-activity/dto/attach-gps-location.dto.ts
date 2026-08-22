import { IsLatitude, IsLongitude } from 'class-validator';

export class AttachGpsLocationDto {
  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}
