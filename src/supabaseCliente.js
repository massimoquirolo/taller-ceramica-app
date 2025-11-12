// Importamos la función para crear un cliente desde la librería de Supabase
import { createClient } from '@supabase/supabase-js'

// --- ¡DEBES RELLENAR ESTO! ---
// Ve a tu panel de Supabase > Settings (Engranaje) > API
// 1. Copia la URL del Proyecto
// 2. Copia la 'anon' 'public' key (la llave pública anónima)
// ---------------------------------

const SUPABASE_URL = 'https://ecewvwiwkqtjylwyeemd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZXd2d2l3a3F0anlsd3llZW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODU3NzAsImV4cCI6MjA3ODQ2MTc3MH0.HEc4EJ3j_BLSnE1mYjs2Q0QGUqFtpceVQn9cJ7ZqOLc';

// Creamos el cliente de Supabase
// Esta variable 'supabase' es nuestra puerta de entrada a la base de datos.
// La exportamos para poder usarla en cualquier parte de nuestra aplicación.
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase