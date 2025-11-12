// Importamos la función para crear un cliente desde la librería de Supabase
import { createClient } from '@supabase/supabase-js'

// --- ¡DEBES RELLENAR ESTO! ---
// Ve a tu panel de Supabase > Settings (Engranaje) > API
// 1. Copia la URL del Proyecto
// 2. Copia la 'anon' 'public' key (la llave pública anónima)
// ---------------------------------

// Lee las variables desde 'import.meta.env' (así lo hace Vite)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos el cliente de Supabase (esto sigue igual)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase