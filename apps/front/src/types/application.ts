import { ContactsData, LanguageData } from './profile';

export type ApplicationForm = {
  coverLetter: string | null;
  vacancyId: string;
};

export type SkillItem = {
  skill: {
    id: string;
    name: string;
  };
};

export type JobSeekerShortData = {
  id: string;
  firstName: string;
  lastName: string;
  contacts: ContactsData | null;
  languages: LanguageData[];
  skills: SkillItem[];
};

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'REVIEWING'
  | 'REJECTED'
  | 'APPROVED'
  | 'INTERVIEW';

export type VacancyApplication = {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  createdAt: string;
  updatedAt: string;
  jobSeekerId: string;
  vacancyId: string;
  jobSeeker: JobSeekerShortData;
};
