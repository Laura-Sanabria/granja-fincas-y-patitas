import type {
  CreateReproductiveEventDTO,
  ReproductiveEvent,
  ReproductiveEventWithRelations,
  ReproductiveAnimalMini,
  UpdateReproductiveEventDTO,
} from '@/types/domain/reproduction.schema';

export interface IReproductionRepository {
  list(): Promise<ReproductiveEventWithRelations[]>;
  create(data: CreateReproductiveEventDTO): Promise<ReproductiveEvent>;
  update(id: string, data: UpdateReproductiveEventDTO): Promise<ReproductiveEvent>;
  listAnimalsBySex(sex: 'macho' | 'hembra'): Promise<ReproductiveAnimalMini[]>;
  listByAnimal(animalId: string): Promise<ReproductiveEventWithRelations[]>;
}
