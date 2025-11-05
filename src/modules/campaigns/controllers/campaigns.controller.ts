import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CampaignsService } from '../services/campaign.service';
import { CreateCampaignDto, UpdateCampaignDto } from '../dtos';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { CurrentUser, Public } from '../../../common/decorators';
import { CampaignStatus } from '../schemas/campaign.schema';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createCampaignDto: CreateCampaignDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.campaignsService.create(createCampaignDto, userId);
  }

  @Public()
  @Get()
  findAll(
    @Query('status') status?: CampaignStatus,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('isFeatured') isFeatured?: boolean,
  ) {
    return this.campaignsService.findAll({
      status,
      category,
      search,
      isFeatured,
    });
  }

  @Public()
  @Get('featured')
  getFeatured() {
    return this.campaignsService.getFeaturedCampaigns();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-campaigns')
  getUserCampaigns(@CurrentUser('userId') userId: string) {
    return this.campaignsService.getUserCampaigns(userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.campaignsService.update(id, updateCampaignDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.campaignsService.remove(id, userId);
  }
}
