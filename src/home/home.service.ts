import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateHomeDto,
  HomeResponseDto,
  QueryDto,
  UpdateHomeDto,
} from './dtos/home.dto';

@Injectable()
export class HomeService {
  constructor(private readonly prismaClient: PrismaService) {}

  async getAllHomes(queryFilter: QueryDto): Promise<HomeResponseDto[]> {
    const homes = await this.prismaClient.home.findMany({
      include: {
        images: {
          select: { url: true },
        },
      },
      where: queryFilter,
    });

    if (!homes.length) {
      throw new NotFoundException();
    }

    return homes.map((home) => HomeResponseDto.zodSchema.parse(home));
  }

  async getHomeById(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaClient.home.findFirst({
      where: {
        id,
      },
      include: {
        images: {
          select: {
            url: true,
          },
        },
      },
    });

    return HomeResponseDto.zodSchema.parse(home);
  }

  async createHome({
    adress,
    city,
    land_size,
    number_of_bathrooms,
    number_of_bedrooms,
    price,
    property_type,
    realtor_id,
  }: CreateHomeDto): Promise<HomeResponseDto> {
    const home = await this.prismaClient.home.create({
      data: {
        adress,
        city,
        land_size,
        number_of_bathrooms,
        number_of_bedrooms,
        price,
        property_type,
        realtor_id,
      },
      select: {
        id: true,
        adress: true,
        city: true,
        price: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        created_at: true,
        land_size: true,
        property_type: true,
        images: {
          select: {
            url: true,
          },
        },
      },
    });

    return HomeResponseDto.zodSchema.parse(home);
  }

  async updateHome(id: number, body: UpdateHomeDto): Promise<HomeResponseDto> {
    try {
      const home = await this.prismaClient.home.update({
        where: { id },
        data: {
          ...body,
        },
      });

      return HomeResponseDto.zodSchema.parse(home);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  deleteHome(id: number) {
    try {
      this.prismaClient.home.delete({
        where: {
          id,
        },
      });

      return;
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
