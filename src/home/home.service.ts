import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AuthorizedUserDto,
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
    const home = await this.prismaClient.home.findUnique({
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

  async createHome(
    {
      adress,
      city,
      price,
      numberOfBedrooms,
      numberOfBathrooms,
      landSize,
      propertyType,
      images,
    }: CreateHomeDto,
    userId: number,
  ): Promise<HomeResponseDto> {
    const home = await this.prismaClient.home.create({
      data: {
        adress,
        city,
        price,
        land_size: landSize,
        number_of_bedrooms: numberOfBedrooms,
        number_of_bathrooms: numberOfBathrooms,
        property_type: propertyType,
        realtor_id: userId,
        images: {
          createMany: { data: images },
        },
      },
      include: {
        images: {
          select: {
            url: true,
          },
        },
      },
    });

    return new HomeResponseDto(home);
  }

  async updateHome(
    id: number,
    body: UpdateHomeDto,
    user: AuthorizedUserDto,
  ): Promise<HomeResponseDto> {
    await this.CheckAuthorization(id, user);

    const newHome = await this.prismaClient.home.update({
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

    return new HomeResponseDto(newHome);
  }

  async deleteHome(id: number, user: AuthorizedUserDto) {
    await this.CheckAuthorization(id, user);

    await this.prismaClient.home.delete({
      where: {
        id,
      },
    });

    return;
  }

  async CheckAuthorization(id: number, user: AuthorizedUserDto) {
    const home = await this.prismaClient.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) {
      throw new NotFoundException();
    } else if (user.userId !== home.realtor_id && user.userType !== 'admin') {
      throw new UnauthorizedException();
    }
  }
}
