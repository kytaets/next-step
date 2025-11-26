import { IsEnum, IsUUID } from 'class-validator';
import { LanguageLevel } from '@prisma/client';

export class JobSeekerLanguageDto {
  @IsUUID('4')
  languageId: string;

  @IsEnum(LanguageLevel)
  level: LanguageLevel;
}
