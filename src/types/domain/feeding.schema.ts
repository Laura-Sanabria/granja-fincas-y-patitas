import { z } from 'zod';

export const FeedingRecordSchema = z.object({
  id: z.string().uuid(),
  animal_id: z.string().uuid(),
  supply_id: z.string().uuid(), // Link to the feed/food in supplies
  quantity: z.number().positive(),
  unit: z.string(), // Extracted from supply usually
  feeding_date: z.string(), // ISO date/time
  notes: z.string().nullable().optional(),
  registered_by: z.string().uuid().nullable().optional(),
  created_at: z.string().optional()
});

export type FeedingRecord = z.infer<typeof FeedingRecordSchema>;

export const CreateFeedingDTO = FeedingRecordSchema.omit({
  id: true,
  unit: true, // Unit should be derived or sent separately
  created_at: true
});

export type CreateFeedingDTO = z.infer<typeof CreateFeedingDTO>;
