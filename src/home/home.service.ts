import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from 'src/user/dtos/auth.dto';
import {
  CreateHomeDto,
  HomeResponseDto,
  QueryDto,
  UpdateHomeDto,
} from './dtos/home.dto';

@Injectable()
export class HomeService {
  constructor(private readonly prismaClient: PrismaService) {}

  async CheckAuthorization(id: number, user: UserDto) {
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

  async getRealtorByHomeId(id: number) {
    const home = await this.prismaClient.home.findUnique({
      where: {
        id,
      },
      select: {
        realtor: true,
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    return home.realtor;
  }

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
      ...(queryFilter.min_price && { gte: queryFilter.min_price }),
      ...(queryFilter.max_price && { lte: queryFilter.max_price }),
    };

    const filter = {
      city,
      price,
      ...(queryFilter.property_type && {
        property_type: queryFilter.property_type,
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
    user: UserDto,
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

  async deleteHome(id: number, user: UserDto) {
    await this.CheckAuthorization(id, user);

    await this.prismaClient.home.delete({
      where: {
        id,
      },
    });

    return;
  }

  async inquire(homeId: number, buyer: UserDto, message: string) {
    const realtor = await this.getRealtorByHomeId(homeId);

    return await this.prismaClient.message.create({
      data: {
        message,
        home_id: homeId,
        buyer_id: buyer.userId,
        realtor_id: realtor.id,
      },
      select: {
        message: true,
        realtor: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  async getHomeMessages(
    id: number,
    user: UserDto,
    page: number = 1,
    perPage: number = 20,
  ) {
    await this.CheckAuthorization(id, user);

    const [total, data] = await Promise.all([
      this.prismaClient.message.count(),

      this.prismaClient.message.findMany({
        where: {
          home_id: id,
        },
        select: {
          message: true,
          buyer: {
            select: {
              name: true,
              phone: true,
              email: true,
            },
          },
        },
        take: perPage,
        skip: (page - 1) * perPage,
      }),
    ]);

    const pagination = {
      currentPage: page,
      lastVisiblePage: Math.ceil(total / perPage),
      hasNextPage: total > page * perPage,
      items: {
        count: data.length,
        total,
        perPage,
      },
    };

    return { pagination, data };
  }
}
