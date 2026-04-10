import { FeedingRecord, CreateFeedingDTO } from '@/types/domain/feeding.schema';

export interface IFeedingRepository {
  /**
   * Obtiene el historial de alimentación de un animal
   */
  getByAnimal(animalId: string): Promise<FeedingRecord[]>;
  
  /**
   * Registra una alimentación y descuenta stock automáticamente (vía RPC)
   */
  addFeeding(data: CreateFeedingDTO): Promise<void>;
  
  /**
   * Obtiene un resumen de alimentación (opcional)
   */
  getFeedingSummaryByAnimal(animalId: string): Promise<any>;
}
