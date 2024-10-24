import { BadRequestException, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { NearbyHotelsDto, HotelDto, NearbyHotelsResponseDto } from './dto/nearby-hotels.dto';
import { PopularFoodsRestaurantsDto, RestaurantDto, PopularFoodsRestaurantsResponseDto } from './dto/popular-foods-restaurants.dto';
import { AccommodationsDto, AccommodationDto, AccommodationsResponseDto } from './dto/accommodations.dto';
import { TravelRecommendationsDto, TravelRecommendationsResponseDto } from './dto/travel-recommendations.dto';
import OpenAI from 'openai';
import { ForecastRequestDto, ForecastResponseDto, DailyForecast } from './dto/forecast.dto';
import { TripPlanDto } from './dto/trip-plan.dto';
import { TripPlan } from './schemas/trip-plan.schema';
import { TripImage } from './schemas/trip-image.schema'; // Import the TripImage schema
import mongoose from "mongoose";

@Injectable()
export class TransportsService {
    private readonly mapApiKey: string;
    private readonly openai: OpenAI;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
        @InjectModel('TripPlan') private tripPlanModel: Model<TripPlan>,
        @InjectModel('TripImage') private tripImageModel: Model<TripImage> // Inject the TripImage model
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
                name: a?.name,
                price: a?.price,
                placeId: a?.placeId,
                latitude: match ? match?.latitude : null,
                longitude: match ? match?.longitude : null,
                photos: match ? match?.photos : null,
                ...match
            };
        });

        const mealPlansWithLocation = recommendations.mealPlans.map((m: any) => {
            const match = restaurantsResponse.restaurants.find(rest => rest.placeId === m.placeId);
            return {
                name: m?.name,
                price: m?.price,
                placeId: m?.placeId,
                latitude: match ? match?.latitude : null,
                longitude: match ? match?.longitude : null,
                ...match
            };
        });

        const transportationWithLocation = recommendations.transportation.map((t: any) => {
            return {
                type: t?.type,
                price: t?.price,
                placeId: t?.placeId, 
                latitude: null,
                longitude: null
            };
        });

       
        return {
            destination: params?.destination,
            duration: params?.duration,
            accommodations: accommodationsWithLocation,
            mealPlans: mealPlansWithLocation,
            transportation: transportationWithLocation
        };
    } catch (error) {
        console.error('Error getting travel recommendations:', error);
        throw error;
    }
}

    async getForecast(params: ForecastRequestDto): Promise<ForecastResponseDto> {
        try {
            // Get coordinates for the location
            const geocodeResponse = await firstValueFrom(this.httpService.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: params.location,
                    key: this.mapApiKey
                }
            }));

            const location = geocodeResponse.data.results[0].geometry.location;

            // Get weather forecast
            const forecastResponse = await firstValueFrom(this.httpService.get('https://api.openweathermap.org/data/2.5/onecall', {
                params: {
                    lat: location.lat,
                    lon: location.lng,
                    exclude: 'current,minutely,hourly,alerts',
                    units: 'metric',
                    appid: this.configService.get<string>('OPEN_WEATHER_API_KEY')
                }
            }));

            const startDate = new Date(params.startDate);
            const endDate = new Date(params.endDate);

            const forecast: DailyForecast[] = forecastResponse.data.daily
                .filter((day: any) => {
                    const date = new Date(day.dt * 1000);
                    return date >= startDate && date <= endDate;
                })
                .map((day: any) => ({
                    date: new Date(day.dt * 1000).toISOString().split('T')[0],
                    temperature: {
                        min: day.temp.min,
                        max: day.temp.max
                    },
                    description: day.weather[0].description,
                    humidity: day.humidity,
                    windSpeed: day.wind_speed
                }));

            return {
                location: params.location,
                latitude: location.lat,
                longitude: location.lng,
                forecast: forecast
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error fetching forecast:', error.response?.data || error);
            }
            throw error;
        }
    }

    async storeTripPlan(tripPlanDto: TripPlanDto): Promise<TripPlan> {
        const createdTripPlan = await this.tripPlanModel.create(tripPlanDto);
        return createdTripPlan
    }

    async getTripDetails(username: string): Promise<any> {
        const tripPlans = await this.tripPlanModel.find({ username }).exec();
        if (!tripPlans || tripPlans.length === 0) {
            throw new BadRequestException('Trip plan not found');
        }

        const tripDetails = await Promise.all(tripPlans.map(async (plan) => {
            const accommodationDetails = await this.getPlaceDetails(plan.accommodation);
            const mealPlanDetails = await this.getPlaceDetails(plan.mealPlan);
            return {
                username: plan.username,
                destination: plan.destination,
                accommodation: accommodationDetails,
                mealPlan: mealPlanDetails,
                _id: plan._id
            };
        }));

        return tripDetails;
    }

    async storeTripImages(tripId: string, files: Array<any>): Promise<TripImage[]> {
        const tripImages = files.map(file => ({
            tripId: new Types.ObjectId(tripId),
            filename: file.filename,
            path: file.path,
            originalName: file.originalname,
        }));

        return this.tripImageModel.insertMany(tripImages);
    }

    async getTripById(id: string): Promise<any> {
        try {
            const tripPlan = await this.tripPlanModel.findById(id).exec();
            if (!tripPlan) {
                throw new BadRequestException('Trip plan not found');
            }

            const accommodationDetails = await this.getPlaceDetails(tripPlan.accommodation);
            const mealPlanDetails = await this.getPlaceDetails(tripPlan.mealPlan);

            const tripImages = await this.tripImageModel.find({ tripId: new mongoose.Types.ObjectId(id) }).exec();

            return {
                username: tripPlan.username,
                destination: tripPlan.destination,
                accommodation: accommodationDetails,
                mealPlan: mealPlanDetails,
                images: tripImages.map(image => ({
                    filename: image.filename,
                    path: image.path,
                    originalName: image.originalName,
                })),
            };
        } catch (error) {
            console.error('Error fetching trip by ID:', error);
            throw error;
        }
    }

    

    
}
