'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import HoveredItem from '../../HoveredItem/HoveredItem';

import classes from './SideBox.module.css';

import { capitalize, toKebabCase } from '@/utils/convertData';
import { validateImageUrl } from '@/utils/validation';
import Cookies from 'js-cookie';
import ApplyBtn from '@/components/ApplicationItems/ApplyBtn';
import { VacancyData } from '@/types/vacancies';

interface Props {
  data: VacancyData | null;
  applyBtn?: boolean;
}

export default function SideBox({ data, applyBtn = true }: Props) {
  const [logoUrl, setLogoUrl] = useState('/images/suitcase.png');
  const [isLoaded, setIsLoaded] = useState(false);
  const companyId = Cookies.get('company-id');

  useEffect(() => {
    const companyLogo = data?.company.logoUrl ?? '';
    setIsLoaded(false);

    validateImageUrl(companyLogo).then((isValid) => {
      if (isValid) {
        setLogoUrl(companyLogo);
      } else {
        setLogoUrl('/images/organization-dark.png');
      }
      setIsLoaded(true);
    });
  }, [data?.company.logoUrl]);

  return (
    <motion.div
      className={classes['side-box']}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={logoUrl}
        alt="stairs-image"
        width={100}
        height={100}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
      <h3>{data?.company.name}</h3>
      <h4 className={classes['site-link']}>
        <Link href={data?.company.url || '/'}>
          <HoveredItem>Visit Website</HoveredItem>
        </Link>
      </h4>
      <section>
        <h4>Employment Type:</h4>
        <p>
          {capitalize(
            data!.employmentType.map((v: string) => toKebabCase(v)).join(', ')
          )}
        </p>
      </section>
      <section>
        <h4>Work Format:</h4>
        <p>{capitalize(data!.workFormat.join(', '))}</p>
      </section>
      <section>
        <h4>Office Location:</h4>
        <p className={classes.office}>{data?.officeLocation}</p>
      </section>
      <section>
        <h4>Salary:</h4>
        <p>
          {data?.salaryMin} - {data?.salaryMax} $
        </p>
      </section>
      {!companyId && applyBtn && <ApplyBtn vacancyId={data?.id} />}

      {companyId === data?.company.id && (
        <>
          <h3 className="underline-link">
            {data?.isActive ? 'Is Active' : 'Not Active'}
          </h3>

          <Link
            href={`/my-profile/recruiter/company/vacancies/edit-vacancy/${data?.id}`}
            className={classes['edit-link']}
          >
            <HoveredItem>Edit vacancy</HoveredItem>
          </Link>
        </>
      )}
    </motion.div>
  );
}
