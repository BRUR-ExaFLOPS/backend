import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { NearbyHotelsDto, HotelDto, NearbyHotelsResponseDto } from './dto/nearby-hotels.dto';
import { PopularFoodsRestaurantsDto, RestaurantDto, PopularFoodsRestaurantsResponseDto } from './dto/popular-foods-restaurants.dto';
import { AccommodationsDto, AccommodationDto, AccommodationsResponseDto } from './dto/accommodations.dto';
import { TravelRecommendationsDto, TravelRecommendationsResponseDto } from './dto/travel-recommendations.dto';
import OpenAI from 'openai';

@Injectable()
export class TransportsService {
    private readonly mapApiKey: string;
    private readonly openai: OpenAI;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService
    ) {
        this.mapApiKey = this.configService.get<string>('MAP_API_KEY');
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async getDistanceMatrix(origin: string, destination: string) {
        try {
            const response = await firstValueFrom(this.httpService.get('https://maps.googleapis.com/maps/api/distancematrix/json', 
                {
                    params: {
                        origins: origin,
                        destinations: destination,
                        key: this.mapApiKey
                    }
                }
            ));

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error fetching directions:', error.response?.data || error);
            }
            throw error;
        }
    }

    async getNearbyHotels(params: NearbyHotelsDto): Promise<NearbyHotelsResponseDto> {
        try {
            
            const geocodeResponse = await firstValueFrom(this.httpService.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: params.destination,
                    key: this.mapApiKey
                }
            }));

            const location = geocodeResponse.data.results[0].geometry.location;

            
            const placesResponse = await firstValueFrom(this.httpService.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
                params: {
                    location: `${location.lat},${location.lng}`,
                    radius: params.radius,
                    type: 'lodging',
                    key: this.mapApiKey
                }
            }));

            const hotels: HotelDto[] = placesResponse.data.results
                .slice(0, params.limit)
                .map(place => ({
                    name: place.name,
                    address: place.vicinity,
                    rating: place.rating,
                    userRatingsTotal: place.user_ratings_total,
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng,
                    placeId: place.place_id,
                    types: place.types
                }));

            return {
                destination: params.destination,
                latitude: location.lat,
                longitude: location.lng,
                hotels: hotels
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error fetching nearby hotels:', error.response?.data || error);
            }
            throw error;
        }
    }

    async getPopularFoodsRestaurants(params: PopularFoodsRestaurantsDto): Promise<PopularFoodsRestaurantsResponseDto> {
        try {
            
            const geocodeResponse = await firstValueFrom(this.httpService.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: params.location,
                    key: this.mapApiKey
                }
            }));

            const location = geocodeResponse.data.results[0].geometry.location;

            
            const placesResponse = await firstValueFrom(this.httpService.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
                params: {
                    location: `${location.lat},${location.lng}`,
                    radius: params.radius,
                    type: 'restaurant',
                    rankby: 'prominence',
                    key: this.mapApiKey
                }
            }));

            const restaurants: RestaurantDto[] = await Promise.all(
                placesResponse.data.results
                    .slice(0, params.limit)
                    .map(async place => {
                        const details = await this.getPlaceDetails(place.place_id);
                        return {
                            name: place.name,
                            address: place.vicinity,
                            rating: place.rating,
                            userRatingsTotal: place.user_ratings_total,
                            latitude: place.geometry.location.lat,
                            longitude: place.geometry.location.lng,
                            placeId: place.place_id,
                            types: place.types,
                            priceLevel: place.price_level,
                            openingHours: details.opening_hours?.weekday_text || [],
                        };
                    })
            );

            return {
                location: params.location,
                latitude: location.lat,
                longitude: location.lng,
                restaurants: restaurants
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error fetching popular foods and restaurants:', error.response?.data || error);
            }
            throw error;
        }
    }

    private async getPlaceDetails(placeId: string) {
        try {
            const response = await firstValueFrom(this.httpService.get('https://maps.googleapis.com/maps/api/place/details/json', {
                params: {
                    place_id: placeId,
                    fields: 'opening_hours,photos',
                    key: this.mapApiKey
                }
            }));
            return response.data.result;
        } catch (error) {
            console.error('Error fetching place details:', error);
            return {};
        }
    }

