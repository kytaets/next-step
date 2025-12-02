'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import SearchBar from '@/components/SearchItems/SearchBar';
import MessageBox from '@/components/MessageBox/MessageBox';

import classes from './page.module.css';

import { CompaniesSearchForm } from '@/types/companiesSearch';
import { mapQueryToCompaniesForm } from '@/utils/companiesSearchValidation';
import { isEmptyValue } from '@/utils/vacancyValidation';
import { getMyApplications } from '@/services/application';
import { ApplicationSearchData, VacancyApplication } from '@/types/application';
import ApplicationItem from '@/components/ApplicationItems/ApplicationItem';

export default function MyApplicationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryData = Object.fromEntries(searchParams.entries());
  const companyForm = mapQueryToCompaniesForm(queryData);

  const name = companyForm?.name ?? '';
  const page = Number(companyForm?.page) || 1;
  const minimalQuery: CompaniesSearchForm = { name, page };

  const {
    data: myApplications,
    isError,
    error,
  } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => getMyApplications(),
  });

  const updateUrl = (values: ApplicationSearchData) => {
    const params = new URLSearchParams();
    if (!isEmptyValue(values.status))
      params.set('status', String(values.status));
    params.set('page', String(values.page ?? 1));

    router.push(`?${params.toString()}`);
  };

  if (isError)
    return (
      <MessageBox type="error">
        <p>Error loading companies: {error?.message || 'Unexpected error'}</p>
      </MessageBox>
    );

  console.log(myApplications);

  return (
    <div className="container">
      <h1 className="page-header">Search for top-tier jobs </h1>
      <SearchBar
        type={'applications'}
        onSubmit={updateUrl}
        fieldsValues={minimalQuery}
      />

      <div className={classes['vacancies-container']}>
        {myApplications &&
          myApplications.data &&
          myApplications.data.map((applicationData: VacancyApplication) => (
            <ApplicationItem key={applicationData.id} data={applicationData} />
          ))}
      </div>
    </div>
  );
}
