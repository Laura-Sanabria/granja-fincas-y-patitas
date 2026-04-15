import { z } from 'zod';

export const ServiceTypeEnum = z.enum(['IA', 'monta_natural']);
export const ReproductiveEventTypeEnum = z.enum(['servicio', 'diagnostico', 'parto', 'secado', 'aborto']);
export const ReproductiveResultEnum = z.enum(['pendiente', 'positivo', 'negativo']);

export const ReproductiveEventSchema = z.object({
  id: z.string().uuid(),
  animal_id: z.string().uuid(),
  event_type: ReproductiveEventTypeEnum,
  event_date: z.string(),
  
  // Servicios
  service_type: ServiceTypeEnum.nullable().optional(),
  father_id: z.string().uuid().nullable().optional(),
  father_external: z.string().nullable().optional(),
  
  // Diagnóstico
  result: ReproductiveResultEnum.nullable().optional(),
  estimated_delivery_date: z.string().nullable().optional(),
  
  // Partos
  offspring_count: z.number().int().default(0),
  
  notes: z.string().nullable().optional(),
  responsible: z.string().min(2, 'Indica el responsable'),
  registered_by: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
});

export type ReproductiveEvent = z.infer<typeof ReproductiveEventSchema>;

export const CreateReproductiveEventSchema = ReproductiveEventSchema.omit({
  id: true,
  registered_by: true,
  created_at: true,
});

export type CreateReproductiveEventInput = z.infer<typeof CreateReproductiveEventSchema>;

// DTO para el formulario de Servicio
export const ServiceRegistrationSchema = z.object({
  animal_id: z.string().uuid(),
  event_date: z.string().min(1, 'Indica la fecha'),
  service_type: ServiceTypeEnum,
  father_id: z.string().uuid().optional(),
  father_external: z.string().optional(), // Uno de los dos debe estar
  responsible: z.string().min(2, 'Indica el responsable'),
  notes: z.string().optional(),
}).refine(data => data.father_id || data.father_external, {
  message: "Debes indicar el padre (macho interno o externo)",
  path: ["father_external"],
});

export type ServiceRegistrationInput = z.infer<typeof ServiceRegistrationSchema>;

// DTO para mostrar en tabla con Relaciones
export type ReproductiveEventWithRelations = ReproductiveEvent & {
  animal?: {
    code: string;
    notes: string | null;
    species: { display_name: string } | null;
    breed: { name: string } | null;
  } | null;
  father?: {
    code: string;
  } | null;
};