async getAccommodations(params: AccommodationsDto): Promise<AccommodationsResponseDto> {
    try {
        const geocodeResponse = await firstValueFrom(this.httpService.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: params.location,
                key: this.mapApiKey
            }
        }));

        const location = geocodeResponse.data.results[0].geometry.location;

        const placesResponse = await firstValueFrom(this.httpService.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
                location: `${location.lat},${location.lng}`,
                radius: params.radius,
                type: 'lodging',
                rankby: 'prominence',
                key: this.mapApiKey
            }
        }));

        const accommodations: AccommodationDto[] = await Promise.all(
            placesResponse.data.results
                .slice(0, params.limit)
                .map(async place => {
                    const details = await this.getPlaceDetails(place.place_id);

                    const photoUrls = details.photos
                        ? details.photos.slice(0, 5).map(photo => 
                            `/photos?photoReference=${photo.photo_reference}&maxWidth=400` // Proxy URL
                        )
                        : [];

                    return {
                        name: place.name,
                        address: place.vicinity,
                        rating: place.rating,
                        userRatingsTotal: place.user_ratings_total,
                        latitude: place.geometry.location.lat,
                        longitude: place.geometry.location.lng,
                        placeId: place.place_id,
                        types: place.types,
                        priceLevel: place.price_level,
                        openingHours: details.opening_hours?.weekday_text || [],
                        photos: photoUrls
                    };
                })
        );

        return {
            location: params.location,
            latitude: location.lat,
            longitude: location.lng,
            accommodations: accommodations
        };
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error fetching accommodations:', error.response?.data || error);
        }
        throw error;
    }
}

    

async getTravelRecommendations(params: TravelRecommendationsDto): Promise<TravelRecommendationsResponseDto> {
    try {
        
        const accommodationsParams: AccommodationsDto = {
            location: params.destination,
            radius: 5000,
            limit: 3
        };
        const accommodationsResponse = await this.getAccommodations(accommodationsParams);
        
        
        const restaurantsParams: PopularFoodsRestaurantsDto = {
            location: params.destination,
            radius: 5000,
            limit: 3
        };
        const restaurantsResponse = await this.getPopularFoodsRestaurants(restaurantsParams);
        
        
        const accommodationsList = accommodationsResponse.accommodations.map(a => 
            `${a.name} at ${a.address} (placeId: ${a.placeId}) with a rating of ${a.rating}`
        );
        const restaurantsList = restaurantsResponse.restaurants.map(r => 
            `${r.name} at ${r.address} (placeId: ${r.placeId}) with a rating of ${r.rating}`
        );
        
        const prompt = `Based on the following data, provide a travel plan for a trip to ${params.destination} for ${params.duration} days. Include pricing for accommodations, meal plans, and transportation options. Use the placeId for each entry to enable further location queries:
        Accommodations: ${accommodationsList.join(', ')}
        Restaurants: ${restaurantsList.join(', ')}
        Format the response as a JSON object with keys: accommodations, mealPlans, transportation. Each should be an array of objects with name, price, and placeId keys.`;
        
        const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 500,
        });
        
        const content = response.choices[0].message.content;
        const recommendations = JSON.parse(content);

        
        const accommodationsWithLocation = recommendations.accommodations.map((a: any) => {
            const match = accommodationsResponse.accommodations.find(acc => acc.placeId === a.placeId);
            return {
                name: a.name,
                price: a.price,
                placeId: a.placeId,
                latitude: match ? match.latitude : null,
                longitude: match ? match.longitude : null,
                photos: match ? match.photos : null,
                ...match
            };
        });

        const mealPlansWithLocation = recommendations.mealPlans.map((m: any) => {
            const match = restaurantsResponse.restaurants.find(rest => rest.placeId === m.placeId);
            return {
                name: m.name,
                price: m.price,
                placeId: m.placeId,
                latitude: match ? match.latitude : null,
                longitude: match ? match.longitude : null
            };
        });

        const transportationWithLocation = recommendations.transportation.map((t: any) => {
            
            return {
                type: t.type,
                price: t.price,
                placeId: t.placeId, 
                latitude: null,
                longitude: null
            };
        });

       
        return {
            destination: params.destination,
            duration: params.duration,
            accommodations: accommodationsWithLocation,
            mealPlans: mealPlansWithLocation,
            transportation: transportationWithLocation
        };
    } catch (error) {
        console.error('Error getting travel recommendations:', error);
        throw error;
    }
}


}
