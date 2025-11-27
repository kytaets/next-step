import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RecruiterRepository } from '../repositories/recruiter.repository';
import { CreateRecruiterDto } from '../dto/create-recruiter.dto';
import { CompanyRole, Prisma, Recruiter } from '@prisma/client';
import { FindManyRecruitersDto } from '../dto/find-many-recruiters.dto';
import { UpdateRecruiterDto } from '../dto/update-recruiter.dto';
import { TokenService } from '../../token/token.service';
import { TokenType } from '../../token/enums/token-type.enum';
import { UserWithoutPassword } from '../../user/types/user-without-password.type';

@Injectable()
export class RecruiterService {
  constructor(
    private readonly repository: RecruiterRepository,
    private readonly tokenService: TokenService,
  ) {}

  async create(userId: string, dto: CreateRecruiterDto): Promise<Recruiter> {
    const recruiter = await this.repository.findOne({ userId });
    if (recruiter) {
      throw new BadRequestException('Recruiter already exists');
    }

    return this.repository.create(userId, dto);
  }

  async findOneOrThrow(
    where: Prisma.RecruiterWhereUniqueInput,
  ): Promise<Recruiter> {
    const recruiter = await this.repository.findOne(where);
    if (!recruiter) {
      throw new NotFoundException('Recruiter not found');
    }
    return recruiter;
  }

  async acceptInvite(user: UserWithoutPassword, token: string): Promise<void> {
    const data = await this.tokenService.consumeToken(TokenType.INVITE, token);
    if (!data || !data.companyId || !data.email || data.email !== user.email) {
      throw new BadRequestException('Invalid or expired invite token');
    }

    await this.setCompany(
      { userId: user.id },
      data.companyId,
      CompanyRole.MEMBER,
    );
  }

  async setCompany(
    where: Prisma.RecruiterWhereUniqueInput,
    companyId: string,
    role: CompanyRole,
  ): Promise<Recruiter> {
    return this.repository.setCompany(where, companyId, role);
  }

  async leaveCompany(recruiter: Recruiter): Promise<void> {
    if (recruiter.role === CompanyRole.ADMIN) {
      throw new ForbiddenException(
        'Admins cannot leave a company. You must delete the company',
      );
    }

    await this.repository.update(
      { id: recruiter.id },
      { company: { disconnect: true } },
    );
  }

  async setRole(id: string, role: CompanyRole): Promise<Recruiter> {
    return this.repository.update({ id }, { role });
  }

  async update(id: string, dto: UpdateRecruiterDto): Promise<Recruiter> {
    return this.repository.update({ id }, dto);
  }

  async findMany(dto: FindManyRecruitersDto): Promise<Recruiter[]> {
    return this.repository.findMany(dto);
  }

  async delete(id: string): Promise<Recruiter> {
    return this.repository.delete({ id });
  }
}
