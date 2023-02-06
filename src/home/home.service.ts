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
    enum Mode {
      default = 'default',
      insensitive = 'insensitive',
    }

    const city = {
      ...(queryFilter.city && {
        contains: queryFilter.city,
        mode: Mode.insensitive,
      }),
    };

    const price = {
      ...(queryFilter.minPrice && { gte: queryFilter.minPrice }),
      ...(queryFilter.maxPrice && { lte: queryFilter.maxPrice }),
    };

    const filter = {
      city,
      price,
      ...(queryFilter.propertyType && {
        property_type: queryFilter.propertyType,
      }),
    };

    const homes = await this.prismaClient.home.findMany({
      include: {
        images: {
          select: { url: true },
        },
      },
      where: filter,
    });

    if (!homes.length) {
      throw new NotFoundException();
    }

    return homes.map((home) => new HomeResponseDto(home));
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

    if (!home) {
      throw new NotFoundException();
    }

    return new HomeResponseDto(home);
  }

  async createHome({
    adress,
    city,
    price,
    numberOfBedrooms,
    numberOfBathrooms,
    landSize,
    propertyType,
    realtorId,
    images,
  }: CreateHomeDto): Promise<HomeResponseDto> {
    const home = await this.prismaClient.home.create({
      data: {
        adress,
        city,
        price,
        land_size: landSize,
        number_of_bedrooms: numberOfBedrooms,
        number_of_bathrooms: numberOfBathrooms,
        property_type: propertyType,
        realtor_id: realtorId,
      },
    });

    const homeImages = images.map((image) => {
      return {
        ...image,
        home_id: home.id,
      };
    });

    await this.prismaClient.image.createMany({
      data: homeImages,
    });

    const updatedHome = await this.prismaClient.home.findUnique({
      where: {
        id: home.id,
      },
      include: {
        images: {
          select: {
            url: true,
          },
        },
      },
    });

    return new HomeResponseDto(updatedHome);
  }

  async updateHome(id: number, body: UpdateHomeDto): Promise<HomeResponseDto> {
    try {
      const home = await this.prismaClient.home.update({
        where: { id },
        data: {
          ...(body.adress && { adress: body.adress }),
          ...(body.city && { city: body.city }),
          ...(body.price && { price: body.price }),
          ...(body.numberOfBedrooms && {
            number_of_bedrooms: body.numberOfBedrooms,
          }),
          ...(body.numberOfBathrooms && {
            number_of_bathrooms: body.numberOfBathrooms,
          }),
          ...(body.landSize && { land_size: body.landSize }),
          ...(body.propertyType && { property_type: body.propertyType }),
        },
      });

      return new HomeResponseDto(home);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async deleteHome(id: number) {
    try {
      await this.prismaClient.image.deleteMany({
        where: {
          home_id: id,
        },
      });

      await this.prismaClient.home.delete({
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
