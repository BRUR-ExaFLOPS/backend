import { Optional } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsString, IsNumber, Min, IsPositive } from 'class-validator';

export class TravelRecommendationsDto {
    @IsString()
    destination: string;

    @Optional()
    origin: string;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsPositive()
    duration: number;
}

export class TravelRecommendationsResponseDto {
    destination: string;
    duration: number;
    accommodations: {
        name: string;
        price: string;
        placeId: string;
    }[];
    mealPlans: {
        name: string;
        price: string;
        placeId: string;
    }[];
    transportation: {
        type: string;
        price: string;
        placeId: string;
    }[];
}
