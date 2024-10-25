import { IsString } from 'class-validator';

export class TripPlanDto {
    @IsString()
    username: string;

    @IsString()
    destination: string;

    @IsString()
    tripPlan: string;

    @IsString()
    transportOption: string;

    @IsString()
    mealPlan: string;

    @IsString()
    accommodation: string;
}
