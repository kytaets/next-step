'use client';

import { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import AnimatedIcon from '@/components/HoveredItem/HoveredItem';

import classes from './Profile.module.css';
import { updatePersonalData } from '@/services/jobseekerService';
import { validateAvatarUrl } from '@/utils/profileValidation';
import { updateCompanyProfile } from '@/services/companyProfileService';
import { updateRecruiterProfile } from '@/services/recruiterProfileService';
import MessageBox from '../MessageBox/MessageBox';

interface Props {
  url: string;
  type?: 'job-seeker' | 'company' | 'recruiter';
}

export default function AvatarModal({ url, type }: Props) {
  const [requestError, setRequestError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate: updateAvatar, isPending } = useMutation({
    mutationFn: updatePersonalData,
    onSuccess: async (result) => {
      if (result.status === 'error') {
        setRequestError(result.error);
        return;
      }
      setRequestError(null);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const { mutate: updateCompanyAvatar, isPending: isCompanyPending } =
    useMutation({
      mutationFn: updateCompanyProfile,
      onSuccess: async () => {
        setRequestError(null);
        await queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      },

      onError: (error) => {
        setRequestError(error.message);
      },
    });

  const { mutate: updateRecruiterAvatar, isPending: isRecruiterPending } =
    useMutation({
      mutationFn: updateRecruiterProfile,
      onSuccess: async () => {
        setRequestError(null);
        await queryClient.invalidateQueries({
          queryKey: ['recruiter-profile'],
        });
      },
      onError: (error) => {
        setRequestError(error.message ?? 'Unexpected error');
      },
    });

  return (
    <Formik
      initialValues={{ url: url ?? '' }}
      validate={validateAvatarUrl}
      onSubmit={(values) => {
        if (type === 'job-seeker')
          updateAvatar({
            avatarUrl: values.url?.trim() === '' ? null : values.url?.trim(),
          });
        if (type === 'company')
          updateCompanyAvatar({
            logoUrl: values.url?.trim() === '' ? null : values.url?.trim(),
          });

        if (type === 'recruiter') {
          updateRecruiterAvatar({
            avatarUrl: values.url?.trim() === '' ? null : values.url?.trim(),
          });
        }
      }}
    >
      {({ errors, touched }) => (
        <Form className={classes['avatar-form']}>
          <div className={classes['avatar-form-container']}>
            <Field
              name="url"
              type="text"
              placeholder="Enter avatar image URL"
              className={`${classes['form-input']} ${classes['form-details']}`}
            />

            <button
              type="submit"
              className={classes['info-form-btn']}
              disabled={isPending || isCompanyPending || isRecruiterPending}
            >
              <AnimatedIcon scale={1.07}>
                {!isPending || !isCompanyPending || isRecruiterPending
                  ? 'Save changes'
                  : 'Saving...'}
              </AnimatedIcon>
            </button>
          </div>

          {errors.url && touched.url && (
            <div className={classes['validation-error']}>{errors.url}</div>
          )}
          {requestError && (
            <div className={classes['request-error']}>
              <MessageBox type="error">{requestError}</MessageBox>
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
}
