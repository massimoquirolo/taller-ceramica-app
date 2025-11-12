// src/componentes/DashboardAlumna.jsx

// Importamos 'useEffect' además de 'useState'
import { useState, useEffect } from 'react'
import supabase from '../supabaseCliente'

// Recibimos 'usuarioId' (sigue igual)
function DashboardAlumna({ perfil, usuarioId }) {
  
  // --- Estados del Formulario de Piezas (siguen igual) ---
  const [nombrePieza, setNombrePieza] = useState('')
  const [cargandoForm, setCargandoForm] = useState(false) 
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState(false)

  // --- Estados de la Lista de Piezas (siguen igual) ---
  const [piezas, setPiezas] = useState([])
  const [cargandoPiezas, setCargandoPiezas] = useState(true)

  // --- NUEVO: Estados de la Lista de Pagos ---
  const [pagos, setPagos] = useState([])
  const [cargandoPagos, setCargandoPagos] = useState(true)

  // --- useEffect para cargar PIEZAS (sigue igual) ---
  useEffect(() => {
    async function obtenerPiezas() {
      setCargandoPiezas(true)
      const { data, error } = await supabase
        .from('piezas')
        .select('id, nombre_pieza, estado, created_at')
        .eq('alumna_id', usuarioId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al cargar piezas:', error.message)
      } else {
        setPiezas(data)
      }
      setCargandoPiezas(false)
    }
    obtenerPiezas()
  }, [usuarioId])

  // --- NUEVO: useEffect para cargar PAGOS ---
  // Esto también se ejecuta una sola vez
  useEffect(() => {
    async function obtenerPagos() {
      setCargandoPagos(true)
      
      // La RLS que creamos ("Alumnas pueden ver sus propios pagos")
      // filtrará esto automáticamente por el 'usuarioId'.
      const { data, error } = await supabase
        .from('pagos')
        .select('id, monto, concepto, created_at')
        .eq('alumna_id', usuarioId) // Doble seguridad, aunque la RLS ya lo hace
        .order('created_at', { ascending: false }) // Los más nuevos primero

      if (error) {
        console.error('Error al cargar pagos:', error.message)
      } else {
        setPagos(data)
      }
      setCargandoPagos(false)
    }
    obtenerPagos()
  }, [usuarioId]) // Se re-ejecuta si el ID de usuario cambia


  // --- Función de Submit de Pieza (sigue igual) ---
  async function manejarSubmitNuevaPieza(evento) {
    evento.preventDefault()
    if (!nombrePieza) {
      setError(true)
      setMensaje('Por favor, ponle un nombre a tu pieza.')
      return
    }

    setCargandoForm(true)
    setMensaje('')
    setError(false)

    const { data: dataInsert, error: errorInsert } = await supabase
      .from('piezas')
      .insert({ 
        nombre_pieza: nombrePieza,
        alumna_id: usuarioId 
      })
      .select()

    setCargandoForm(false)

    if (errorInsert) {
      setError(true)
      setMensaje(`Error al registrar la pieza: ${errorInsert.message}`)
    } else {
      setError(false)
      setMensaje('¡Pieza registrada con éxito!')
      setNombrePieza('') 
      const [nuevaPieza] = dataInsert
      setPiezas(piezasActuales => [nuevaPieza, ...piezasActuales])
    }
  }

  // --- NUEVO: Función para formatear dinero ---
  // (Un 'ayudante' para que 5000 se vea como $5.000,00)
  function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(valor)
  }


  return (
    // Usamos 'grid' de Tailwind para poner las columnas una al lado de la otra
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* --- COLUMNA 1 y 2: PIEZAS (Ocupa 2/3) --- */}
      <div className="md:col-span-2">
        <h2 className="text-3xl font-semibold text-taller-green mb-4">
          Mi Taller
        </h2>
        <p className="text-lg text-gray-400 mb-8">
          Aquí verás tus piezas y su estado.
        </p>

        {/* Formulario de Pieza (sigue igual) */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-inner max-w-md mb-12">
          <h3 className="text-xl font-semibold text-white mb-4">
            Registrar una Pieza Nueva
          </h3>
          <form onSubmit={manejarSubmitNuevaPieza}>
            {/* ... (input y botón del formulario) ... */}
            <div className="mb-4">
              <label htmlFor="nombrePieza" className="block text-sm font-medium text-gray-300 mb-2">
                Nombre o descripción de la pieza
              </label>
              <input
                type="text"
                id="nombrePieza"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Ej: Taza mediana con asa"
                value={nombrePieza}
                onChange={(e) => setNombrePieza(e.target.value)}
                disabled={cargandoForm}
              />
            </div>
            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-taller-green text-taller-dark-blue font-bold hover:bg-taller-beigebg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-500 transition-colors"
              disabled={cargandoForm}
            >
              {cargandoForm ? 'Registrando...' : 'Registrar Pieza'}
            </button>
          </form>
          {mensaje && (
            <p className={`mt-4 text-sm ${error ? 'text-red-400' : 'text-green-400'}`}>
              {mensaje}
            </p>
          )}
        </div>

        {/* Lista de Piezas (sigue igual) */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-white mb-6">
            Mis Piezas Registradas
          </h3>
          {cargandoPiezas ? (
            <p className="text-gray-400">Cargando tus piezas...</p>
          ) : piezas.length === 0 ? (
            <p className="text-gray-400">Aún no has registrado ninguna pieza.</p>
          ) : (
            <div className="space-y-4">
              {piezas.map((pieza) => (
                <div 
                  key={pieza.id} 
                  className="bg-gray-800 p-4 rounded-lg flex justify-between items-center shadow-md"
                >
                  <div>
                    <p className="text-lg font-medium text-white">{pieza.nombre_pieza}</p>
                    <p className="text-sm text-gray-400">
                      Registrada el: {new Date(pieza.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gray-700 text-yellow-300 text-sm font-semibold rounded-full uppercase tracking-wider">
                    {pieza.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- NUEVO: COLUMNA 3: PAGOS (Ocupa 1/3) --- */}
      <div className="md:col-span-1">
        <h2 className="text-3xl font-semibold text-green-300 mb-4">
          Mis Pagos
        </h2>
        <p className="text-lg text-gray-400 mb-8">
          Historial de pagos de horneados.
        </p>

        <div className="bg-gray-800 p-6 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold text-white mb-6">
            Historial
          </h3>

          {cargandoPagos ? (
            <p className="text-gray-400">Cargando tus pagos...</p>
          ) 
          : pagos.length === 0 ? (
            <p className="text-gray-400">Aún no tienes pagos registrados.</p>
          ) 
          : (
            <div className="space-y-4">
              {pagos.map((pago) => (
                <div 
                  key={pago.id} 
                  className="bg-gray-700 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="text-lg font-medium text-green-400">
                      {formatearMoneda(pago.monto)}
                    </p>
                    <p className="text-sm text-gray-300">
                      {pago.concepto || 'Pago'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(pago.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  )
}

export default DashboardAlumna