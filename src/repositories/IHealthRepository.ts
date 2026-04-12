import {
  HealthEvent,
  CreateHealthEventInput,
  AnimalEvent,
  AnimalTimelineFilter,
} from '@/types/domain/health.schema';

export interface IHealthRepository {
  /** Historial clínico detallado (tabla health_events) */
  getByAnimal(animalId: string): Promise<HealthEvent[]>;

  /** Alta de evento de salud + tratamientos opcionales (RF016) */
  addHealthEvent(input: CreateHealthEventInput): Promise<HealthEvent>;

  /** Línea de tiempo unificada por animal (animal_events, RF012) */
  getTimelineByAnimal(
    animalId: string,
    filter?: AnimalTimelineFilter
  ): Promise<AnimalEvent[]>;

  /** Alertas simples: animales con eventos de salud en tratamiento */
  getHealthAlerts(): Promise<unknown[]>;
}
