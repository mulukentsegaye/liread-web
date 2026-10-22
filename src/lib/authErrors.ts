/**
 * Translates raw Supabase Auth errors into messages a reader can act on.
 */

export const describeAuthError = (error: unknown): string => {
  const err = error as {
    message?: string;
    code?: string;
    status?: number;
  } | null;

  if (!err) return 'An unexpected error occurred. Please try again.';

  const message = err.message || '';
  const code = err.code || '';
  const lower = message.toLowerCase();

  if (lower.includes('supabase') || lower.includes('postgrest') || lower.includes('failed to fetch') || lower.includes('networkrequestfailed')) {
    return 'Unable to reach the authentication service. Please check your connection and try again.';
  }

  if (code === 'over_email_send_rate_limit' || lower.includes('email rate limit')) {
    return 'Email rate limit reached. Please wait a few minutes and try again.';
  }

  if (code === 'email_address_not_authorized' || lower.includes('cannot be used as it is not authorized')) {
    return 'This email address is not authorized. Please use a different email or contact support.';
  }

  if (code === 'over_request_rate_limit' || lower.includes('request rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (lower.includes('error sending confirmation email')) {
    return "Your account was created, but we couldn't send the confirmation email. Please try resending it in a minute.";
  }

  if (lower.includes('email not confirmed')) {
    return 'Your email address is not confirmed yet. Check your inbox for the confirmation link, or click "Resend confirmation email" below.';
  }

  if (lower.includes('token has expired') || lower.includes('invalid token') || lower.includes('email link is invalid') || lower.includes('otp expired')) {
    return 'This confirmation link has expired or has already been used. Please request a new one below.';
  }

  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }

  if (lower.includes('database error saving new user') || lower.includes('profiles_username_key')) {
    return 'This username or email is already registered. Try signing in instead.';
  }

  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }

  if (lower.includes('unable to validate email')) {
    return 'That email address could not be validated. Please use a valid address.';
  }

  return message || 'An unexpected error occurred. Please try again.';
};
