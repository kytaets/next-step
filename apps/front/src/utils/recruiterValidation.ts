import {
  RecruiterProfileFormData,
  UpdateRecruiterData,
} from '@/types/recruiter';

export function validateCreateRecruiterForm(
  values: RecruiterProfileFormData | UpdateRecruiterData
) {
  const errors: Partial<RecruiterProfileFormData> = {};

  if (!values.firstName?.trim()) {
    errors.firstName = 'First name is required';
  } else if (!/^[A-Za-z\s'-]{2,30}$/.test(values.firstName)) {
    errors.firstName =
      'First name must contain only letters and be 2–30 characters';
  }

  if (!values.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  } else if (!/^[A-Za-z\s'-]{2,30}$/.test(values.lastName)) {
    errors.lastName =
      'Last name must contain only letters and be 2–30 characters';
  }

  return errors;
}

export function validateInvitationForm(values: { email: string }) {
  console.log(values);
  const errors: { email?: string } = {};

  const email = values.email?.trim();

  if (!email) {
    errors.email = 'Email is required';
    return errors;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    errors.email = 'Invalid email format';
  }

  return errors;
}
