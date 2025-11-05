import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

export type CampaignDocument = Campaign & Document;

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

export enum CampaignCategory {
  EDUCATION = 'education',
  HEALTH = 'health',
  COMMUNITY = 'community',
  ENVIRONMENT = 'environment',
  TECHNOLOGY = 'technology',
  ARTS = 'arts',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  goalAmount: number;

  @Prop({ default: 0, min: 0 })
  currentAmount: number;

  @Prop({ type: String, enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Prop({
    type: String,
    enum: CampaignCategory,
    required: true,
  })
  category: CampaignCategory;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: String, default: null })
  videoUrl: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  donationCount: number;

  @Prop({ type: Object, default: {} })
  bankDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    swiftCode?: string;
  };
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

CampaignSchema.index({ createdBy: 1 });
CampaignSchema.index({ status: 1, isPublic: 1 });
CampaignSchema.index({ category: 1 });
CampaignSchema.index({ isFeatured: 1 });
CampaignSchema.index({ createdAt: -1 });

CampaignSchema.virtual('fundingPercentage').get(function () {
  return this.goalAmount > 0
    ? Math.round((this.currentAmount / this.goalAmount) * 100)
    : 0;
});

CampaignSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

CampaignSchema.virtual('isExpired').get(function () {
  return new Date() > new Date(this.endDate);
});

CampaignSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret: any) {
    delete ret.__v;
    return ret;
  },
});
