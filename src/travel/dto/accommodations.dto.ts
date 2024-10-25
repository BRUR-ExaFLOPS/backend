import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AccommodationsDto {
    @IsString()
    location: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(50000)
    radius: number = 5000; // Default radius of 5km

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(20)
    limit: number = 10; // Default limit of 10 results
}

export class AccommodationDto {
    name: string;
    address: string;
    rating: number;
    userRatingsTotal: number;
    latitude: number;
    longitude: number;
    placeId: string;
    types: string[];
    priceLevel?: number;
    openingHours: string[];
    photos: string[];
}

export class AccommodationsResponseDto {
    location: string;
    latitude: number;
    longitude: number;
    accommodations: AccommodationDto[];
}
