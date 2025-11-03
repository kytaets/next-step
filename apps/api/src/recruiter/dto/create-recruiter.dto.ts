import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateRecruiterDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 35)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 35)
  lastName: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
