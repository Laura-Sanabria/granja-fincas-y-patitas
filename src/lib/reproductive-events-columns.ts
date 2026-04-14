import type { SupabaseClient } from '@supabase/supabase-js';
import type { GestationStatus, ReproductiveEvent } from '@/types/domain/reproduction.schema';

const FEMALE_CANDIDATES = ['female_animal_id', 'animal_id', 'female_id', 'mother_id', 'id_hembra', 'hembra_id'] as const;
const MALE_CANDIDATES = ['male_animal_id', 'father_id', 'male_id', 'father_id', 'id_macho', 'macho_id'] as const;

export type ReproAnimalColumnNames = { 
  female: string; 
  male: string | null;
  status: string;
  estimated: string | null;
  registeredBy: string;
  maleExternal: string;
  eventType: string;
};

let cachedColumns: Promise<ReproAnimalColumnNames> | null = null;

async function probeColumn(client: SupabaseClient, column: string): Promise<boolean> {
  const { error } = await client.from('reproductive_events').select(column).limit(0);
  return !error;
}

/**
 * Detecta dinámicamente cómo se llaman las columnas de hembra/macho.
 */
export function getReproEventAnimalColumnNames(client: SupabaseClient): Promise<ReproAnimalColumnNames> {
  if (!cachedColumns) {
    cachedColumns = (async () => {
      // 1. Probar candidatos conocidos uno por uno
      let female: string | null = null;
      for (const c of FEMALE_CANDIDATES) {
        if (await probeColumn(client, c)) {
          female = c;
          break;
        }
      }

      let male: string | null = null;
      for (const c of MALE_CANDIDATES) {
        if (await probeColumn(client, c)) {
          male = c;
          break;
        }
      }

      // 2. Si falló la hembra, intentar inspeccionar una fila real (fallback agresivo)
      if (!female) {
        const { data, error } = await client.from('reproductive_events').select('*').limit(1).maybeSingle();
        if (!error && data) {
          const keys = Object.keys(data);
          female = keys.find(k => FEMALE_CANDIDATES.includes(k as any)) || 
                   keys.find(k => k.toLowerCase().includes('female') || k.toLowerCase().includes('hembra') || k.toLowerCase().includes('mother') || k.toLowerCase().includes('madre')) || 
                   null;
          
          if (female && !male) {
             male = keys.find(k => MALE_CANDIDATES.includes(k as any)) || 
                    keys.find(k => (k.toLowerCase().includes('male') || k.toLowerCase().includes('macho') || k.toLowerCase().includes('father') || k.toLowerCase().includes('padre')) && k !== female) || 
                    null;
          }
        }
      }

      // 3. Probar otros campos (status, estimated, registeredBy)
      let status: string = 'gestation_status';
      for (const c of ['gestation_status', 'result', 'status']) {
        if (await probeColumn(client, c)) { status = c; break; }
      }

      let estimated: string | null = null;
      for (const c of ['estimated_birth_date', 'estimated_delivery_date']) {
        if (await probeColumn(client, c)) { estimated = c; break; }
      }

      let registeredBy: string = 'registered_by';
      for (const c of ['registered_by', 'responsible', 'user_id']) {
        if (await probeColumn(client, c)) { registeredBy = c; break; }
      }

      let maleExternal: string = 'male_external';
      for (const c of ['male_external', 'father_external']) {
        if (await probeColumn(client, c)) { maleExternal = c; break; }
      }

      let eventType: string = 'event_type';
      for (const c of ['event_type', 'service_type']) {
        if (await probeColumn(client, c)) { eventType = c; break; }
      }

      // 4. Si aún así no hay hembra, lanzar un error detallado para diagnóstico
      if (!female) {
        // Intento final para ver qué campos tiene la tabla si es posible
        const { data: colsData } = await client.from('reproductive_events').select('*').limit(1);
        const availableFields = colsData && colsData.length > 0 ? Object.keys(colsData[0]).join(', ') : 'Ninguno (tabla vacía o ilegible)';
        
        throw new Error(
          `No se encontró columna para ID de Hembra en 'reproductive_events'. Campos disponibles: [${availableFields}]. ` +
          `Buscamos: ${FEMALE_CANDIDATES.join(', ')}`
        );
      }

      return { female, male, status, estimated, registeredBy, maleExternal, eventType };
    })();
  }
  return cachedColumns;
}

/** Convierte una fila cruda de PostgREST al modelo interno (siempre usa female_animal_id / male_animal_id). */
export function rowToReproductiveEvent(
  row: Record<string, unknown>,
  cols?: ReproAnimalColumnNames
): ReproductiveEvent {
  // Priorizar las columnas encontradas por el buscador dinámico, de lo contrario buscar candidatos genéricos
  const female = cols ? row[cols.female] : (row.female_animal_id ?? row.animal_id ?? row.female_id ?? row.mother_id);
  const male = cols && cols.male ? row[cols.male] : (row.male_animal_id ?? row.father_id ?? row.male_id ?? row.father_id ?? null);
  
  // Mapeo dinámico de otros campos
  const gestStatus = (cols ? row[cols.status] : (row.gestation_status || row.result || 'en_seguimiento')) as GestationStatus;
  const estBirthDate = (cols?.estimated ? row[cols.estimated] : (row.estimated_birth_date || row.estimated_delivery_date)) as string | null | undefined;
  const regBy = cols ? row[cols.registeredBy] : (row.registered_by || row.responsible || row.user_id);
  const maleExt = cols ? row[cols.maleExternal] : (row.male_external || row.father_external);
  const evType = cols ? row[cols.eventType] : (row.event_type || row.service_type);

  if (!female) {
    console.error('Error de integridad en reproductive_events:', row);
    throw new Error(`Registro reproductivo inválido: falta id de hembra (ID registro: ${row.id ?? '?'}).`);
  }

  return {
    id: String(row.id),
    female_animal_id: String(female),
    male_animal_id: male ? String(male) : null,
    event_type: evType as ReproductiveEvent['event_type'],
    event_date: String(row.event_date),
    male_external: (maleExt as string | null | undefined) ?? null,
    gestation_status: gestStatus,
    estimated_birth_date: estBirthDate ? String(estBirthDate) : null,
    actual_birth_date: (row.actual_birth_date as string | null | undefined) ?? null,
    failure_reason: (row.failure_reason as string | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
    registered_by: String(regBy),
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  };
}
