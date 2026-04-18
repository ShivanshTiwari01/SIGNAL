import * as z from 'zod';

export const completeProfileSchema = z.object({
  bio: z.string().optional(),
  dob: z.string().optional(),
});
