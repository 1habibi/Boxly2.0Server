import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Profile } from '@prisma/client';
import { CurrentUser } from '@common/decorators';
import { JwtPayload } from '@auth/interfaces';
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getAllProfiles() {
    return this.profileService.getAllProfiles();
  }

  // @Get(':id')
  // async getProfileById(@Param('id') id: string) {
  //   return this.profileService.getProfileById(id);
  // }

  @Get(':id')
  async getProfileByUserId(@Param('id') userId: string) {
    return this.profileService.getProfileByUserId(userId);
  }
  @Post()
  async createProfile(@Body() data: Partial<Profile>, @CurrentUser() user: JwtPayload) {
    return this.profileService.createProfile(data, user);
  }

  @Patch(':id')
  async updateProfile(@Body() data: Partial<Profile>, @Param('id') profileId: string) {
    return this.profileService.updateProfile(data, profileId);
  }
}
