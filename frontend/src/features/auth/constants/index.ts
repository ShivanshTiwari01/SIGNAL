import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be 8 characters long'),
});

export const signUpSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be 8 characters long'),
});

export const verifyEmailSchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 characters long'),
});

export const completeProfileSchema = z.object({
  bio: z.string().max(300, 'Bio must be under 300 characters').optional(),
  dob: z.string().optional(),
  mobile: z.string().optional(),
});

export const AUTH_ERRORS: Record<string, string> = {
  form_identifier_not_found: 'No account found with this email.',
  form_password_incorrect: 'Incorrect password.',
  form_identifier_exists: 'An account with this email already exists.',
  too_many_requests: 'Too many attempts. Please wait and try again.',
};
