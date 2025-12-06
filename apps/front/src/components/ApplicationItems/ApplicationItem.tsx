'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import classes from '../VacanciesItems/VacanciesItems.module.css';

import { isoToDate } from '@/utils/convertData';
import { validateImageUrl } from '@/utils/validation';
import { useQuery } from '@tanstack/react-query';
import { VacancyData } from '@/types/vacancies';
import { ApiError } from '@/types/authForm';
import { getVacancyById } from '@/services/vacanciesService';
import { VacancyApplication } from '@/types/application';

interface Props {
  data: VacancyApplication;
}

export default function ApplicationItem({ data }: Props) {
  const [logoUrl, setLogoUrl] = useState('/images/suitcase.png');
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: vacancyData } = useQuery<VacancyData | null, ApiError>({
    queryKey: ['vacancy', data.id],
    queryFn: () => getVacancyById(data.vacancyId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const companyLogo = vacancyData?.company.logoUrl ?? '';
    setIsLoaded(false);

    validateImageUrl(companyLogo).then((isValid) => {
      if (isValid) {
        setLogoUrl(companyLogo);
      } else {
        setLogoUrl('/images/company-no-logo.png');
      }
      setIsLoaded(true);
    });
  }, [vacancyData?.company.logoUrl]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={classes['vacancy-item-container']}
    >
      <Link
        href={`/applications/${data.id}`}
        className={classes['vacancy-item']}
      >
        <div>
          <img
            src={logoUrl}
            alt="company-logo"
            width={70}
            height={70}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
          <div className={classes['short-info']}>
            <h3>
              {vacancyData?.title} - {data.status}
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
