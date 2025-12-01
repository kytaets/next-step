'use client';
import { VacancyApplication } from '@/types/application';
import SideBox from '../VacanciesItems/VacancyPage/SideBox';
import classes from './ApplicationItems.module.css';

import { VacancyData } from '@/types/vacancies';
import { isoToDate } from '@/utils/convertData';
import { ProfileData } from '@/types/profile';
import MainInfo from '../ProfileItems/MainInfo';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import StatusUpdateForm from './StatusUpdateForm';

interface Props {
  applicationData: VacancyApplication;
  vacancyData?: VacancyData | null | undefined;
  jobSeekerData?: ProfileData | null | undefined;
}

export default function ApplicationContainer({
  applicationData,
  vacancyData,
  jobSeekerData,
}: Props) {
  const [editStatus, setEditStatus] = useState(false);
  const bottomContent = (
    <div className={classes['bottom-container']}>
      <h2>Cover Letter</h2>
      <p>
        {applicationData.coverLetter
          ? applicationData.coverLetter
          : 'No cover letter was attached'}
      </p>
      {jobSeekerData ? (
        <div className={classes['status-row']}>
          <div className="align-center">
            <span>Status:</span>
          </div>
          <div>
            {!editStatus ? (
              <>
                <span>{applicationData.status} </span>
                <button onClick={() => setEditStatus(true)}>(Change)</button>
              </>
            ) : (
              <StatusUpdateForm
                applicationId={applicationData.id}
                currentStatus={applicationData.status}
                onClose={() => setEditStatus(false)}
              />
            )}
          </div>
        </div>
      ) : (
        <p>
          <span>Status:</span> {applicationData.status}
        </p>
      )}

      <p>
        <span>Applied:</span> {isoToDate(applicationData.createdAt)}
      </p>
    </div>
  );
  return (
    <>
      <div className={classes['application-container']}>
        {vacancyData && (
          <div className={classes['vacancy-container']}>
            <div className={classes['left-container']}>
              <h1>{vacancyData.title}</h1>
              <h2>{vacancyData.description}</h2>
              {bottomContent}
            </div>
            <SideBox data={vacancyData} applyBtn={false} />{' '}
          </div>
        )}
        {jobSeekerData && (
          <>
            <MainInfo isEditable={false} data={jobSeekerData} />
            <Link href={`/job-seeker/${jobSeekerData.id}`}>
              <div className={classes['link-to-profile']}>
                <p>
                  Go to applicant&apos;s profile{' '}
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </div>
            </Link>
            {bottomContent}
          </>
        )}
      </div>
    </>
  );
}
