import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+?[0-9\s-]{7,15}$/, {
    message: 'Enter a valid phone number',
  })
  phone: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Enter the 6-digit code' })
  code: string;

  // Only required when the phone doesn't already belong to an account —
  // AuthService.verifyOtpAndAuth() enforces that, since we don't know
  // whether this is a sign-up or a login until we look the phone up.
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(120)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(120)
  lastName?: string;
}
