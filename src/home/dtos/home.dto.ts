import { PropertyType } from '@prisma/client';
import z from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const homeResponseDtoSchema = z
  .object({
    id: z.number(),
    adress: z.string(),
    city: z.string(),
    price: z.number(),
    number_of_bedrooms: z.number(),
    number_of_bathrooms: z.number(),
    created_at: z.date(),
    land_size: z.number(),
    property_type: z.enum([PropertyType.condo, PropertyType.residential]),
    images: z.array(z.object({ url: z.string() })),
  })
  .transform(
    ({
      id,
      adress,
      city,
      price,
      number_of_bedrooms: numberOfBedrooms,
      number_of_bathrooms: numberOfBathrooms,
      created_at: listedDate,
      land_size: landSize,
      property_type: propertyType,
      images,
    }) => {
      return {
        id,
        adress,
        city,
        price,
        numberOfBedrooms,
        numberOfBathrooms,
        listedDate,
        landSize,
        propertyType,
        images,
      };
    },
  );
export class HomeResponseDto extends createZodDto(homeResponseDtoSchema) {}

const createHomeDtoSchema = z.object({
  adress: z.string().min(1),
  number_of_bedrooms: z.number({ coerce: true }).positive(),
  number_of_bathrooms: z.number({ coerce: true }).positive(),
  city: z.string().min(1),
  price: z.number({ coerce: true }).positive(),
  land_size: z.number({ coerce: true }).positive(),
  property_type: z.enum([PropertyType.condo, PropertyType.residential]),
  realtor_id: z.number({ coerce: true }).positive(),
  homes: z.array(z.object({ url: z.string() })).optional(),
});
export class CreateHomeDto extends createZodDto(createHomeDtoSchema) {}

const updateHomeDtoSchema = z.object({
  adress: z.string().min(1).optional(),
  number_of_bedrooms: z.number({ coerce: true }).positive().optional(),
  number_of_bathrooms: z.number({ coerce: true }).positive().optional(),
  city: z.string().min(1).optional(),
  price: z.number({ coerce: true }).positive().optional(),
  land_size: z.number({ coerce: true }).positive().optional(),
  property_type: z
    .enum([PropertyType.condo, PropertyType.residential])
    .optional(),
  realtor_id: z.number({ coerce: true }).positive().optional(),
});
export class UpdateHomeDto extends createZodDto(updateHomeDtoSchema) {}

const queryDtoSchema = z
  .object({
    city: z.string().min(1).optional(),
    minPrice: z.number({ coerce: true }).positive().optional(),
    maxPrice: z.number({ coerce: true }).positive().optional(),
    propertyType: z
      .enum([PropertyType.condo, PropertyType.residential])
      .optional(),
  })
  .transform((o) => {
    const modeSchema = z.enum(['default', 'insensitive']);
    return {
      city: {
        ...(o.city && {
          contains: o.city,
          mode: modeSchema.parse('insensitive'),
        }),
      },
      ...(o.propertyType && { property_type: o.propertyType }),
      price: {
        ...(o.minPrice && { gte: o.minPrice }),
        ...(o.maxPrice && { lte: o.maxPrice }),
      },
    };
  });
export class QueryDto extends createZodDto(queryDtoSchema) {}
