import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { UserType } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { UserDto } from 'src/user/dtos/auth.dto';
import {
  CreateHomeDto,
  HomeResponseDto,
  InquireDto,
  MessageQueryDto,
  QueryDto,
  UpdateHomeDto,
} from './dtos/home.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getAllHomes(@Query() queryFilter: QueryDto): Promise<HomeResponseDto[]> {
    return this.homeService.getAllHomes(queryFilter);
  }

  @Get(':id')
  getHomeById(@Param('id', ParseIntPipe) id: number): Promise<HomeResponseDto> {
    return this.homeService.getHomeById(id);
  }

  @Roles(UserType.realtor)
  @Post()
  createHome(
    @Body() body: CreateHomeDto,
    @User() user: UserDto,
  ): Promise<HomeResponseDto> {
    return this.homeService.createHome(body, user.userId);
  }

  @Roles(UserType.realtor, UserType.admin)
  @Put(':id')
  updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
    @User() user: UserDto,
  ): Promise<HomeResponseDto> {
    return this.homeService.updateHome(id, body, user);
  }

  @Roles(UserType.realtor, UserType.admin)
  @HttpCode(204)
  @Delete(':id')
  deleteHome(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserDto,
  ): Promise<void> {
    return this.homeService.deleteHome(id, user);
  }

  @Roles(UserType.buyer)
  @Post(':id/inquire')
  inquire(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserDto,
    @Body() body: InquireDto,
  ) {
    return this.homeService.inquire(id, user, body.message);
  }

  @Roles(UserType.realtor, UserType.admin)
  @Get(':id/messages')
  getHomeMessages(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserDto,
    @Query() query: MessageQueryDto,
  ) {
    return this.homeService.getHomeMessages(
      id,
      user,
      query.page,
      query.per_page,
    );
  }
}
