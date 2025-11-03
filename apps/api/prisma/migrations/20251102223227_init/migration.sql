-- CreateEnum
CREATE TYPE "public"."application_status" AS ENUM ('SUBMITTED', 'REJECTED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "public"."company_role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."seniority_level" AS ENUM ('TRAINEE', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD');

-- CreateEnum
CREATE TYPE "public"."language_level" AS ENUM ('ELEMENTARY', 'PRE_INTERMEDIATE', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'NATIVE');

-- CreateEnum
CREATE TYPE "public"."work_format" AS ENUM ('OFFICE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."employment_type" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_seekers" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "location" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "expected_salary" INTEGER,
    "is_open_to_work" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "seniority_level" "public"."seniority_level",
    "user_id" TEXT NOT NULL,

    CONSTRAINT "job_seekers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_seeker_contacts" (
    "job_seeker_id" TEXT NOT NULL,
    "github_url" TEXT,
    "linkedin_url" TEXT,
    "telegram_url" TEXT,
    "public_email" TEXT,
    "phone_number" TEXT,

    CONSTRAINT "job_seeker_contacts_pkey" PRIMARY KEY ("job_seeker_id")
);

-- CreateTable
CREATE TABLE "public"."job_seekers_languages" (
    "level" "public"."language_level" NOT NULL,
    "job_seeker_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,

    CONSTRAINT "job_seekers_languages_pkey" PRIMARY KEY ("job_seeker_id","language_id")
);

-- CreateTable
CREATE TABLE "public"."job_seekers_skills" (
    "job_seeker_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,

    CONSTRAINT "job_seekers_skills_pkey" PRIMARY KEY ("job_seeker_id","skill_id")
);

-- CreateTable
CREATE TABLE "public"."languages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recruiters" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_role" "public"."company_role" NOT NULL DEFAULT 'MEMBER',
    "user_id" TEXT NOT NULL,
    "company_id" TEXT,

    CONSTRAINT "recruiters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "logo_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vacancies" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "salary_min" INTEGER NOT NULL,
    "salary_max" INTEGER NOT NULL,
    "office_location" TEXT,
    "experience_required" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" TEXT NOT NULL,
    "workFormat" "public"."work_format"[],
    "employmentType" "public"."employment_type"[],
    "seniorityLevel" "public"."seniority_level" NOT NULL,

    CONSTRAINT "vacancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vacancies_languages" (
    "level" "public"."language_level" NOT NULL,
    "vacancy_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,

    CONSTRAINT "vacancies_languages_pkey" PRIMARY KEY ("vacancy_id","language_id")
);

-- CreateTable
CREATE TABLE "public"."vacancies_skills" (
    "vacancy_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,

    CONSTRAINT "vacancies_skills_pkey" PRIMARY KEY ("vacancy_id","skill_id")
);

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" TEXT NOT NULL,
    "status" "public"."application_status" NOT NULL DEFAULT 'SUBMITTED',
    "cover_letter" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "job_seeker_id" TEXT NOT NULL,
    "vacancy_id" TEXT NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "job_seekers_user_id_key" ON "public"."job_seekers"("user_id");

-- CreateIndex
CREATE INDEX "job_seekers_is_open_to_work_idx" ON "public"."job_seekers"("is_open_to_work");

-- CreateIndex
CREATE UNIQUE INDEX "job_seeker_contacts_job_seeker_id_key" ON "public"."job_seeker_contacts"("job_seeker_id");

-- CreateIndex
CREATE UNIQUE INDEX "languages_name_key" ON "public"."languages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "public"."skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "recruiters_user_id_key" ON "public"."recruiters"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_job_seeker_id_vacancy_id_key" ON "public"."applications"("job_seeker_id", "vacancy_id");

-- AddForeignKey
ALTER TABLE "public"."job_seekers" ADD CONSTRAINT "job_seekers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_seeker_contacts" ADD CONSTRAINT "job_seeker_contacts_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seekers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_seekers_languages" ADD CONSTRAINT "job_seekers_languages_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seekers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_seekers_languages" ADD CONSTRAINT "job_seekers_languages_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_seekers_skills" ADD CONSTRAINT "job_seekers_skills_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seekers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_seekers_skills" ADD CONSTRAINT "job_seekers_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recruiters" ADD CONSTRAINT "recruiters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recruiters" ADD CONSTRAINT "recruiters_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vacancies" ADD CONSTRAINT "vacancies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vacancies_languages" ADD CONSTRAINT "vacancies_languages_vacancy_id_fkey" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vacancies_languages" ADD CONSTRAINT "vacancies_languages_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vacancies_skills" ADD CONSTRAINT "vacancies_skills_vacancy_id_fkey" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vacancies_skills" ADD CONSTRAINT "vacancies_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_job_seeker_id_fkey" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seekers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_vacancy_id_fkey" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
