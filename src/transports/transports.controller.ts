import { Controller, Get, Post, Query, Body, ValidationPipe, BadRequestException, Param } from "@nestjs/common";
import { TransportsService } from './transports.service';
import { DistanceMatrixDto, DistanceMatrixResponseDto } from './dto/distance-matrix.dto';
import { NearbyHotelsDto, NearbyHotelsResponseDto } from './dto/nearby-hotels.dto';
import { PopularFoodsRestaurantsDto, PopularFoodsRestaurantsResponseDto } from './dto/popular-foods-restaurants.dto';
import { AccommodationsDto, AccommodationsResponseDto } from './dto/accommodations.dto';
import { TravelRecommendationsDto, TravelRecommendationsResponseDto } from './dto/travel-recommendations.dto';
import { TripPlanDto } from './dto/trip-plan.dto';
import {
    UploadedFiles,
    UseInterceptors,
  } from '@nestjs/common';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { TripImage } from './schemas/trip-image.schema';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';

@Controller('/travel')
export class TransportsController {
    constructor(
        private readonly transportsService: TransportsService,
        @InjectModel('TripImage') private tripImageModel: Model<TripImage>
    ) {}

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

    @Post('store-trip-plan')
    async storeTripPlan(
        @Body(ValidationPipe) tripPlanDto: TripPlanDto
    ): Promise<TripPlanDto> {
        return this.transportsService.storeTripPlan(tripPlanDto);
    }

    @Get('trip-details')
    async getTripDetails(
        @Query('username') username: string
    ): Promise<any> {
        try{
            return this.transportsService.getTripDetails(username);
        }catch(e) {
            throw new BadRequestException(e)
        }
    }

    @Post('upload')
    @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          // Generate a unique filename
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const originalName = file.originalname.replace(/\s+/g, '_');
          const filename = `${uniqueSuffix}-${originalName}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow only image files
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    }),
  )
  uploadMultipleFiles(@UploadedFiles() files: Array<any>) {
    // Process uploaded files
    const response = files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
    }));
    return {
      message: 'Files uploaded successfully',
      data: response,
    };
  }

    @Post('upload-trip-images')
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            storage: diskStorage({
                destination: './uploads/trip-images',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const originalName = file.originalname.replace(/\s+/g, '_');
                    const filename = `${uniqueSuffix}-${originalName}`;
                    callback(null, filename);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                    return callback(new Error('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    async uploadTripImages(
        @UploadedFiles() files: Array<any>,
        @Query('tripId') tripId: string
    ) {
        const tripImages = await this.transportsService.storeTripImages(tripId, files);
        return {
            message: 'Trip images uploaded successfully',
            data: tripImages,
        };
    }

    @Get('trip/:id')
    async getTripById(
        @Param('id') id: string
    ): Promise<any> {
        try {
            return await this.transportsService.getTripById(id);
        } catch (e) {
            throw new BadRequestException(e);
        }
    }

    @Get('generate-blog/:id')
    async generateBlog(
        @Param('id') id: string
    ): Promise<any> {
        try {
            return await this.transportsService.generateBlog(id);
        } catch (e) {
            throw new BadRequestException(e);
        }
    }
}
