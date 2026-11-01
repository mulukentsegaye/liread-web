/**
 * Email Validation & Typo Detection Service
 *
 * Protects Supabase hourly email auth quotas and prevents user confusion by:
 * 1. Enforcing strict RFC syntax validation.
 * 2. Detecting domain typos (e.g., gamil.com, hotmial.con, yaho.com) and proposing corrections.
 * 3. Detecting disposable / burner email domains.
 * 4. Querying DNS-over-HTTPS (DoH) to verify that the domain exists (not NXDOMAIN)
 *    and has valid mail exchange (MX / A) records before sending confirmation emails.
 */

// Popular email providers and their canonical domains
const POPULAR_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'live.com',
  'msn.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'zoho.com',
];

// Explicit mappings for common domain typos
const KNOWN_DOMAIN_TYPOS: Record<string, string> = {
  // Gmail typos
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gmai.co': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaii.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.om': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'gemail.com': 'gmail.com',
  'gmaul.com': 'gmail.com',
  'gmaio.com': 'gmail.com',
  'gmail.cpm': 'gmail.com',
  'gmail.comm': 'gmail.com',
  'gmai.net': 'gmail.com',
  'gmai.org': 'gmail.com',

  // Yahoo typos
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yahoo.cm': 'yahoo.com',
  'ymail.con': 'yahoo.com',
  'yahou.com': 'yahoo.com',
  'yaho.org': 'yahoo.com',
  'yahoo.cpm': 'yahoo.com',
  'yahoo.comm': 'yahoo.com',

  // Hotmail typos
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmial.co': 'hotmail.com',
  'otmail.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmail.cm': 'hotmail.com',
  'hotmeil.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'homail.com': 'hotmail.com',
  'hotmail.cpm': 'hotmail.com',
  'hotmail.comm': 'hotmail.com',

  // Outlook typos
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'outlook.cm': 'outlook.com',
  'outlock.com': 'outlook.com',
  'outloock.com': 'outlook.com',
  'outluk.com': 'outlook.com',
  'outlook.cpm': 'outlook.com',

  // iCloud typos
  'iclou.com': 'icloud.com',
  'icoud.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'icloud.con': 'icloud.com',
  'iclould.com': 'icloud.com',
  'icloud.cpm': 'icloud.com',

  // Proton typos
  'protonmial.com': 'proton.me',
  'protonmai.com': 'proton.me',
  'proton.con': 'proton.me',
  'protonmail.con': 'protonmail.com',
};

// Common TLD typos
const TLD_TYPOS: Record<string, string> = {
  con: 'com',
  cmo: 'com',
  ocm: 'com',
  xom: 'com',
  vom: 'com',
  cpm: 'com',
  comm: 'com',
  ner: 'net',
  ney: 'net',
  og: 'org',
  ogr: 'org',
  eddu: 'edu',
};

// Disposable temporary email domains that burn email quotas
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'yopmail.com',
  'trashmail.com',
  'getairmail.com',
  'throwawaymail.com',
  'sharklasers.com',
  'dispostable.com',
  'fakeinbox.com',
  'temp-mail.org',
  'mytemp.email',
  'generator.email',
]);

