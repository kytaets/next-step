'use client';

import { useQuery } from '@tanstack/react-query';
import classes from './page.module.css';
import { ApiError } from '@/types/authForm';
import { getMyVacancies } from '@/services/vacanciesService';
import { VacanciesResponse } from '@/types/vacancies';
import VacancyItem from '@/components/VacanciesItems/VacancyItem';
import MessageBox from '@/components/MessageBox/MessageBox';
import Link from 'next/link';
import HoveredItem from '@/components/HoveredItem/HoveredItem';
import { useSearchParams } from 'next/navigation';

export default function CompanyVacancies() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const {
    data: vacanciesResponse,
    isPending,
    isError,
    error,
  } = useQuery<VacanciesResponse, ApiError>({
    queryKey: ['company-vacancies', companyId],
    queryFn: () => getMyVacancies(companyId),
    enabled: !!companyId,
    staleTime: 0,
  });

  if (isError)
    return (
      <MessageBox type="error">
        <p>Error loading profile: {error?.message || 'Unexpected error'}</p>
      </MessageBox>
    );

  if (isPending)
    return (
      <MessageBox>
        <p>Loading profile, wait a second... </p>
      </MessageBox>
    );

  return (
    <div className="container">
      <div className={classes['page-container']}>
        <h1 className={classes['page-header']}>
          Your Company&apos;s Vacancies
        </h1>
        <div className={classes['vacancies-container']}>
          <div className={classes['add-vacancy-btn-container']}>
            <Link
              href="/my-profile/recruiter/company/vacancies/new-vacancy"
              className={classes['add-vacancy-btn']}
            >
              <HoveredItem>Add Vacancy +</HoveredItem>
            </Link>
          </div>
          {vacanciesResponse?.data?.length ? (
            vacanciesResponse.data.map((vacancyData) => (
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
            ))
          ) : (
            <p>No vacancies found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
