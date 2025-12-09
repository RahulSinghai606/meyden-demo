import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      if (Object.hasOwn(input, key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }

  return input;
}

/**
 * Sanitize HTML input allowing safe tags
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
}

/**
 * Mask PII (Personally Identifiable Information) for logging
 */
export function maskPII(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(maskPII);
  }

  const masked = { ...data };
  const piiFields = [
    'password', 'email', 'phone', 'ssn', 'token', 'secret',
    'refreshToken', 'accessToken', 'resetToken', 'verificationToken',
    'creditCard', 'cvv', 'address',
  ];

  for (const key in masked) {
    if (Object.hasOwn(masked, key)) {
      const lowerKey = key.toLowerCase();
      const isPII = piiFields.some((field) => lowerKey.includes(field));

      if (isPII) {
        masked[key] = maskValue(key, masked[key]);
      } else if (typeof masked[key] === 'object') {
        masked[key] = maskPII(masked[key]);
      }
    }
  }

  return masked;
}

function maskValue(key: string, value: any): string {
  if (typeof value === 'string') {
    if (key.toLowerCase().includes('email') && value.includes('@')) {
      const parts = value.split('@');
      return `${parts[0][0]}***@${parts[1]}`;
    }
    return '***MASKED***';
  }
  return '***MASKED***';
}

/**
 * Sanitize user data for WebSocket broadcasting
 * Removes sensitive fields before sending to clients
 */
export function sanitizeUserForBroadcast(user: any): any {
  if (!user) return null;

  const {
    password,
    refreshToken,
    resetToken,
    verificationToken,
    loginAttempts,
    lockoutUntil,
    ...safeUser
  } = user;

  return safeUser;
}

/**
 * Sanitize request body
 */
export function sanitizeRequestBody(body: any): any {
  return sanitizeInput(body);
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
