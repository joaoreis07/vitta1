const SESSION_KEY = 'nara_finance_session';

const LOCAL_FINANCE_USER = 'cliente';
const LOCAL_FINANCE_PASSWORD = 'vitta2026';

export async function financeLogin(user: string, password: string): Promise<boolean> {
  const ok =
    user.trim().toLowerCase() === LOCAL_FINANCE_USER &&
    password === LOCAL_FINANCE_PASSWORD;
  if (ok) sessionStorage.setItem(SESSION_KEY, 'ok');
  return ok;
}

export async function financeLogout(): Promise<void> {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function checkFinanceLoggedIn(): Promise<boolean> {
  return sessionStorage.getItem(SESSION_KEY) === 'ok';
}

export const FINANCE_DEMO_USER = LOCAL_FINANCE_USER;
export const FINANCE_DEMO_PASSWORD = LOCAL_FINANCE_PASSWORD;
