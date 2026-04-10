import { HealthEvent, CreateHealthEventDTO } from '@/types/domain/health.schema';

export interface IHealthRepository {
  /**
   * Obtiene el historial clínico de un animal
   */
  getByAnimal(animalId: string): Promise<HealthEvent[]>;
  
  /**
   * Registra un nuevo evento de salud (vacuna, tratamiento, consulta)
   */
  addEvent(data: CreateHealthEventDTO): Promise<HealthEvent>;
  
  /**
   * Obtiene las alertas de salud/vacunación próximas (usualmente de una vista)
   */
  getHealthAlerts(): Promise<any[]>;
}
