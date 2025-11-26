import { IsString, IsUUID, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsUUID()
  token: string;

  @IsString()
  @Length(8, 50)
  password: string;
}
