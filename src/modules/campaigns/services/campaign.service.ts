import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Campaign,
  CampaignDocument,
  CampaignStatus,
} from '../schemas/campaign.schema';
import { CreateCampaignDto, UpdateCampaignDto } from '../dtos';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name)
    private campaignModel: Model<CampaignDocument>,
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto,
    userId: string,
  ): Promise<Campaign> {
    try {
      const startDate = new Date(createCampaignDto.startDate);
      const endDate = new Date(createCampaignDto.endDate);
      const now = new Date();

      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }

      if (endDate <= now) {
        throw new BadRequestException('End date must be in the future');
      }

      const campaign = new this.campaignModel({
        ...createCampaignDto,
        createdBy: userId,
        status: CampaignStatus.DRAFT,
      });

      return campaign.save();
    } catch (error) {
      throw error;
    }
  }

  async findAll(filters?: {
    status?: CampaignStatus;
    category?: string;
    createdBy?: string;
    search?: string;
    isFeatured?: boolean;
    isPublic?: boolean;
  }) {
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.createdBy) {
      query.createdBy = filters.createdBy;
    }

    if (filters?.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }

    if (filters?.isPublic !== undefined) {
      query.isPublic = filters.isPublic;
    } else {
      query.isPublic = true;
    }

    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return this.campaignModel
      .find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignModel
      .findById(id)
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    await this.campaignModel.findByIdAndUpdate(id, {
      $inc: { viewCount: 1 },
    });

    return campaign;
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
    userId: string,
  ): Promise<Campaign> {
    try {
      const campaign = await this.campaignModel.findById(id);

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      if (campaign.createdBy.toString() !== userId) {
        throw new ForbiddenException('You can only update your own campaigns');
      }

      if (updateCampaignDto.startDate || updateCampaignDto.endDate) {
        const startDate = updateCampaignDto.startDate
          ? new Date(updateCampaignDto.startDate)
          : campaign.startDate;
        const endDate = updateCampaignDto.endDate
          ? new Date(updateCampaignDto.endDate)
          : campaign.endDate;

        if (startDate >= endDate) {
          throw new BadRequestException('End date must be after start date');
        }
      }

      const updatedCampaign = await this.campaignModel
        .findByIdAndUpdate(id, updateCampaignDto, { new: true })
        .populate('createdBy', 'firstName lastName email')
        .exec();

      if (!updatedCampaign) {
        throw new InternalServerErrorException('Error in updating campaign');
      }

      return updatedCampaign;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const campaign = await this.campaignModel.findById(id);

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      if (campaign.createdBy.toString() !== userId) {
        throw new ForbiddenException('You can only delete your own campaigns');
      }

      await this.campaignModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  async getUserCampaigns(userId: string): Promise<Campaign[]> {
    return this.campaignModel
      .find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getFeaturedCampaigns(): Promise<Campaign[]> {
    return this.campaignModel
      .find({
        isFeatured: true,
        isPublic: true,
        status: CampaignStatus.ACTIVE,
      })
      .limit(10)
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateCampaignAmount(
    campaignId: string,
    amount: number,
  ): Promise<Campaign> {
    try {
      const campaign = await this.campaignModel.findById(campaignId).lean();

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      const updatedCampaign = await this.campaignModel
        .findByIdAndUpdate(
          campaignId,
          {
            $inc: {
              currentAmount: amount,
              donationCount: 1,
            },
          },
          { new: true },
        )
        .exec();

      if (!updatedCampaign) {
        throw new InternalServerErrorException(
          'Error in updating campaign amount',
        );
      }

      return updatedCampaign;
    } catch (error) {
      throw error;
    }
  }
}
