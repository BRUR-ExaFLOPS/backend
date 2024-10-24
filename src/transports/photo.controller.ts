import { Injectable, Controller, Get, Query, Res } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Response } from 'express';
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from 'rxjs';

@Injectable()
@Controller('photos')
export class PhotoController {
    private readonly mapApiKey: string;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService
    ) {
        this.mapApiKey = this.configService.get<string>('MAP_API_KEY');
    }

    @Get()
    async getPhoto(@Query('photoReference') photoReference: string, @Query('maxWidth') maxWidth: number, @Res() res: Response) {
        try {
            const response = await firstValueFrom(
                this.httpService.get('https://maps.googleapis.com/maps/api/place/photo', {
                    params: {
                        photoreference: photoReference,
                        maxwidth: maxWidth || 400, // Default to 400 if not provided
                        key: this.mapApiKey
                    },
                    responseType: 'stream', // Stream the photo response
                })
            );
            res.set('Content-Type', response.headers['content-type']);
            response.data.pipe(res); // Stream the photo directly to the client
        } catch (error) {
            res.status(500).send('Error fetching photo');
        }
    }
}
