export type RecruiterProfileData = {
  id: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MEMBER';
  avatarUrl: string | null;
  createdAt: string;
  companyId: string | null;
};

export type RecruiterProfileFormData = Pick<
  RecruiterProfileData,
  'firstName' | 'lastName'
>;

export type RecruiterPersonalData = Pick<
  RecruiterProfileData,
  'firstName' | 'lastName' | 'role'
>;

export type UpdateRecruiterData = Partial<
  Pick<RecruiterProfileData, 'firstName' | 'lastName' | 'avatarUrl'>
>;
