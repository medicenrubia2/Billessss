import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'HIDDEN' : 'NOT SET');
  throw new Error('Missing Supabase environment variables');
}

// Crear cliente principal
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Función para probar conexión
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseClient.from('contactos').select('count').limit(1);
    if (error) {
      console.warn('⚠️  Supabase tables not found, using local fallback');
      return false;
    }
    return true;
  } catch (error) {
    console.warn('⚠️  Supabase connection failed, using local fallback');
    return false;
  }
}

// Wrapper que usa fallback local si es necesario
let useLocalFallback = true; // Forzar uso local

// Verificar conexión al inicializar
testSupabaseConnection().then(connected => {
  if (!connected || useLocalFallback) {
    useLocalFallback = true;
    console.log('📁 Using local JSON storage for development');
  } else {
    console.log('☁️  Using Supabase cloud storage');
  }
});

// Wrapper del cliente
export const supabase = {
  from: (table: string) => {
    if (useLocalFallback) {
      // Usar simulador local
      const localSupabase = require('./localSupabase');
      return localSupabase.from(table);
    }
    return supabaseClient.from(table);
  },
  
  storage: {
    from: (bucket: string) => {
      if (useLocalFallback) {
        const localSupabase = require('./localSupabase');
        return localSupabase.storage.from(bucket);
      }
      return supabaseClient.storage.from(bucket);
    }
  }
};