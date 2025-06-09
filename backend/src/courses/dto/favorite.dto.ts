import { ApiProperty } from '@nestjs/swagger';

export class GetFavoriteResponseDto {
  @ApiProperty({
    description: '즐겨찾기 여부',
    type: Boolean,
  })
  isFavorite: boolean;

  @ApiProperty({
    description: '전체 즐겨찾기 수',
    type: Number,
  })
  favoriteCount: number;
}
