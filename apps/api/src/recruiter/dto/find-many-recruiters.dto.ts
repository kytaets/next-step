import { IsUUID } from 'class-validator';

export class FindManyRecruitersDto {
  @IsUUID('4')
  companyId: string;
}
