/**
 * Form Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

/**
 * Validate a single field value against rules
 */
export function validateField(value: any, rules: ValidationRule): string | null {
  // Required check
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'This field is required';
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  const stringValue = String(value);

  // Min length check
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  // Max length check
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`;
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return 'Invalid format';
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

/**
 * Validate an entire form object against a schema
 */
export function validateForm(data: { [key: string]: any }, schema: ValidationSchema): ValidationResult {
  const errors: { [key: string]: string } = {};
  let isValid = true;

  for (const fieldName in schema) {
    const error = validateField(data[fieldName], schema[fieldName]);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  url: /^https?:\/\/.+/,
  positiveNumber: /^\d*\.?\d+$/,
  integer: /^\d+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
};

/**
 * Predefined validation schemas
 */
export const ValidationSchemas = {
  // Client validation
  client: {
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true, pattern: ValidationPatterns.email },
    phone: { pattern: ValidationPatterns.phone },
    company: { maxLength: 100 },
    country: { maxLength: 50 },
  },

  // Project validation
  project: {
    title: { required: true, minLength: 3, maxLength: 200 },
    description: { maxLength: 2000 },
    totalBudget: { required: true, pattern: ValidationPatterns.positiveNumber },
    deadline: { required: true },
    clientId: { required: true },
  },

  // Invoice validation
  invoice: {
    clientId: { required: true },
    docNumber: { required: true, minLength: 2, maxLength: 50 },
    items: {
      custom: (items: any[]) => {
        if (!items || items.length === 0) {
          return 'At least one item is required';
        }
        for (const item of items) {
          if (!item.description || item.description.trim() === '') {
            return 'All items must have a description';
          }
          if (!item.quantity || item.quantity <= 0) {
            return 'All items must have a valid quantity';
          }
          if (!item.rate || item.rate < 0) {
            return 'All items must have a valid rate';
          }
        }
        return null;
      }
    },
    dueDate: { required: true },
  },

  // Settings validation
  settings: {
    businessName: { required: true, minLength: 2, maxLength: 100 },
    businessEmail: { required: true, pattern: ValidationPatterns.email },
    businessPhone: { pattern: ValidationPatterns.phone },
    businessAddress: { required: true, minLength: 5, maxLength: 500 },
    bankName: { maxLength: 100 },
    accountNumber: { maxLength: 50 },
    routingNumber: { maxLength: 20 },
    swiftCode: { pattern: /^[A-Z]{6}[A-Z0-9]{2}?$/ },
    payPal: { pattern: ValidationPatterns.email },
  },

  // Auth validation
  auth: {
    email: { required: true, pattern: ValidationPatterns.email },
    password: {
      required: true,
      minLength: 8,
      custom: (value: string) => {
        if (!/[A-Z]/.test(value)) {
          return 'Must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(value)) {
          return 'Must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(value)) {
          return 'Must contain at least one number';
        }
        return null;
      }
    },
    confirmPassword: {
      custom: (value: string, formData?: { password?: string }) => {
        if (formData && formData.password && value !== formData.password) {
          return 'Passwords do not match';
        }
        return null;
      }
    }
  }
};

/**
 * Real-time validation hook for React forms
 */
export function useValidation<T extends { [key: string]: any }>(
  data: T,
  schema: ValidationSchema
): { errors: { [key: string]: string }; isValid: boolean } {
  const result = validateForm(data, schema);
  return {
    errors: result.errors,
    isValid: result.isValid
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return ValidationPatterns.email.test(email);
}

/**
 * Validate phone format
 */
export function isValidPhone(phone: string): boolean {
  return ValidationPatterns.phone.test(phone);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  return ValidationPatterns.url.test(url);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}
