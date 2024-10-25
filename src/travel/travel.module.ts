import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { TravelService } from "./travel.service";
import { TravelController } from "./travel.controller";
import { PhotoController } from "./photo.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { TripPlan, TripPlanSchema } from "./schemas/trip-plan.schema";
import { TripImage, TripImageSchema } from "./schemas/trip-image.schema";
import { SchedulerService } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        HttpModule,
        ConfigModule,
        MongooseModule.forFeature([{
            name: TripPlan.name,
            schema: TripPlanSchema
        }, {
            name: TripImage.name,
            schema: TripImageSchema
        }]),
        ScheduleModule.forRoot()
    ],
    providers: [TravelService, SchedulerService],
    controllers: [TravelController, PhotoController]
})
export class TravelModule {}
