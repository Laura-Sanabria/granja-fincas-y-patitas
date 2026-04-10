import { IAnimalRepository } from '../IAnimalRepository';
import { 
  Animal, 
  AnimalWithRelations, 
  CreateAnimalDTO, 
  Species, 
  Breed 
} from '@/types/domain/animal.schema';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseAnimalRepository implements IAnimalRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<AnimalWithRelations[]> {
    const { data, error } = await this.supabase
      .from('animals')
      .select(`
        *,
        species:species_id (*),
        breed:breed_id (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener animales: ${error.message}`);
    }

    return data as AnimalWithRelations[];
  }

  async getById(id: string): Promise<AnimalWithRelations | null> {
    const { data, error } = await this.supabase
      .from('animals')
      .select(`
        *,
        species:species_id (*),
        breed:breed_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw new Error(`Error al obtener el animal: ${error.message}`);
    }

    return data as AnimalWithRelations;
  }

  async create(payload: CreateAnimalDTO): Promise<Animal> {
    // 1. Obtener la especie para conocer su prefijo
    const { data: species, error: speciesError } = await this.supabase
      .from('species')
      .select('code_prefix')
      .eq('id', payload.species_id)
      .single();

    if (speciesError || !species) {
      throw new Error('Especie no encontrada o error de base de datos.');
    }

    // 2. Generar el código (Buscando el animal más reciente de esa especie para tener un correlativo)
    // Una aproximación simple y segura usando una función SQL si se quiere evitar carrera de condiciones
    // pero aquí lo hacemos consultando el mayor ID/Código que empiece con el prefijo
    const { data: maxCodeAnimal } = await this.supabase
      .from('animals')
      .select('code')
      .eq('species_id', payload.species_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let newNumber = 1;
    if (maxCodeAnimal && maxCodeAnimal.code) {
      const parts = maxCodeAnimal.code.split('-');
      if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
        newNumber = parseInt(parts[1]) + 1;
      }
    }

    const generatedCode = `${species.code_prefix}-${newNumber.toString().padStart(4, '0')}`;

    // 3. Insertar a la base de datos
    const animalToInsert = {
      ...payload,
      code: generatedCode
    };

    const { data, error } = await this.supabase
      .from('animals')
      .insert(animalToInsert)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear el animal: ${error.message}`);
    }

    return data as Animal;
  }

  async update(id: string, payload: Partial<Animal>): Promise<Animal> {
    const { data, error } = await this.supabase
      .from('animals')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar el animal: ${error.message}`);
    }

    return data as Animal;
  }

  async changeStatus(id: string, newStatus: Animal['status'], notes?: string): Promise<Animal> {
    const updateData: Partial<Animal> = { status: newStatus };
    if (newStatus === 'descartado' || newStatus === 'vendido' || newStatus === 'muerto') {
      updateData.egress_date = new Date().toISOString();
      if (notes) updateData.egress_notes = notes;
    }

    return this.update(id, updateData);
  }

  async getSpecies(): Promise<Species[]> {
    const { data, error } = await this.supabase
      .from('species')
      .select('*')
      .order('name');

    if (error) throw new Error(`Error al obtener especies: ${error.message}`);
    return data as Species[];
  }

  async getBreedsBySpecies(speciesId: string): Promise<Breed[]> {
    const { data, error } = await this.supabase
      .from('breeds')
      .select('*')
      .eq('species_id', speciesId)
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Error al obtener razas: ${error.message}`);
    return data as Breed[];
  }
}
