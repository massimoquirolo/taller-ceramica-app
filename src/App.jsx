// src/App.jsx

import { useState, useEffect } from 'react'
import PaginaLogin from './paginas/Login.jsx'
import PaginaDashboard from './paginas/Dashboard.jsx'
import supabase from './supabaseCliente'

function App() {
  
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    
    // --- LÓGICA DE CARGA INICIAL (SIMPLIFICADA) ---
    async function obtenerSesionInicial() {
      setCargando(true)
      try {
        // Solo pedimos la sesión, nada de perfiles
        const { data: { session: sesionActual } } = await supabase.auth.getSession()
        setSesion(sesionActual)
      } catch (error) {
        console.error("Error en getSession:", error)
        setSesion(null)
      } finally {
        setCargando(false) // Siempre dejamos de cargar
      }
    }

    obtenerSesionInicial()

    // --- OYENTE DE CAMBIOS DE AUTH (SIMPLIFICADO) ---
    // Solo actualiza la sesión, nada de perfiles
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (evento, nuevaSesion) => {
        setSesion(nuevaSesion)
      }
    )

    // Función de limpieza
    return () => {
      subscription.unsubscribe()
    }
  }, []) // El array vacío [] significa "ejecutar solo al montar"

  
  // --- RENDER CONDICIONAL ---
  
  // Si estamos cargando la sesión inicial
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  // Decidimos qué página mostrar
  return (
    <div>
      {!sesion ? (
        <PaginaLogin />
      ) : (
        // Le pasamos la sesión completa al Dashboard
        <PaginaDashboard 
          key={sesion.user.id} 
          sesion={sesion}
        /> 
      )}
    </div>
  )
}

export default App