import { Animal, AnimalWithRelations, CreateAnimalDTO, Species, Breed } from '@/types/domain/animal.schema';

export interface IAnimalRepository {
  /**
   * Obtiene todos los animales registrados
   */
  getAll(): Promise<AnimalWithRelations[]>;
  
  /**
   * Obtiene un animal por ID
   */
  getById(id: string): Promise<AnimalWithRelations | null>;
  
  /**
   * Registra un nuevo animal.
   * Internamente, el repositorio debe generar el identificador (code).
   */
  create(data: CreateAnimalDTO): Promise<Animal>;
  
  /**
   * Actualiza la información de un animal existente
   */
  update(id: string, data: Partial<Animal>): Promise<Animal>;
  
  /**
   * Cambia el estado de un animal a 'descartado' o 'vendido'
   */
  changeStatus(id: string, newStatus: Animal['status'], notes?: string): Promise<Animal>;

  // --- Utilidades para los formularios CRUD ---

  /**
   * Obtiene todas las especies disponibles (Vaca, Cerdo, Gallina)
   */
  getSpecies(): Promise<Species[]>;

  /**
   * Obtiene las razas correspondientes a una especie
   */
  getBreedsBySpecies(speciesId: string): Promise<Breed[]>;
}
