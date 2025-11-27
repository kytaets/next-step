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
