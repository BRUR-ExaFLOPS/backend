import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { TransportsService } from "./transports.service";
import { TransportsController } from "./transports.controller";
import { PhotoController } from "./photo.controller";

@Module({
    imports: [
        HttpModule,
        ConfigModule
    ],
    providers: [TransportsService],
    controllers: [TransportsController, PhotoController]
})
export class TransportsModule {}
