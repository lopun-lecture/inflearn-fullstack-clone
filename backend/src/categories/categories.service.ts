import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.courseCategory.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
