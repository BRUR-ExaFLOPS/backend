import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransportsModule } from './transports/transports.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookController } from './webhook/webhook.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TransportsModule,
  ],
  controllers: [AppController, WebhookController],
  providers: [AppService],
})
export class AppModule {}
