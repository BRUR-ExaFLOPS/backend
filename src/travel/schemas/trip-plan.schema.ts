import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TripPlanDocument = TripPlan & Document;

@Schema()
export class TripPlan {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    destination: string;

    @Prop({ required: true })
    tripPlan: string;

    @Prop({ required: true })
    transportOption: string;

    @Prop({ required: true })
    mealPlan: string;

    @Prop({ required: true })
    accommodation: string;
}

export const TripPlanSchema = SchemaFactory.createForClass(TripPlan);
