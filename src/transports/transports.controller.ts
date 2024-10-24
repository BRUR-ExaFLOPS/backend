import { Controller, Get, Query, ValidationPipe } from "@nestjs/common";
import { TransportsService } from './transports.service';
import { DistanceMatrixDto, DistanceMatrixResponseDto } from './dto/distance-matrix.dto';
import { NearbyHotelsDto, NearbyHotelsResponseDto } from './dto/nearby-hotels.dto';
import { PopularFoodsRestaurantsDto, PopularFoodsRestaurantsResponseDto } from './dto/popular-foods-restaurants.dto';
import { AccommodationsDto, AccommodationsResponseDto } from './dto/accommodations.dto';
import { TravelRecommendationsDto, TravelRecommendationsResponseDto } from './dto/travel-recommendations.dto';

@Controller('/travel')
export class TransportsController {
    constructor(private readonly transportsService: TransportsService) {}

    @Get("distance-matrix")
    async getDistanceMatrix(
        @Query(ValidationPipe) query: DistanceMatrixDto
    ): Promise<DistanceMatrixResponseDto> {
        const result = await this.transportsService.getDistanceMatrix(query.origin, query.destination);
        
        return {
            origin: query.origin,
            destination: query.destination,
            distance: result?.rows[0]?.elements[0]?.distance?.text,
            duration: result?.rows[0]?.elements[0]?.duration?.text
        };
    }

    @Get("nearby-hotels")
    async getNearbyHotels(
        @Query(ValidationPipe) query: NearbyHotelsDto
    ): Promise<NearbyHotelsResponseDto> {
        return await this.transportsService.getNearbyHotels(query);
    }

    @Get("popular-foods-restaurants")
    async getPopularFoodsRestaurants(
        @Query(ValidationPipe) query: PopularFoodsRestaurantsDto
    ): Promise<PopularFoodsRestaurantsResponseDto> {
        return await this.transportsService.getPopularFoodsRestaurants(query);
    }

    @Get('accommodations')
    async getAccommodations(
        @Query(new ValidationPipe({ transform: true })) params: AccommodationsDto
    ): Promise<AccommodationsResponseDto> {
        return this.transportsService.getAccommodations(params);
    }

    @Get('travel-recommendations')
    async getTravelRecommendations(
        @Query(new ValidationPipe({ transform: true })) params: TravelRecommendationsDto
    ): Promise<TravelRecommendationsResponseDto> {
        return this.transportsService.getTravelRecommendations(params);
    }
}
