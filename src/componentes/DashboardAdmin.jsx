// src/componentes/DashboardAdmin.jsx
import { useState, useEffect } from 'react'
import supabase from '../supabaseCliente'

// Lista de estados (sigue igual)
const ESTADOS_POSIBLES = [
  'creacion', 'secado', 'horno_1', 'esmaltado', 'horno_2', 'lista_retiro', 'entregada'
]

function DashboardAdmin({ perfil }) {
  
  // --- Estados de la Lista de Piezas (siguen igual) ---
  const [piezas, setPiezas] = useState([])
  const [cargandoPiezas, setCargandoPiezas] = useState(true)
  const [idActualizando, setIdActualizando] = useState(null)

  // --- NUEVO: Estados para el Formulario de Pagos ---
  const [alumnas, setAlumnas] = useState([]) // Lista de alumnas para el <select>
  const [cargandoAlumnas, setCargandoAlumnas] = useState(true)
  
  // Estados de los inputs del formulario de pago
  const [pagoAlumnaId, setPagoAlumnaId] = useState('') // El ID de la alumna seleccionada
  const [pagoMonto, setPagoMonto] = useState('') // El monto
  const [pagoConcepto, setPagoConcepto] = useState('') // El concepto
  
  // Estados de 'feedback' del formulario de pago
  const [cargandoPago, setCargandoPago] = useState(false)
  const [mensajePago, setMensajePago] = useState('')
  const [errorPago, setErrorPago] = useState(false)


  // --- useEffect para cargar PIEZAS (sigue igual) ---
  useEffect(() => {
    async function obtenerTodasLasPiezas() {
      setCargandoPiezas(true)
      const { data, error } = await supabase
        .from('piezas')
        .select(`id, nombre_pieza, estado, created_at, alumnas ( nombre_completo, email )`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando todas las piezas:', error.message)
      } else {
        setPiezas(data)
      }
      setCargandoPiezas(false)
    }
    obtenerTodasLasPiezas()
  }, [])

  // --- NUEVO: useEffect para cargar ALUMNAS ---
  // Se ejecuta una vez para llenar el menú desplegable de pagos
  useEffect(() => {
    async function obtenerAlumnas() {
      setCargandoAlumnas(true)
      // Pedimos solo alumnas con rol 'alumna', ordenadas por nombre
      const { data, error } = await supabase
        .from('alumnas')
        .select('id, nombre_completo, email')
        .eq('rol', 'alumna')
        .order('nombre_completo', { ascending: true })
      
      if (error) {
        console.error('Error cargando alumnas:', error.message)
      } else {
        setAlumnas(data)
      }
      setCargandoAlumnas(false)
    }
    obtenerAlumnas()
  }, [])


  // --- Función para cambiar estado de pieza (sigue igual) ---
  async function manejarCambioEstado(evento, piezaId) {
    const nuevoEstado = evento.target.value
    setIdActualizando(piezaId) 

    const { data: piezaActualizada, error } = await supabase
      .from('piezas')
      .update({ estado: nuevoEstado })
      .eq('id', piezaId)
      .select(`id, nombre_pieza, estado, created_at, alumnas ( nombre_completo, email )`)
      .single()

    if (error) {
      console.error('Error al actualizar estado:', error.message)
    } else {
      setPiezas(piezasActuales =>
        piezasActuales.map(p => p.id === piezaId ? piezaActualizada : p)
      )
    }
    setIdActualizando(null)
  }

  // --- NUEVO: Función para registrar un pago ---
  async function manejarRegistroPago(evento) {
    evento.preventDefault() // Evita que la página se recargue

    // Validaciones
    if (!pagoAlumnaId || !pagoMonto) {
      setErrorPago(true)
      setMensajePago('Debes seleccionar una alumna y un monto.')
      return
    }

    setCargandoPago(true)
    setMensajePago('')
    setErrorPago(false)

    // Insertamos en la tabla 'pagos'
    const { error } = await supabase
      .from('pagos')
      .insert({
        alumna_id: pagoAlumnaId,
        monto: parseFloat(pagoMonto), // Convertimos a número
        concepto: pagoConcepto || 'Pago de horneado' // Concepto por defecto
      })

    setCargandoPago(false)

    if (error) {
      setErrorPago(true)
      setMensajePago(`Error al registrar el pago: ${error.message}`)
    } else {
      // ¡Éxito!
      setErrorPago(false)
      setMensajePago('¡Pago registrado con éxito!')
      // Limpiamos el formulario
      setPagoAlumnaId('')
      setPagoMonto('')
      setPagoConcepto('')
    }
  }


  return (
    <div>
      <h2 className="text-3xl font-semibold text-taller-green mb-4">
        Panel de Administración
      </h2>
      <p className="text-lg text-gray-400 mb-8">
        Gestiona piezas, estados y pagos de todo el taller.
      </p>

      {/* --- NUEVO: FORMULARIO DE REGISTRO DE PAGO --- */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-inner max-w-lg mb-12">
        <h3 className="text-xl font-semibold text-white mb-4">
          Registrar un Pago
        </h3>
        
        {cargandoAlumnas ? (
          <p className="text-gray-400">Cargando alumnas...</p>
        ) : (
          <form onSubmit={manejarRegistroPago}>
            <div className="mb-4">
              <label htmlFor="alumnaPago" className="block text-sm font-medium text-gray-300 mb-2">
                Alumna
              </label>
              <select
                id="alumnaPago"
                value={pagoAlumnaId}
                onChange={(e) => setPagoAlumnaId(e.target.value)}
                disabled={cargandoPago}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="">Selecciona una alumna...</option>
                {alumnas.map((alumna) => (
                  <option key={alumna.id} value={alumna.id}>
                    {alumna.nombre_completo} ({alumna.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="montoPago" className="block text-sm font-medium text-gray-300 mb-2">
                Monto ($)
              </label>
              <input
                type="number"
                id="montoPago"
                step="0.01" // Permite decimales
                value={pagoMonto}
                onChange={(e) => setPagoMonto(e.target.value)}
                disabled={cargandoPago}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Ej: 5000"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="conceptoPago" className="block text-sm font-medium text-gray-300 mb-2">
                Concepto (Opcional)
              </label>
              <input
                type="text"
                id="conceptoPago"
                value={pagoConcepto}
                onChange={(e) => setPagoConcepto(e.target.value)}
                disabled={cargandoPago}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Ej: Horneado 3 piezas"
              />
            </div>

            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-taller-green text-taller-dark-blue font-bold hover:bg-taller-beige text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-500 transition-colors"
              disabled={cargandoPago}
            >
              {cargandoPago ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </form>
        )}

        {/* Mensaje de éxito o error del formulario de pago */}
        {mensajePago && (
          <p className={`mt-4 text-sm ${errorPago ? 'text-red-400' : 'text-green-400'}`}>
            {mensajePago}
          </p>
        )}
      </div>


      {/* --- LISTA DE TODAS LAS PIEZAS (sin cambios) --- */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold text-white mb-6">
          Registro General de Piezas
        </h3>
        
        {cargandoPiezas ? (
          <p className="text-gray-400">Cargando todas las piezas...</p>
        ) 
        : piezas.length === 0 ? (
          <p className="text-gray-400">Aún no hay ninguna pieza registrada en el taller.</p>
        ) 
        : (
          <div className="space-y-4">
            {piezas.map((pieza) => (
              <div 
                key={pieza.id} 
                className={`...`} // (Todo el JSX de la pieza sigue igual)
              >
                {/* ... (Div de info de pieza y alumna) ... */}
                <div>
                  <p className="text-lg font-medium text-white">{pieza.nombre_pieza}</p>
                  <p className="text-sm text-gray-400">
                    Alumna: <span className="font-medium text-gray-300">
                      {pieza.alumnas ? pieza.alumnas.nombre_completo : '...'}
                    </span>
                    ({pieza.alumnas ? pieza.alumnas.email : '...'})
                  </p>
                  <p className="text-xs text-gray-500">
                    Registrada el: {new Date(pieza.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                {/* ... (Select de cambio de estado) ... */}
                <div>
                  <select 
                    value={pieza.estado}
                    onChange={(e) => manejarCambioEstado(e, pieza.id)}
                    disabled={idActualizando === pieza.id}
                    className="bg-gray-700 text-white text-sm font-semibold rounded-md p-2 border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    {ESTADOS_POSIBLES.map((estado) => (
                      <option key={estado} value={estado} className="font-semibold">
                        {estado.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardAdmin