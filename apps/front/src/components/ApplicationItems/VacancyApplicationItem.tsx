'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import classes from '../VacanciesItems/VacanciesItems.module.css';

import { isoToDate } from '@/utils/convertData';
import { validateImageUrl } from '@/utils/validation';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/types/authForm';
import { VacancyApplication } from '@/types/application';
import { getProfileById } from '@/services/jobseekerService';
import { ProfileData } from '@/types/profile';
import { useParams } from 'next/navigation';

interface Props {
  data: VacancyApplication;
}

export default function VacancyApplicationItem({ data }: Props) {
  const [logoUrl, setLogoUrl] = useState('/images/suitcase.png');
  const [isLoaded, setIsLoaded] = useState(false);

  const params = useParams();
  const vacancyId = params.vacancyApplicationSlug as string;

  const { data: jobseekerData } = useQuery<ProfileData | null, ApiError>({
    queryKey: ['vacancy', data.id],
    queryFn: () => getProfileById(data.jobSeeker.id),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  console.log('Application Data:', data);

  useEffect(() => {
    const jobSeekerAvatar = jobseekerData?.avatarUrl ?? '';
    setIsLoaded(false);

    validateImageUrl(jobSeekerAvatar).then((isValid) => {
      if (isValid) {
        setLogoUrl(jobSeekerAvatar);
      } else {
        setLogoUrl('/images/no-avatar.png');
      }
      setIsLoaded(true);
    });
  }, [jobseekerData?.avatarUrl]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={classes['vacancy-item-container']}
    >
      <Link
        href={`/my-profile/recruiter/company/applications/${vacancyId}/${data.id}`}
        className={classes['vacancy-item']}
      >
        <div>
          <img
            src={logoUrl}
            alt="no-avatar"
            width={70}
            height={70}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
          <div className={classes['short-info']}>
            <h3>
              {jobseekerData?.firstName} {jobseekerData?.lastName} -{' '}
              {data.status}
            </h3>
          </div>
        </div>

        <div className="align-center">
          <span>Applied: {isoToDate(data.createdAt)}</span>{' '}
        </div>
      </Link>
    </motion.div>
  );
}
