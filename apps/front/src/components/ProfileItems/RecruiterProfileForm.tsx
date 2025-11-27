import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Field, Form, Formik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import AnimatedIcon from '../HoveredItem/HoveredItem';
import MessageBox from '../MessageBox/MessageBox';

import classes from './Profile.module.css';

import { RecruiterProfileFormData } from '@/types/recruiter';
import { useModalStore } from '@/store/modalSlice';
import { createRecruiterProfile } from '@/services/recruiterProfileService';
import { validateCreateRecruiterForm } from '@/utils/recruiterValidation';

const initialValues: RecruiterProfileFormData = {
  firstName: '',
  lastName: '',
};

export default function RecruiterProfileForm() {
  const [requestErrors, setRequestErrors] = useState<string[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const closeModal = useModalStore((state) => state.closeModal);
  const { mutate: createProfile, isPending } = useMutation({
    mutationFn: createRecruiterProfile,
    onSuccess: async () => {
      setRequestErrors([]);
      await queryClient.invalidateQueries({ queryKey: ['recruiter-profile'] });
      closeModal();
      router.push('/my-profile/recruiter');
    },

    onError: (error) => {
      setRequestErrors([error.message]);
    },
  });
  return (
    <Formik
      initialValues={initialValues}
      validate={validateCreateRecruiterForm}
      onSubmit={(values) => {
        createProfile(values);
      }}
    >
      {({ errors }) => (
        <Form>
          <h1>Create Your Recruiter Profile</h1>
          <h2>Tell us about yourself</h2>

          <div className={classes['profile-form']}>
            <div>
              <p>1. First Name</p>
              <Field
                className={classes['form-input']}
                name="firstName"
                placeholder="Bob"
                type="text"
              />
            </div>

            <div>
              <p>2. Last Name</p>
              <Field
                className={classes['form-input']}
                name="lastName"
                placeholder="Coolman"
                type="text"
              />
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className={classes['error-container']}>
              {Object.values(errors).map((err) => (
                <MessageBox key={err}>{err}</MessageBox>
              ))}
            </div>
          )}

          {requestErrors.length > 0 && (
            <div className={classes['error-container']}>
              {requestErrors.map((error) => {
                return <MessageBox key={error}>{error}</MessageBox>;
              })}
            </div>
          )}

          <h5>
            You can change this information anytime in your{' '}
            <span className="font-weight-600">Profile Page</span>
          </h5>
          <div className="row-space-between">
            <div className="align-center">
              <Link href="/my-profile/job-seeker" className={classes['link']}>
                I am not a recruiter
              </Link>
            </div>

            <button
              className={classes['profile-form-btn']}
              type="submit"
              disabled={isPending}
            >
              <AnimatedIcon>
                {isPending ? 'Creating...' : 'Create Profile'}
              </AnimatedIcon>
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
