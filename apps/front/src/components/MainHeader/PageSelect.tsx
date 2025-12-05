'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import classes from './MainHeader.module.css';

export default function PageSelect() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const role = Cookies.get('role');

  const pages = [
    { label: 'Search for Vacancies', value: '/vacancies?page=1' },
    { label: 'Search for Companies', value: '/companies?page=1' },
  ];

  if (role === 'RECRUITER') {
    pages.push({
      label: 'Search for Job Seekers',
      value: '/job-seekers?page=1',
    });
  }

  const handleSelect = (page: { label: string; value: string }) => {
    setOpen(false);
    router.push(page.value);
  };

  return (
    <div className={classes.pageSelectWrapper}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={classes.pageSelectBtn}
      >
        Make your first step →
      </button>

      {open && (
        <div className={classes.pageSelectDropdown}>
          {pages.map((p) => (
            <div
              key={p.value}
              className={classes.pageSelectItem}
              onClick={() => handleSelect(p)}
            >
              {p.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
