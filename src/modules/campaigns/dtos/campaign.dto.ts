import {
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsUrl,
  Min,
  MaxLength,
  MinLength,
  IsObject,
} from 'class-validator';
import { CampaignCategory, CampaignStatus } from '../schemas/campaign.schema';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCampaignDto {
  @IsString()
  @MinLength(10, { message: 'Title must be at least 10 characters' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsString()
  @MinLength(50, { message: 'Description must be at least 50 characters' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description: string;

  @IsNumber()
  @Min(100, { message: 'Goal amount must be at least 100' })
  goalAmount: number;

  @IsEnum(CampaignCategory)
  category: CampaignCategory;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsObject()
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    swiftCode?: string;
  };
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
