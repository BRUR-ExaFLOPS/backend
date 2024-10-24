import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyHotelsDto {
  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  radius?: number = 10000; // Default radius of 10000 meters

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 5; // Default limit of 5 hotels
}

export class HotelDto {
  name: string;
  address: string;
  rating: number;
  userRatingsTotal: number;
  latitude: number;
  longitude: number;
  placeId: string;
  types: string[];
}

export class NearbyHotelsResponseDto {
  destination: string;
  latitude: number;
  longitude: number;
  hotels: HotelDto[];
}
