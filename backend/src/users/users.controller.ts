import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { User as UserEntity } from 'src/_gen/prisma-class/user';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '코스 수정',
    type: UserEntity,
  })
  getProfile(@Req() req: Request) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Patch('profile')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '코스 수정',
    type: UserEntity,
  })
  updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.sub, updateUserDto);
  }
}
