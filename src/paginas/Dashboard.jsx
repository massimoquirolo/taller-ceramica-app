// src/paginas/Dashboard.jsx

import { useState, useEffect } from 'react' // Hooks para el estado local
import supabase from '../supabaseCliente'

// Importamos los dos dashboards que mostraremos
import DashboardAdmin from '../componentes/DashboardAdmin'
import DashboardAlumna from '../componentes/DashboardAlumna'

// 1. AHORA SOLO RECIBE 'sesion'
function PaginaDashboard({ sesion }) {

  // 2. ESTADOS LOCALES PARA EL PERFIL
  const [perfil, setPerfil] = useState(null)
  const [cargandoPerfil, setCargandoPerfil] = useState(true)

  // 3. USEEFFECT LOCAL PARA BUSCAR EL PERFIL
  // Esto se ejecuta cuando el componente Dashboard se monta
  useEffect(() => {
    async function buscarPerfil() {
      setCargandoPerfil(true)
      
      // 4. LLAMAMOS A LA FUNCIÓN RPC (esta función ya existe en tu DB)
      const { data, error } = await supabase
        .rpc('obtener_mi_perfil') 
        .single()

      if (error) {
        console.error("Error buscando perfil (RPC en Dashboard):", error.message)
        setPerfil(null)
      } else {
        setPerfil(data)
      }
      setCargandoPerfil(false) // Dejamos de cargar el perfil
    }

    // Solo buscamos si tenemos una sesión (aunque siempre deberíamos)
    if (sesion) {
      buscarPerfil()
    }
  }, [sesion]) // Se re-ejecuta si la sesión cambia

  // Función para cerrar la sesión (sigue igual)
  async function cerrarSesion() {
    try {
      // 1. Intentamos cerrar la sesión
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        // Si hay un error "real", lo mostramos
        console.error('Error al cerrar sesión:', error.message)
      }

    } catch (error) {
      // Capturamos cualquier otro error
      console.error('Error en el proceso de signOut:', error)

    } finally {
      // 2. ¡SIEMPRE! Haya o no haya error,
      // recargamos la página para forzar
      // que App.jsx vuelva a chequear todo.
      window.location.reload()
    }
  }

  // 5. FUNCIÓN RENDERIZADORA (MODIFICADA)
  function renderizarDashboardSegunRol() {
    // AHORA USAMOS EL ESTADO DE CARGA LOCAL
    if (cargandoPerfil) {
      // Este es el "Cargando perfil..." que veías
      return <p className="text-gray-400">Cargando perfil...</p>
    }
    
    if (!perfil) {
      // Si falló la carga del perfil
      return <p className="text-red-400">Error: No se pudo cargar tu perfil.</p>
    }

    // Mostramos según el rol
    switch (perfil.rol) {
      case 'admin':
        return <DashboardAdmin perfil={perfil} />
      case 'alumna':
        return (
          <DashboardAlumna 
            perfil={perfil} 
            usuarioId={sesion.user.id} 
          />
        )
      default:
        return <p>Rol no reconocido.</p>
    }
  }

  return (
    // ¡LIMPIADO! El 'body' ya tiene los colores base.
    <div className="min-h-screen p-8"> 
      
      {/* Encabezado común */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-taller-green"> {/* ¡NUEVO COLOR! */}
          Barro Tal Vez
        </h1>
        
        <button 
          onClick={cerrarSesion}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <hr className="border-taller-beige/20 mb-6" /> {/* Borde con opacidad */}

      {/* El resto funciona igual */}
      {renderizarDashboardSegunRol()}

    </div>
  )
}

export default PaginaDashboard