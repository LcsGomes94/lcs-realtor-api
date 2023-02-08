import { PropertyType, UserType } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { Expose, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
  IsOptional,
  IsNotEmpty,
  IsPositive,
  IsUrl,
  ArrayNotEmpty,
  IsDateString,
} from 'class-validator';

class Image {
  @IsUrl()
  url: string;
}

export class HomeResponseDto {
  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }

  id: number;
  adress: string;
  city: string;
  price: number;
  images: Image[];

  @Expose({ name: 'numberOfBedrooms' })
  numberOfBedrooms() {
    return this.number_of_bedrooms;
  }
  @Expose({ name: 'numberOfBathrooms' })
  numberOfBathrooms() {
    return this.number_of_bathrooms;
  }
  @Expose({ name: 'listedDate' })
  listedDate() {
    return this.created_at;
  }
  @Expose({ name: 'landSize' })
  landSize() {
    return this.land_size;
  }
  @Expose({ name: 'propertyType' })
  propertyType() {
    return this.property_type;
  }

  @Exclude()
  number_of_bedrooms: number;
  @Exclude()
  number_of_bathrooms: number;
  @Exclude()
  created_at: Date;
  @Exclude()
  land_size: number;
  @Exclude()
  property_type: PropertyType;

  @Exclude()
  updated_at: Date;
  @Exclude()
  realtor_id: number;
}

export class CreateHomeDto {
  @IsString()
  @IsNotEmpty()
  adress: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  numberOfBedrooms: number;

  @IsNumber()
  @IsPositive()
  numberOfBathrooms: number;

  @IsNumber()
  @IsPositive()
  landSize: number;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => Image)
  images: Image[];
}

export class UpdateHomeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  adress?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBedrooms?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBathrooms?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  landSize?: number;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;
}

export class QueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxPrice?: number;

  @IsOptional()
  @IsEnum(PropertyType, {
    message: 'propertyType should be residential or condo',
  })
  propertyType?: PropertyType;
}

enum AuthorizedUser {
  admin = 'admin',
  realtor = 'realtor',
}

export class AuthorizedUserDto {
  @IsNumber()
  @IsPositive()
  userId: number;

  @IsEnum(AuthorizedUser)
  userType: AuthorizedUser;
}

export class UserDto {
  @IsString()
  @IsNotEmpty()
  iss: string;

  @IsString()
  @IsNotEmpty()
  aud: string;

  @IsNumber()
  @IsPositive()
  userId: number;

  @IsEnum(UserType)
  userType: UserType;

  @IsNumber()
  @IsPositive()
  iat: number;

  @IsNumber()
  @IsPositive()
  exp: number;
}
