import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TripImageDocument = TripImage & Document;

@Schema()
export class TripImage {
    @Prop({ type: Types.ObjectId, ref: 'TripPlan', required: true })
    tripId: Types.ObjectId;

    @Prop({ required: true })
    filename: string;

    @Prop({ required: true })
    path: string;

    @Prop({ required: true })
    originalName: string;

    @Prop()
    summary: string; // Add a field to store the image summary
}

export const TripImageSchema = SchemaFactory.createForClass(TripImage);
