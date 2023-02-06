import {
  IsString,
  Matches,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^(\+\d{1,2}\s)?\d{1,3}[\s.-]\d{3,5}\d{4}$/, {
    message: 'phone must be a valid phone number',
  })
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[0-9])/, {
    message: 'password must contain at least 1 number',
  })
  password: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productKey: string;
}

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

enum UserType {
  admin = 'admin',
  realtor = 'realtor',
}

export class GenerateProductKeyDto {
  @IsEmail()
  email: string;

  @IsEnum(UserType, { message: 'userType should be admin or realtor' })
  userType: UserType;
}
