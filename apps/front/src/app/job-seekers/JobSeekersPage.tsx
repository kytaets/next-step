'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import SearchBar from '@/components/SearchItems/SearchBar';
import MessageBox from '@/components/MessageBox/MessageBox';
import JobSeekerItem from '@/components/JobSeekersSearchItems/JobSeekerItem';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import classes from './page.module.css';

import {
  JobSeekerItemData,
  JobSeekerSearchForm,
} from '@/types/jobSeekerSearch';
import { mapQueryToJobSeekerForm } from '@/utils/jobSeekerSearchValidation';
import { isEmptyValue } from '@/utils/vacancyValidation';
import { searchJobSeekers } from '@/services/jobSeekerSearchService';

export default function JobSeekersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryData = Object.fromEntries(searchParams.entries());
  const jobSeekerForm = mapQueryToJobSeekerForm(queryData);

  const {
    data: jobSeekersData,
    isError,
    error,
    isPending,
  } = useQuery({
    queryKey: ['job-seekers', queryData],
    queryFn: () => searchJobSeekers(jobSeekerForm),
  });

  const updateUrl = (values: JobSeekerSearchForm) => {
    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (isEmptyValue(value)) return;

      if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else if (typeof value === 'object') {
        params.set(key, JSON.stringify(value));
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`?${params.toString()}`);
  };

  if (isError)
    return (
      <MessageBox type="error">
        <p>Error loading job seekers: {error?.message || 'Unexpected error'}</p>
      </MessageBox>
    );

  if (isPending)
    return (
      <MessageBox>
        <p>Loading job seekers...</p>
      </MessageBox>
    );

  const jobSeekers = Array.isArray(jobSeekersData?.data)
    ? jobSeekersData.data
    : [];

  return (
    <div className="container">
      <h1 className={classes['page-header']}>Search for job seekers</h1>

      <SearchBar
        type="jobSeekers"
        onSubmit={updateUrl}
        fieldsValues={jobSeekerForm}
      />

      <Link href="/vacancies">
        <div className={classes['link-to-companies']}>
          <span>Search for vacancies</span>
          <div className="align-center">
            <FontAwesomeIcon icon={faArrowRight} />
          </div>
        </div>
      </Link>

      <div className={classes['vacancies-container']}>
        {jobSeekers.map((js: JobSeekerItemData) => (
          <JobSeekerItem
            key={js.id}
            data={{
              id: js.id,
              firstName: js.firstName,
              lastName: js.lastName,
              avatarUrl: js.avatarUrl,
              dateOfBirth: js.dateOfBirth,
              createdAt: js.createdAt,
            }}
          />
        ))}
      </div>
    </div>
  );
}
