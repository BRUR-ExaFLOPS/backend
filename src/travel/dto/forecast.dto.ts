import { IsString, IsDateString } from 'class-validator';

export class ForecastRequestDto {
  @IsString()
  location: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class DailyForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  description: string;
  humidity: number;
  windSpeed: number;
}

export class ForecastResponseDto {
  location: string;
  latitude: number;
  longitude: number;
  forecast: DailyForecast[];
}
