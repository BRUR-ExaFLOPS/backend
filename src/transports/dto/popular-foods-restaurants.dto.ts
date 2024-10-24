import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PopularFoodsRestaurantsDto {
  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  radius?: number = 5000; // Default radius of 5000 meters

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10; // Default limit of 10 restaurants
}

export class RestaurantDto {
  name: string;
  address: string;
  rating: number;
  userRatingsTotal: number;
  latitude: number;
  longitude: number;
  placeId: string;
  types: string[];
  priceLevel?: number;
  photos?: string[];
  openingHours?: string[];
  photoDescriptions?: string[];  // Changed from popularDishes
}

export class PopularFoodsRestaurantsResponseDto {
  location: string;
  latitude: number;
  longitude: number;
  restaurants: RestaurantDto[];
}
