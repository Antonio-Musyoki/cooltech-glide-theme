import { z } from 'zod';

// Shared field validators
const nameField = z.string().trim().min(1, 'Name is required').max(200, 'Name must be under 200 characters');
const emailField = z.string().trim().email('Invalid email address').max(254, 'Email must be under 254 characters');
const phoneField = z.string().trim().max(50, 'Phone must be under 50 characters').optional().or(z.literal(''));
const messageField = z.string().trim().max(10000, 'Message must be under 10,000 characters');

export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  subject: z.string().trim().max(300, 'Subject must be under 300 characters').optional().or(z.literal('')),
  message: messageField.min(1, 'Message is required'),
});

export const quoteSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  company: z.string().trim().max(300, 'Company name must be under 300 characters').optional().or(z.literal('')),
  service_type: z.string().trim().max(200, 'Service type must be under 200 characters').optional().or(z.literal('')),
  message: messageField.optional().or(z.literal('')),
});

export const bookingSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  address: z.string().trim().max(500, 'Address must be under 500 characters').optional().or(z.literal('')),
  service_type: z.string().trim().max(200, 'Service type must be under 200 characters').optional().or(z.literal('')),
  preferred_date: z.string().optional().or(z.literal('')),
  preferred_time: z.string().trim().max(50).optional().or(z.literal('')),
  message: messageField.optional().or(z.literal('')),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type QuoteFormData = z.infer<typeof quoteSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;

/**
 * Validate form data and return parsed data or error messages
 */
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => e.message),
  };
}
