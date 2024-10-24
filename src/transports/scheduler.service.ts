import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TripImage } from './schemas/trip-image.schema';
import { TransportsService } from './transports.service';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        @InjectModel('TripImage') private tripImageModel: Model<TripImage>,
        private readonly transportsService: TransportsService
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        this.logger.debug('Running scheduled task to summarize trip images');

        const imagesToSummarize = await this.tripImageModel.find({ summary: { $exists: false } }).exec();

        for (const image of imagesToSummarize) {
            try {
                const summary = await this.transportsService.analyzeImage(image.path);
                image.summary = summary;
                await image.save();
                this.logger.debug(`Summarized image: ${image.originalName}`);
            } catch (error) {
                this.logger.error(`Failed to summarize image: ${image.originalName}`, error);
            }
        }
    }
}
