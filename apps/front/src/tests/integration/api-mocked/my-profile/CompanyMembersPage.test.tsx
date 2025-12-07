/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ===============================
// 🔧 MOCK router
// ===============================
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// ===============================
// 🔧 MOCK Cookies
// ===============================
let cookieStore: Record<string, string | undefined> = {};

jest.mock('js-cookie', () => ({
  get: (key: string) => cookieStore[key],
}));

// ===============================
// 🔧 MOCK SERVICE
// ===============================
jest.mock('@/services/companyProfileService', () => ({
  getMyMembers: jest.fn(),
}));

// ===============================
// 🔧 MOCK COMPONENT
// ===============================
jest.mock(
  '@/components/CompanyProfileItems/CompanyMembersContainer',
  () => (props: any) => (
    <div>CompanyMembersContainer {props.members?.length}</div>
  )
);

import CompanyMembers from '@/app/my-profile/recruiter/company/members/CompanyMembers';
import { getMyMembers } from '@/services/companyProfileService';

// ===============================
// helper renderer
// ===============================
function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <CompanyMembers />
    </QueryClientProvider>
  );
}

// ===============================
// TESTS
// ===============================
describe('CompanyMembers page tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cookieStore = {}; // clear cookie mock
    jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
      if (
        typeof msg === 'string' &&
        msg.includes('Query data cannot be undefined')
      ) {
        return; // ignore ONLY this warning
      }
      console.warn(msg, ...args); // keep other warnings visible
    });
  });

  // -------------------------------------------
  test('redirects if no company-id cookie exists', async () => {
    cookieStore['company-id'] = undefined;

    renderPage();

    expect(pushMock).toHaveBeenCalledWith('/my-profile/recruiter/company');
  });

  // -------------------------------------------
  test('shows loading state', async () => {
    cookieStore['company-id'] = '123';

    (getMyMembers as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(
      await screen.findByText(/loading your members/i)
    ).toBeInTheDocument();
  });

  // -------------------------------------------
  test('shows error message on failure', async () => {
    cookieStore['company-id'] = '123';

    (getMyMembers as jest.Mock).mockRejectedValue({
      message: 'Server error',
    });

    renderPage();

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });

  // -------------------------------------------
  test('renders members on success', async () => {
    cookieStore['company-id'] = '123';

    (getMyMembers as jest.Mock).mockResolvedValue([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Anna Smith' },
    ]);

    renderPage();

    expect(
      await screen.findByText(/CompanyMembersContainer 2/)
    ).toBeInTheDocument();
  });
});
