import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { Company, Vacancy } from '@prisma/client';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { CurrentCompany } from '../company/decorators/current-company.decorator';
import { CompanyGuard } from '../company/guards/company.guard';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { MessageResponse, PagedDataResponse } from '@common/responses';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { FindManyVacanciesDto } from './dto/find-many-vacancies.dto';
import { SetSkillsDto } from './dto/set-skills.dto';
import { SetLanguagesDto } from './dto/set-languages.dto';
import { VacancyOwnerGuard } from './guards/vacancy-owner.guard';

@Controller('vacancies')
export class VacancyController {
  constructor(private readonly service: VacancyService) {}

  @Post()
  @UseGuards(SessionAuthGuard, CompanyGuard)
  async create(
    @CurrentCompany() company: Company,
    @Body() dto: CreateVacancyDto,
  ): Promise<Vacancy> {
    return this.service.create(company.id, dto);
  }

  @Post('search')
  async findMany(
    @Body() dto: FindManyVacanciesDto,
  ): Promise<PagedDataResponse<Vacancy[]>> {
    return this.service.findMany(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Vacancy> {
    return this.service.findOneOrThrow({ id });
  }

  @Patch(':id')
  @UseGuards(SessionAuthGuard, CompanyGuard, VacancyOwnerGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVacancyDto,
  ): Promise<Vacancy> {
    return this.service.update({ id }, dto);
  }

  @Delete(':id')
  @UseGuards(SessionAuthGuard, CompanyGuard, VacancyOwnerGuard)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponse> {
    await this.service.delete({ id });
    return { message: 'Vacancy deleted successfully' };
  }

  @Put(':id/skills')
  @UseGuards(SessionAuthGuard, CompanyGuard, VacancyOwnerGuard)
  async setRequiredSkills(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetSkillsDto,
  ): Promise<Vacancy> {
    return this.service.setRequiredSkills(id, dto);
  }

  @Put(':id/languages')
  @UseGuards(SessionAuthGuard, CompanyGuard, VacancyOwnerGuard)
  async setRequiredLanguages(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetLanguagesDto,
  ): Promise<Vacancy> {
    return this.service.setRequiredLanguages(id, dto);
  }
}
