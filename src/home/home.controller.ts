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
import { User } from 'src/user/decorators.ts/user.decorator';
import {
  CreateHomeDto,
  HomeResponseDto,
  QueryDto,
  UpdateHomeDto,
  CreateHomeUserDto,
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

  @Post()
  createHome(
    @Body() body: CreateHomeDto,
    @User() user: CreateHomeUserDto,
  ): Promise<HomeResponseDto> {
    return this.homeService.createHome(body, user.userId);
  }

  @Put(':id')
  updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
  ): Promise<HomeResponseDto> {
    return this.homeService.updateHome(id, body);
  }

  @HttpCode(204)
  @Delete(':id')
  deleteHome(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.deleteHome(id);
  }
}
