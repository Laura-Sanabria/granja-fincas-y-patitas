import { z } from 'zod';

export const HealthEventTypeEnum = z.enum(['enfermedad', 'accidente', 'lesion', 'otro']);
export const RecoveryStatusEnum = z.enum(['en_tratamiento', 'recuperado', 'cronico', 'fallecido']);

export const HealthEventSchema = z.object({
  id: z.string().uuid(),
  animal_id: z.string().uuid(),
  event_type: HealthEventTypeEnum,
  detected_at: z.string(), // SQL date
  description: z.string(),
  diagnosis: z.string().nullable().optional(),
  recovery_status: RecoveryStatusEnum.default('en_tratamiento'),
  resolved_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  registered_by: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type HealthEvent = z.infer<typeof HealthEventSchema>;

export const CreateHealthEventSchema = HealthEventSchema.omit({
  id: true,
  created_at: true
});

export type CreateHealthEventDTO = z.infer<typeof CreateHealthEventSchema>;
