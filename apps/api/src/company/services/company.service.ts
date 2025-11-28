import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Company, CompanyRole, Prisma } from '@prisma/client';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { FindManyCompaniesDto } from '../dto/find-many-companies.dto';
import { CompanyRepository } from '../repositories/company.repository';
import { ConfigService } from '@nestjs/config';
import { createPaginationMeta, getPaginationByPage } from '@common/utils';
import { PagedDataResponse } from '@common/responses';
import { InviteDto } from '../dto/invite.dto';
import { RecruiterService } from '../../recruiter/services/recruiter.service';
import { EmailService } from '../../email/services/email.service';
import { TokenService } from '../../token/services/token.service';
import { TokenType } from '../../token/enums/token-type.enum';
import { UserService } from '../../user/services/user.service';
import { RecruiterWithCompany } from '../../recruiter/types/recruiter-with-company.type';
import { UserWithoutPassword } from '../../user/types/user-without-password.type';
import { AcceptInviteDto } from '../dto/accept-invite.dto';

@Injectable()
export class CompanyService {
  private readonly searchPageSize: number;

  constructor(
    private readonly repository: CompanyRepository,
    private readonly recruiterService: RecruiterService,
    private readonly email: EmailService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
  ) {
    this.searchPageSize = this.config.getOrThrow<number>(
      'search.company.pageSize',
    );
  }

  async create(recruiterId: string, dto: CreateCompanyDto): Promise<Company> {
    const company = await this.repository.create(recruiterId, dto);
    await this.recruiterService.setCompany(
      { id: recruiterId },
      company.id,
      CompanyRole.ADMIN,
    );
    return company;
  }

  async findOneOrThrow(
    where: Prisma.CompanyWhereUniqueInput,
  ): Promise<Company> {
    const company = await this.repository.findOne(where);
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async assertNotExists(where: Prisma.CompanyWhereUniqueInput): Promise<void> {
    const company = await this.repository.findOne(where);
    if (company) throw new BadRequestException('Company already exists');
  }

  async findMany(
    dto: FindManyCompaniesDto,
  ): Promise<PagedDataResponse<Company[]>> {
    const where: Prisma.CompanyWhereInput = {};
    const pagination = getPaginationByPage(dto.page, this.searchPageSize);

    if (dto.name) {
      where.name = {
        contains: dto.name,
        mode: 'insensitive',
      };
    }

    const data = await this.repository.findMany({ where, ...pagination });
    const total = await this.repository.count(where);

    const meta = createPaginationMeta(total, dto.page, this.searchPageSize);

    return { data, meta };
  }

  async invite(companyId: string, dto: InviteDto): Promise<void> {
    const user = await this.userService.findOneOrThrow({ email: dto.email });
    await this.recruiterService.findOneOrThrow({ userId: user.id });

    const company = await this.findOneOrThrow({ id: companyId });

    const token = await this.tokenService.createToken(TokenType.INVITE, {
      email: dto.email,
      companyId,
    });
    await this.email.sendCompanyInvitation(dto.email, token, company.name);
  }

  async addRecruiter(
    user: UserWithoutPassword,
    dto: AcceptInviteDto,
  ): Promise<void> {
    const data = await this.tokenService.consumeToken(
      TokenType.INVITE,
      dto.token,
    );

    if (!data || !data.companyId || !data.email || data.email !== user.email) {
      throw new BadRequestException('Invalid or expired invite token');
    }

    await this.recruiterService.setCompany(
      { userId: user.id },
      data.companyId,
      CompanyRole.MEMBER,
    );
  }

  async removeRecruiter(companyId: string, recruiterId: string): Promise<void> {
    const recruiter = await this.recruiterService.findOneOrThrow({
      id: recruiterId,
    });

    if (recruiter.companyId !== companyId) {
      throw new ForbiddenException(
        'You can only remove members from your own company',
      );
    }

    await this.recruiterService.leaveCompany(recruiter);
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    return this.repository.update({ id }, dto);
  }

  async delete(recruiter: RecruiterWithCompany): Promise<void> {
    await this.repository.delete({ id: recruiter.companyId });
    await this.recruiterService.setRole(recruiter.id, CompanyRole.MEMBER);
  }
}