/**
 * Calculates Levenshtein edit distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

export interface EmailTypoSuggestion {
  hasTypo: boolean;
  suggestedEmail?: string;
  suggestedDomain?: string;
  originalDomain?: string;
  reason?: string;
}

export interface EmailVerificationResult {
  valid: boolean;
  error?: string;
  suggestion?: EmailTypoSuggestion;
}

export const emailValidationService = {
  /**
   * Check if the email address follows valid RFC syntax.
   */
  isValidSyntax(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const clean = email.trim();
    if (clean.length < 5 || clean.length > 254) return false;

    // RFC 5322 compliant regex for common email addresses
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(clean)) return false;

    const parts = clean.split('@');
    if (parts.length !== 2) return false;

    const [user, domain] = parts;
    if (!user || user.length > 64) return false;
    if (!domain || !domain.includes('.')) return false;

    const tld = domain.split('.').pop();
    if (!tld || tld.length < 2) return false;

    return true;
  },

  /**
   * Detects if the email has a common typo in the domain (e.g. gamil.com -> gmail.com)
   */
  detectTypo(email: string): EmailTypoSuggestion {
    const clean = email.trim().toLowerCase();
    const atIndex = clean.lastIndexOf('@');
    if (atIndex === -1) {
      return { hasTypo: false };
    }

    const user = clean.slice(0, atIndex);
    const domain = clean.slice(atIndex + 1);

    if (!domain || !user) {
      return { hasTypo: false };
    }

    // 1. Direct match in known typo dictionary
    if (KNOWN_DOMAIN_TYPOS[domain]) {
      const suggestedDomain = KNOWN_DOMAIN_TYPOS[domain];
      return {
        hasTypo: true,
        suggestedDomain,
        suggestedEmail: `${user}@${suggestedDomain}`,
        originalDomain: domain,
        reason: `Did you mean @${suggestedDomain}?`,
      };
    }

    // 2. Check TLD typo (e.g. user@gmail.con -> user@gmail.com)
    const domainParts = domain.split('.');
    if (domainParts.length >= 2) {
      const tld = domainParts[domainParts.length - 1];
      if (TLD_TYPOS[tld]) {
        domainParts[domainParts.length - 1] = TLD_TYPOS[tld];
        const suggestedDomain = domainParts.join('.');
        return {
          hasTypo: true,
          suggestedDomain,
          suggestedEmail: `${user}@${suggestedDomain}`,
          originalDomain: domain,
          reason: `Did you mean .${TLD_TYPOS[tld]} instead of .${tld}?`,
        };
      }
    }

    // 3. Fuzzy matching via Levenshtein distance against top providers (distance <= 2)
    for (const popular of POPULAR_DOMAINS) {
      if (domain !== popular && levenshteinDistance(domain, popular) <= 2) {
        return {
          hasTypo: true,
          suggestedDomain: popular,
          suggestedEmail: `${user}@${popular}`,
          originalDomain: domain,
          reason: `Did you mean @${popular}?`,
        };
      }
    }

    return { hasTypo: false };
  },

  /**
   * Check if domain is a known temporary burner / disposable service
   */
  isDisposable(email: string): boolean {
    const clean = email.trim().toLowerCase();
    const domain = clean.split('@').pop() || '';
    return DISPOSABLE_DOMAINS.has(domain);
  },

  /**
   * Verifies through DNS-over-HTTPS (DoH) that the domain exists and can receive email.
   * Uses Cloudflare DoH with Google DoH fallback.
   * If network query is offline or blocked, gracefully returns valid so users aren't locked out.
   */
  async verifyDomainDns(domain: string): Promise<{ exists: boolean; canReceiveMail: boolean; error?: string }> {
    const cleanDomain = domain.trim().toLowerCase();

    // Fast-pass for known major providers
    if (POPULAR_DOMAINS.includes(cleanDomain)) {
      return { exists: true, canReceiveMail: true };
    }

    // Abort controller with 3-second timeout to never block user interface
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      // 1. Try Cloudflare DNS-over-HTTPS for MX record
      const cfUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=MX`;
      const res = await fetch(cfUrl, {
        headers: { accept: 'application/dns-json' },
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        clearTimeout(timeoutId);

        // Status 3 = NXDOMAIN (Domain does NOT exist anywhere in public DNS)
        if (data.Status === 3) {
          return {
            exists: false,
            canReceiveMail: false,
            error: `The domain "@${cleanDomain}" does not exist. Please check your spelling.`,
          };
        }

        // If MX answers exist, the domain is actively configured for mail
        if (Array.isArray(data.Answer) && data.Answer.length > 0) {
          return { exists: true, canReceiveMail: true };
        }

        // If no MX records, check if the domain has an A record (fallback mail host per RFC 5321)
        const aRes = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=A`,
          { headers: { accept: 'application/dns-json' } }
        );
        if (aRes.ok) {
          const aData = await aRes.json();
          if (aData.Status === 3) {
            return {
              exists: false,
              canReceiveMail: false,
              error: `The domain "@${cleanDomain}" does not exist. Please check your spelling.`,
            };
          }
          if (Array.isArray(aData.Answer) && aData.Answer.length > 0) {
            return { exists: true, canReceiveMail: true };
          }
        }

        return {
          exists: true,
          canReceiveMail: false,
          error: `The domain "@${cleanDomain}" is not configured to receive emails.`,
        };
      }
    } catch {
      // Network failure, timeout, or DoH blocked by browser extension — fail open
    } finally {
      clearTimeout(timeoutId);
    }

    // Default to true if DNS query couldn't complete (e.g. offline dev or privacy firewall)
    return { exists: true, canReceiveMail: true };
  },

  /**
   * Complete validation pipeline: syntax check -> typo check -> disposable check -> DNS check.
   */
  async validateForRegistration(email: string): Promise<EmailVerificationResult> {
    const cleanEmail = email.trim();

    // 1. Syntax
    if (!this.isValidSyntax(cleanEmail)) {
      return {
        valid: false,
        error: 'Please enter a valid email address (e.g., name@example.com).',
      };
    }

    // 2. Typo
    const typo = this.detectTypo(cleanEmail);
    if (typo.hasTypo && typo.suggestedEmail) {
      return {
        valid: false,
        error: `Did you mean "${typo.suggestedEmail}"? Please correct your email before proceeding.`,
        suggestion: typo,
      };
    }

    // 3. Disposable
    if (this.isDisposable(cleanEmail)) {
      return {
        valid: false,
        error: 'Temporary or disposable email addresses are not accepted. Please use a permanent email address.',
      };
    }

    // 4. DNS MX verification
    const domain = cleanEmail.split('@')[1];
    const dns = await this.verifyDomainDns(domain);
    if (!dns.exists || !dns.canReceiveMail) {
      return {
        valid: false,
        error: dns.error || `The email domain "@${domain}" cannot receive mail. Please check for typos.`,
      };
    }

    return { valid: true };
  },
};
