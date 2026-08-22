import {
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AddressDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  lastName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  line1: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  line2: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  city: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  region: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  postalCode: string;

  @IsString()
  @Length(2, 2)
  country: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  phone?: string;
}
