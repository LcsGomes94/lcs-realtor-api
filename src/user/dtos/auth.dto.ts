import { UserType } from '@prisma/client';
import z from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const signUpDtoSchema = z.object({
  name: z.string().min(1),
  phone: z
    .string()
    .regex(
      /^(\+\d{1,2}\s)?\d{1,3}[\s.-]\d{3,5}\d{4}$/,
      'phone must be a valid phone number',
    ),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[0-9])/, 'password must contain at least 1 number'),
  productKey: z.string().min(1).optional(),
});
export class SignUpDto extends createZodDto(signUpDtoSchema) {}

const signInDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export class SignInDto extends createZodDto(signInDtoSchema) {}

const generateProductKeyDtoSchema = z.object({
  email: z.string().email(),
  userType: z.enum([UserType.admin, UserType.realtor]),
});
export class GenerateProductKeyDto extends createZodDto(
  generateProductKeyDtoSchema,
) {}
