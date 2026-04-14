import { z } from 'zod';

export const GestationStatusEnum = z.enum([
  'en_seguimiento',
  'confirmada',
  'fallida',
  'parto_exitoso',
]);

export const ReproductiveEventTypeEnum = z.enum(['monta_natural', 'inseminacion_artificial']);

export const ReproductiveEventSchema = z.object({
  id: z.string().uuid(),
  female_animal_id: z.string().uuid(),
  event_type: ReproductiveEventTypeEnum,
  event_date: z.string(),
  male_animal_id: z.string().uuid().nullable().optional(),
  male_external: z.string().nullable().optional(),
  gestation_status: GestationStatusEnum,
  estimated_birth_date: z.string().nullable().optional(),
  actual_birth_date: z.string().nullable().optional(),
  failure_reason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  registered_by: z.string().uuid(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ReproductiveEvent = z.infer<typeof ReproductiveEventSchema>;
export type GestationStatus = z.infer<typeof GestationStatusEnum>;

export type ReproductiveAnimalMini = {
  id: string;
  code: string;
  name?: string | null;
  species_id?: string;
  breed?: { name: string } | null;
};

export type ReproductiveEventWithRelations = ReproductiveEvent & {
  female_animal?: ReproductiveAnimalMini | null;
  male_animal?: ReproductiveAnimalMini | null;
};

export const CreateReproductiveEventSchema = z
  .object({
    female_animal_id: z.string().uuid(),
    event_type: ReproductiveEventTypeEnum,
    event_date: z.string().min(1),
    male_animal_id: z.string().uuid().nullable().optional(),
    male_external: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .refine((d) => !(d.male_animal_id && d.male_external?.trim()), {
    message: 'Indique solo macho registrado o solo padre externo, no ambos.',
  });

export type CreateReproductiveEventDTO = z.infer<typeof CreateReproductiveEventSchema>;

export const UpdateReproductiveEventSchema = z.object({
  gestation_status: GestationStatusEnum,
  failure_reason: z.string().nullable().optional(),
  actual_birth_date: z.string().nullable().optional(),
  estimated_birth_date: z.string().nullable().optional(),
});

export type UpdateReproductiveEventDTO = z.infer<typeof UpdateReproductiveEventSchema>;
