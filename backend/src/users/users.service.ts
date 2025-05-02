import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      omit: {
        hashedPassword: true,
      },
      where: {
        id: userId,
      },
    });
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...updateUserDto,
      },
      omit: {
        hashedPassword: true,
      },
    });
  }
}
