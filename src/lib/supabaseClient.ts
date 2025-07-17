import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variables de entorno de Supabase no configuradas");
  console.error("Por favor, crea un archivo .env.local con:");
  console.error("NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co");
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica-anonima");
  
  throw new Error("Variables de entorno de Supabase no configuradas. Revisa el archivo .env.local.example");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 