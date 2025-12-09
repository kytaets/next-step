'use client';

import VacancyItem from '@/components/VacanciesItems/VacancyItem';
import PagesCounter from '@/components/VacanciesItems/PagesCounter';

import classes from './page.module.css';

import SearchBar from '@/components/SearchItems/SearchBar';
import { searchVacancies } from '@/services/vacanciesService';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { VacancyData } from '@/types/vacancies';
import { isEmptyValue, mapQueryToVacancyForm } from '@/utils/vacancyValidation';
import MessageBox from '@/components/MessageBox/MessageBox';
import { VacancyFormValues } from '@/types/vacancy';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo, useState } from 'react';

import Cookies from 'js-cookie';

const serializeUrlParams = (values: VacancyFormValues): string => {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (isEmptyValue(value)) return;

    if (key === 'requiredSkillIds' && Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','));
    } else if (Array.isArray(value)) {
      if (value.every((v) => typeof v === 'string' || typeof v === 'number')) {
        params.set(key, value.join(','));
      } else {
        params.set(key, JSON.stringify(value));
      }
    } else if (typeof value === 'object') {
      params.set(key, JSON.stringify(value));
    } else {
      params.set(key, String(value));
    }
  });

  return params.toString();
};

const isValidVacancyArray = (data: unknown): data is VacancyData[] => {
  return Array.isArray(data);
};

export default function VacanciesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryData = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const vacancyForm = useMemo(
    () => mapQueryToVacancyForm(queryData),
    [queryData]
  );

  const [role, setRole] = useState<string | undefined>();

  useEffect(() => {
    setRole(Cookies.get('role'));
  }, []);

  const {
    data: vacanciesData,
    isError,
    error,
    isPending,
  } = useQuery({
    queryKey: ['vacancies', queryData],
    queryFn: () => searchVacancies(vacancyForm),
    retry: false,
  });

  const updateUrl = (values: VacancyFormValues) => {
    router.push(`?${serializeUrlParams(values)}`);
  };

  if (isError)
    return (
      <MessageBox type="error">
        <p>Error loading vacancies: {error?.message || 'Unexpected error'}</p>
      </MessageBox>
    );

  if (isPending)
    return (
      <MessageBox>
        <p>Loading vacancies...</p>
      </MessageBox>
    );

  const vacancies = isValidVacancyArray(vacanciesData?.data)
    ? vacanciesData.data
    : [];

  return (
    <div className="container">
      <h1 className={classes['page-header']}>Search for top-tier jobs </h1>

      <SearchBar onSubmit={updateUrl} fieldsValues={vacancyForm} />

      {role && (
        <Link href={role === 'JOB_SEEKER' ? '/companies' : '/job-seekers'}>
          <div className={classes['link-to-companies']}>
            {role === 'JOB_SEEKER' && <span>Search for companies</span>}
            {role === 'RECRUITER' && <span>Search for job-seekers</span>}
            <div className="align-center">
              <FontAwesomeIcon icon={faArrowRight} />
            </div>
          </div>
        </Link>
      )}

      <div className={classes['vacancies-container']}>
        {vacancies
          .filter((v: VacancyData) => v.company)
          .map((vacancyData: VacancyData) => (
            <VacancyItem
              key={vacancyData.id}
              data={{
                id: vacancyData.id,
                title: vacancyData.title,
                companyName: vacancyData.company.name,
                companyLogo: vacancyData.company.logoUrl,
                createdAt: vacancyData.createdAt,
              }}
            />
          ))}
      </div>

      {vacanciesData && (
        <PagesCounter
          currentPage={vacanciesData.meta.page}
          totalPages={vacanciesData.meta.totalPages}
        />
      )}
    </div>
  );
}
