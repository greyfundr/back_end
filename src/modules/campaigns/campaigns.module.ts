import { Module } from '@nestjs/common';
import { CampaignsService } from './services/campaigns.service';
import { CampaignsController } from './controllers/campaigns.controller';

@Module({
  providers: [CampaignsService],
  controllers: [CampaignsController]
})
export class CampaignsModule {}
