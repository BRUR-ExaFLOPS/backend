import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransportsModule } from './transports/transports.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TransportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
