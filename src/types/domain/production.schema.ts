export type ProductionType = 'leche' | 'huevo';

export interface BaseProduction {
  id: string;
  animal_id: string;
  production_date: string;
  quantity: number;
  unit: string;
  notes?: string;
  registered_by: string;
  created_at?: string;
}

export interface MilkProduction extends BaseProduction {
  fat_percentage?: number;
  protein_percentage?: number;
}

export interface EggProduction extends BaseProduction {
  egg_count: number; // For collective records if needed, but the table has quantity usually as mass
  egg_quality?: string;
}

export interface CreateProductionDTO {
  animal_id: string;
  production_date: string;
  quantity: number;
  notes?: string;
  production_type: ProductionType;
}
