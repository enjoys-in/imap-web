/**
 * Smart detection and extraction of OTP / Verification / Security codes from email messages.
 */

export interface DetectedOtp {
  code: string;
  formattedCode: string;
  expiresIn?: string;
  source: 'subject' | 'body';
  label?: string;
}

const AUTH_KEYWORDS = [
  'verification code',
  'security code',
  'confirmation code',
  'one-time passcode',
  'one-time password',
  'passcode',
  'otp',
  'auth code',
  'authentication code',
  'authorization code',
  'login code',
  'access code',
  '2-step',
  'two-factor',
  '2fa',
  'mfa',
  'verify your account',
  'confirm your identity',
  'sign-in code',
  'signin code',
  'reset code',
];

const AUTH_REGEX = new RegExp(`(?:${AUTH_KEYWORDS.join('|')})`, 'i');

function cleanHtmlText(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ');
}

function extractExpiry(text: string): string | undefined {
  const match = text.match(
    /(?:expires?|valid)\s*(?:in|for)?\s*(\d+\s*(?:minutes?|mins?|seconds?|secs?|hours?|hrs?))/i
  );
  return match ? match[1] : undefined;
}

function isYearOrFalsePositive(code: string): boolean {
  const cleanDigits = code.replace(/\D/g, '');
  if (cleanDigits.length === 4) {
    const num = parseInt(cleanDigits, 10);
    // Years between 1990 and 2035 are commonly in copyright / headers
    if (num >= 1990 && num <= 2035) return true;
  }
  // Exclude sequence of all identical digits (e.g. 000000 or 999999 if not explicitly an OTP)
  return false;
}

export function detectOtpCode(
  subject?: string,
  bodyText?: string,
  bodyHtml?: string
): DetectedOtp | null {
  const safeSubject = subject || '';
  const cleanedHtml = cleanHtmlText(bodyHtml);
  const safeBody = (bodyText || '') + ' ' + cleanedHtml;
  const combined = `${safeSubject} ${safeBody}`.trim();

  // 1. Must be in an authentication, verification or security context
  if (!AUTH_REGEX.test(combined) && !AUTH_REGEX.test(safeSubject)) {
    return null;
  }

  const expiresIn = extractExpiry(combined);

  // 2. Google-style G-XXXXXX pattern
  const googleMatch = combined.match(/\b(G-[0-9]{6})\b/i);
  if (googleMatch) {
    const code = googleMatch[1].toUpperCase();
    return {
      code,
      formattedCode: code,
      expiresIn,
      source: safeSubject.includes(code) ? 'subject' : 'body',
      label: 'Google Verification Code',
    };
  }

  // 3. Check subject directly (often subjects are "Your verification code is 123456" or "123456 is your code")
  if (safeSubject) {
    const subjHyphenMatch = safeSubject.match(/\b([0-9]{3})-([0-9]{3})\b/);
    if (subjHyphenMatch) {
      return {
        code: `${subjHyphenMatch[1]}${subjHyphenMatch[2]}`,
        formattedCode: `${subjHyphenMatch[1]}-${subjHyphenMatch[2]}`,
        expiresIn,
        source: 'subject',
      };
    }

    const subjMatch =
      safeSubject.match(/(?:code|is|otp)[\s:]+([0-9]{4,8})\b/i) ||
      safeSubject.match(/\b([0-9]{4,8})\b(?=[\s\w]*?(?:is\s*your\s*[\w\s]{0,25}?(?:verification|security|login|code)))/i);
    if (subjMatch && !isYearOrFalsePositive(subjMatch[1])) {
      return {
        code: subjMatch[1],
        formattedCode: subjMatch[1],
        expiresIn,
        source: 'subject',
      };
    }
  }

  // 4. Check for hyphenated codes in body: e.g. 123-456 or 1234-5678
  const hyphenMatch = combined.match(
    /(?:verification|security|confirmation|authentication|auth|one-time|login|passcode|otp)[\s\w()]{0,35}?(?:code|passcode|is|:)\s*[:=\-]?\s*["'\s]*\b([0-9]{3})-([0-9]{3})\b/i
  );
  if (hyphenMatch) {
    return {
      code: `${hyphenMatch[1]}${hyphenMatch[2]}`,
      formattedCode: `${hyphenMatch[1]}-${hyphenMatch[2]}`,
      expiresIn,
      source: 'body',
    };
  }

  // 5. Explicit high-precision patterns in combined text
  const patterns: RegExp[] = [
    // "verification code is 849201", "one-time passcode (OTP): 849201"
    /(?:verification|security|confirmation|authentication|auth|one-time|login|access|passcode|otp)[\s\w()]{0,35}?(?:code|passcode|pin|is|:)\s*[:=\-]?\s*["'\s]*\b([0-9]{4,8})\b/i,
    // "849201 is your Instagram verification code"
    /\b([0-9]{4,8})\b\s+is\s+(?:your\s+)?[\w\s]{0,25}?(?:code|passcode|otp|pin)\b/i,
    // "use code 849201 to verify"
    /(?:use|enter|type)\s+(?:the\s+)?(?:code\s+)?\b([0-9]{4,8})\b\s+(?:to\s+(?:verify|sign|log|complete))/i,
    // "Your verification code: 849201"
    /(?:your\s+)?(?:verification|security|one-time|login)\s*(?:code|passcode|otp)\s*[:\s]+\b([0-9]{4,8})\b/i,
    // "Code: 849201"
    /\bcode\s*[:=\-]\s*["'\s]*\b([0-9]{4,8})\b/i,
  ];

  for (const pat of patterns) {
    const match = combined.match(pat);
    if (match && match[1]) {
      const candidate = match[1];
      if (!isYearOrFalsePositive(candidate)) {
        return {
          code: candidate,
          formattedCode: candidate,
          expiresIn,
          source: 'body',
        };
      }
    }
  }

  // 6. If subject or body has an explicit heading for OTP and there is an isolated 4-8 digit number
  if (AUTH_REGEX.test(safeSubject)) {
    const isolatedMatch = safeSubject.match(/\b([0-9]{6})\b/) || safeBody.match(/\b([0-9]{6})\b/);
    if (isolatedMatch && !isYearOrFalsePositive(isolatedMatch[1])) {
      return {
        code: isolatedMatch[1],
        formattedCode: isolatedMatch[1],
        expiresIn,
        source: safeSubject.includes(isolatedMatch[1]) ? 'subject' : 'body',
      };
    }
  }

  return null;
}
