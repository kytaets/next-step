'use client';

import { Field, Form, Formik } from 'formik';
import HoveredItem from '../HoveredItem/HoveredItem';

import classes from '../CompanyProfileItems/CompanyProfile.module.css';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import MessageBox from '../MessageBox/MessageBox';
import { sendApplication } from '@/services/application';

interface Props {
  vacancyId: string | undefined;
}

export default function ApplyFormModal({ vacancyId }: Props) {
  const [requestError, setRequestError] = useState<string | null>(null);

  const {
    mutate: sendApplicationFn,
    isError,
    isSuccess,
    isPending,
  } = useMutation({
    mutationFn: sendApplication,
    onSuccess: async () => {
      setRequestError(null);
    },

    onError: (error) => {
      setRequestError(error.message);
    },
  });

  return (
    <div className={classes['invitation-modal']}>
      <h2>Send invitation</h2>
      <Formik
        initialValues={{ coverLetter: '' }}
        onSubmit={(values) => {
          sendApplicationFn({
            coverLetter:
              values.coverLetter?.trim() === ''
                ? null
                : values.coverLetter?.trim(),
            vacancyId: vacancyId || '',
          });
        }}
      >
        {({ errors, touched }) => (
          <Form className={classes['invitation-form']}>
            <div className={classes['invitation-form-container']}>
              <Field
                name="coverLetter"
                as="textarea"
                rows={10}
                placeholder="Write a few words for recruiter..."
                className={`${classes['form-input']} ${classes['form-details']}`}
              />
            </div>

            {errors.coverLetter && touched.coverLetter && (
              <div className={classes['validation-error']}>
                {errors.coverLetter}
              </div>
            )}
            {isError && <MessageBox type="error">{requestError}</MessageBox>}
            {isSuccess && (
              <MessageBox type="info">
                Application sent successfully!
              </MessageBox>
            )}
            <div className={classes['info-form-btn-container']}>
              <button
                type="submit"
                className={classes['info-form-btn']}
                disabled={isPending}
              >
                <HoveredItem scale={1.07}>
                  {!isPending ? 'Send invitation' : 'Sending...'}
                </HoveredItem>
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
