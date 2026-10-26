/**
 * Translates raw Supabase Auth errors into professional messages suitable for readers.
 * Never leaks internal infrastructure details, quotas, rate limits, or backend thresholds.
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

  // 1. Connection / Network errors
  if (lower.includes('supabase') || lower.includes('postgrest') || lower.includes('failed to fetch') || lower.includes('networkrequestfailed')) {
    return 'Unable to reach the authentication service. Please check your connection and try again.';
  }

  // 2. Rate / Hourly / Quota limits — never expose internal backend limits to the user
  if (
    err.status === 429 ||
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    code === 'rate_limit_exceeded' ||
    code === 'over_sms_send_rate_limit' ||
    lower.includes('rate limit') ||
    lower.includes('rate_limit') ||
    lower.includes('hourly') ||
    lower.includes('too many requests') ||
    lower.includes('for security purposes') ||
    lower.includes('limit reached') ||
    lower.includes('limit exceeded') ||
    lower.includes('quota') ||
    lower.includes('over_email_send') ||
    lower.includes('over_request')
  ) {
    return 'Unable to access this service right now. Please try again later.';
  }

  // 3. Email authorization issues
  if (code === 'email_address_not_authorized' || lower.includes('cannot be used as it is not authorized')) {
    return 'This email address is not authorized. Please use a different email or contact support.';
  }

  // 4. Email delivery issues
  if (lower.includes('error sending confirmation email') || lower.includes('error sending reset')) {
    return 'Unable to access this service right now. Please try again later.';
  }

  // 5. Unconfirmed accounts
  if (lower.includes('email not confirmed')) {
    return 'Your email address is not confirmed yet. Check your inbox for the confirmation link, or click "Resend confirmation email" below.';
  }

  // 6. Expired / Invalid tokens
  if (lower.includes('token has expired') || lower.includes('invalid token') || lower.includes('email link is invalid') || lower.includes('otp expired')) {
    return 'This confirmation link has expired or has already been used. Please request a new one below.';
  }

  // 7. Invalid credentials
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }

  // 8. Duplicate account / username conflicts
  if (lower.includes('database error saving new user') || lower.includes('profiles_username_key')) {
    return 'This username or email is already registered. Try signing in instead.';
  }

  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  // 9. Validation rules
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }

  if (lower.includes('unable to validate email')) {
    return 'That email address could not be validated. Please use a valid address.';
  }

  // Final safety check: never leak internal rate limits, quotas, or infrastructure messages to the reader
  if (lower.includes('limit') || lower.includes('rate') || lower.includes('quota') || lower.includes('throttle')) {
    return 'Unable to access this service right now. Please try again later.';
  }

  return message || 'An unexpected error occurred. Please try again.';
};
