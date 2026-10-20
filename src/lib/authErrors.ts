/**
 * Translates raw Supabase Auth errors into messages a reader can act on.
 *
 * The most common one on a fresh project is the Auth email rate limit:
 * the built-in Supabase email service allows only a couple of messages per
 * hour for the whole project, so account creation fails until custom SMTP
 * is configured (or email confirmation is turned off for local development).
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

  if (code === 'over_email_send_rate_limit' || lower.includes('email rate limit')) {
    return 'This project has hit the Supabase email sending limit, so the confirmation email could not be sent. Add a custom SMTP provider (or turn off "Confirm email" for local testing) in Authentication → Emails, then try again.';
  }

  if (code === 'email_address_not_authorized' || lower.includes('cannot be used as it is not authorized')) {
    return 'The built-in Supabase email service only delivers to your team members. Configure a custom SMTP provider in Authentication → Emails to accept registrations from any address.';
  }

  if (code === 'over_request_rate_limit' || lower.includes('request rate limit')) {
    return 'Too many attempts from this device. Please wait a moment and try again.';
  }

  if (lower.includes('error sending confirmation email')) {
    return 'Your account was created, but the confirmation email could not be sent. Check your SMTP settings in Authentication → Emails, then request a new confirmation link.';
  }

  if (lower.includes('email not confirmed')) {
    return 'Your email address is not confirmed yet. Check your inbox for the confirmation link before signing in.';
  }

  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }

  if (lower.includes('database error saving new user') || lower.includes('profiles_username_key')) {
    return 'This username or email is already registered. If you already created your account, please switch to the "Sign In" tab.';
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
