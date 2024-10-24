import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { TransportsService } from "./transports.service";
import { TransportsController } from "./transports.controller";
import { PhotoController } from "./photo.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { TripPlan, TripPlanSchema } from "./schemas/trip-plan.schema";
import { TripImage, TripImageSchema } from "./schemas/trip-image.schema";

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
        }])
    ],
    providers: [TransportsService],
    controllers: [TransportsController, PhotoController]
})
export class TransportsModule {}
