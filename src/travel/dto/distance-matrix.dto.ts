import { IsString, IsNotEmpty } from 'class-validator';

export class DistanceMatrixDto {
  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;
}

export class DistanceMatrixResponseDto {
  origin: string;
  destination: string;
  distance: string;
  duration: string;
}
