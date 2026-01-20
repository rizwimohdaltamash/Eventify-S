import * as z from 'zod';

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  location: z.string().min(1, 'Location is required'),
  date: z.string().min(1, 'Date is required'),
  capacity: z.number().positive('Capacity must be greater than 0').int('Capacity must be a whole number'),
});
