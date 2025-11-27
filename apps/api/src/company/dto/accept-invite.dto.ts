import { IsUUID } from 'class-validator';

export class AcceptInviteDto {
  @IsUUID('4')
  token: string;
}
