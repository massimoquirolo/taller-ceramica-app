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

  // --- Estados del Formulario de Pagos (siguen igual) ---
  const [alumnas, setAlumnas] = useState([]) // Lista de alumnas para los <select>
  const [cargandoAlumnas, setCargandoAlumnas] = useState(true)
  const [pagoAlumnaId, setPagoAlumnaId] = useState('')
  const [pagoMonto, setPagoMonto] = useState('')
  const [pagoConcepto, setPagoConcepto] = useState('')
  const [cargandoPago, setCargandoPago] = useState(false)
  const [mensajePago, setMensajePago] = useState('')
  const [errorPago, setErrorPago] = useState(false)

  // --- NUEVO: Estados para el Formulario de Costos ---
  const [costoAlumnaId, setCostoAlumnaId] = useState('') // Alumna seleccionada para costo
  const [piezasAlumna, setPiezasAlumna] = useState([]) // Piezas de esa alumna
  const [cargandoPiezasAlumna, setCargandoPiezasAlumna] = useState(false)
  const [costoPiezaId, setCostoPiezaId] = useState('') // Pieza seleccionada
  const [costoMonto, setCostoMonto] = useState('')
  const [costoConcepto, setCostoConcepto] = useState('')
  const [cargandoCosto, setCargandoCosto] = useState(false)
  const [mensajeCosto, setMensajeCosto] = useState('')
  const [errorCosto, setErrorCosto] = useState(false)


  // --- useEffect para cargar PIEZAS (sigue igual) ---
  useEffect(() => {
    async function obtenerTodasLasPiezas() {
      // ... (código sin cambios)
      setCargandoPiezas(true)
      const { data, error } = await supabase
        .from('piezas')
        .select(`id, nombre_pieza, estado, created_at, alumnas ( nombre_completo, email )`)
        .order('created_at', { ascending: false })

      if (error) console.error('Error cargando todas las piezas:', error.message)
      else setPiezas(data)
      setCargandoPiezas(false)
    }
    obtenerTodasLasPiezas()
  }, [])

  // --- useEffect para cargar ALUMNAS (sigue igual) ---
  useEffect(() => {
    async function obtenerAlumnas() {
      // ... (código sin cambios)
      setCargandoAlumnas(true)
      const { data, error } = await supabase
        .from('alumnas')
        .select('id, nombre_completo, email')
        .eq('rol', 'alumna')
        .order('nombre_completo', { ascending: true })
      
      if (error) console.error('Error cargando alumnas:', error.message)
      else setAlumnas(data)
      setCargandoAlumnas(false)
    }
    obtenerAlumnas()
  }, [])

  // --- NUEVO: useEffect para cargar PIEZAS de la alumna seleccionada (para Costos) ---
  // Se dispara CADA VEZ que 'costoAlumnaId' cambia.
  useEffect(() => {
    async function obtenerPiezasDeAlumna() {
      if (!costoAlumnaId) {
        setPiezasAlumna([])
        return
      }

      setCargandoPiezasAlumna(true)
      const { data, error } = await supabase
        .from('piezas')
        .select('id, nombre_pieza')
        .eq('alumna_id', costoAlumnaId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando piezas de alumna:', error.message)
      } else {
        setPiezasAlumna(data)
      }
      setCargandoPiezasAlumna(false)
    }

    obtenerPiezasDeAlumna()
  }, [costoAlumnaId]) // Depende de la alumna seleccionada


  // --- Función para cambiar estado de pieza (sigue igual) ---
  async function manejarCambioEstado(evento, piezaId) {
    // ... (código sin cambios)
    const nuevoEstado = evento.target.value
    setIdActualizando(piezaId) 

    const { data: piezaActualizada, error } = await supabase
      .from('piezas')
      .update({ estado: nuevoEstado })
      .eq('id', piezaId)
      .select(`id, nombre_pieza, estado, created_at, alumnas ( nombre_completo, email )`)
      .single()

    if (error) console.error('Error al actualizar estado:', error.message)
    else setPiezas(piezasActuales => piezasActuales.map(p => p.id === piezaId ? piezaActualizada : p))
    setIdActualizando(null)
  }

  // --- Función para registrar un pago (sigue igual) ---
  async function manejarRegistroPago(evento) {
    // ... (código sin cambios)
    evento.preventDefault()
    if (!pagoAlumnaId || !pagoMonto) {
      setErrorPago(true)
      setMensajePago('Debes seleccionar una alumna y un monto.')
      return
    }

    setCargandoPago(true)
    setMensajePago('')
    setErrorPago(false)

    const { error } = await supabase
      .from('pagos')
      .insert({
        alumna_id: pagoAlumnaId,
        monto: parseFloat(pagoMonto),
        concepto: pagoConcepto || 'Pago de horneado'
      })

    setCargandoPago(false)

    if (error) {
      setErrorPago(true)
      setMensajePago(`Error al registrar el pago: ${error.message}`)
    } else {
      setErrorPago(false)
      setMensajePago('¡Pago registrado con éxito!')
      setPagoAlumnaId('')
      setPagoMonto('')
      setPagoConcepto('')
    }
  }

  // --- NUEVO: Función para registrar un costo ---
  async function manejarRegistroCosto(evento) {
    evento.preventDefault()

    // Validaciones
    if (!costoAlumnaId || !costoMonto || !costoConcepto) {
      setErrorCosto(true)
      setMensajeCosto('Debes seleccionar alumna, monto y concepto.')
      return
    }

    setCargandoCosto(true)
    setMensajeCosto('')
    setErrorCosto(false)

    // Insertamos en la tabla 'costos'
    const { error } = await supabase
      .from('costos')
      .insert({
        alumna_id: costoAlumnaId,
        pieza_id: costoPiezaId || null, // 'null' si no se selecciona pieza
        monto: parseFloat(costoMonto),
        concepto: costoConcepto
      })

    setCargandoCosto(false)

    if (error) {
      setErrorCosto(true)
      setMensajeCosto(`Error al registrar el costo: ${error.message}`)
    } else {
      // ¡Éxito!
      setErrorCosto(false)
      setMensajeCosto('¡Costo registrado con éxito!')
      // Limpiamos el formulario
      setCostoAlumnaId('')
      setCostoPiezaId('')
      setCostoMonto('')
      setCostoConcepto('')
      setPiezasAlumna([]) // Vaciamos la lista de piezas
    }
  }


  return (
    <div>
      <h2 className="text-3xl font-semibold text-taller-green mb-4">
        Panel de Administración
      </h2>
      <p className="text-lg text-taller-beige/80 mb-8">
        Gestiona piezas, estados, pagos y costos de todo el taller.
      </p>

      {/* --- NUEVO: Contenedor Grid para los formularios --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        
        {/* --- FORMULARIO DE REGISTRO DE PAGO (sin cambios) --- */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold text-white mb-4">
            Registrar un Pago
          </h3>
          {cargandoAlumnas ? <p className="text-gray-400">Cargando alumnas...</p> : (
            <form onSubmit={manejarRegistroPago}>
              {/* ... (Select Alumna) ... */}
              <div className="mb-4">
                <label htmlFor="alumnaPago" className="block text-sm font-medium text-gray-300 mb-2">Alumna</label>
                <select id="alumnaPago" value={pagoAlumnaId} onChange={(e) => setPagoAlumnaId(e.target.value)} disabled={cargandoPago} className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500">
                  <option value="">Selecciona una alumna...</option>
                  {alumnas.map((alumna) => (
                    <option key={alumna.id} value={alumna.id}>{alumna.nombre_completo} ({alumna.email})</option>
                  ))}
                </select>
              </div>
              {/* ... (Input Monto) ... */}
              <div className="mb-4">
                <label htmlFor="montoPago" className="block text-sm font-medium text-gray-300 mb-2">Monto ($)</label>
                <input type="number" id="montoPago" step="0.01" value={pagoMonto} onChange={(e) => setPagoMonto(e.target.value)} disabled={cargandoPago} className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500" placeholder="Ej: 5000"/>
              </div>
              {/* ... (Input Concepto) ... */}
              <div className="mb-4">
                <label htmlFor="conceptoPago" className="block text-sm font-medium text-gray-300 mb-2">Concepto (Opcional)</label>
                <input type="text" id="conceptoPago" value={pagoConcepto} onChange={(e) => setPagoConcepto(e.target.value)} disabled={cargandoPago} className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500" placeholder="Ej: Horneado 3 piezas"/>
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-500 transition-colors" disabled={cargandoPago}>
                {cargandoPago ? 'Registrando...' : 'Registrar Pago'}
              </button>
            </form>
          )}
          {mensajePago && <p className={`mt-4 text-sm ${errorPago ? 'text-red-400' : 'text-green-400'}`}>{mensajePago}</p>}
        </div>

        {/* --- NUEVO: FORMULARIO DE REGISTRO DE COSTO --- */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold text-white mb-4">
            Registrar un Costo (Deuda)
          </h3>
          {cargandoAlumnas ? <p className="text-gray-400">Cargando alumnas...</p> : (
            <form onSubmit={manejarRegistroCosto}>
              {/* Select Alumna */}
              <div className="mb-4">
                <label htmlFor="alumnaCosto" className="block text-sm font-medium text-gray-300 mb-2">Alumna</label>
                <select id="alumnaCosto" value={costoAlumnaId} onChange={(e) => setCostoAlumnaId(e.target.value)} disabled={cargandoCosto} className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500">
                  <option value="">Selecciona una alumna...</option>
                  {alumnas.map((alumna) => (
                    <option key={alumna.id} value={alumna.id}>{alumna.nombre_completo} ({alumna.email})</option>
                  ))}
                </select>
              </div>

              {/* Select Pieza (depende de la alumna) */}
              <div className="mb-4">
                <label htmlFor="piezaCosto" className="block text-sm font-medium text-gray-300 mb-2">Pieza Asociada (Opcional)</label>
                <select id="piezaCosto" value={costoPiezaId} onChange={(e) => setCostoPiezaId(e.target.value)} disabled={cargandoCosto || cargandoPiezasAlumna || !costoAlumnaId} className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50">
                  {cargandoPiezasAlumna ? (
                    <option>Cargando piezas...</option>
                  ) : (
                    <>
                      <option value="">Selecciona una pieza...</option>
                      {piezasAlumna.map((pieza) => (
                        <option key={pieza.id} value={pieza.id}>{pieza.nombre_pieza}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Input Monto */}
              <div className="mb-4">
                <label htmlFor="montoCosto" className="block text-sm font-medium text-gray-300 mb-2">Monto ($)</label>
                <input type="number" id="montoCosto" step="0.01" value={costoMonto} onChange={(e) => setCostoMonto(e.target.value)} disabled={cargandoCosto} className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500" placeholder="Ej: 3500"/>
              </div>

              {/* Input Concepto */}
              <div className="mb-4">
                <label htmlFor="conceptoCosto" className="block text-sm font-medium text-gray-300 mb-2">Concepto</label>
                <input type="text" id="conceptoCosto" value={costoConcepto} onChange={(e) => setCostoConcepto(e.target.value)} disabled={cargandoCosto} className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500" placeholder="Ej: Horneado Bizcocho (Taza)"/>
              </div>

              <button type="submit" className="w-full px-4 py-2 bg-taller-green text-taller-dark-blue font-bold hover:bg-taller-beige disabled:bg-gray-500 transition-colors" disabled={cargandoCosto}>
                {cargandoCosto ? 'Registrando...' : 'Registrar Costo'}
              </button>
            </form>
          )}
          {mensajeCosto && <p className={`mt-4 text-sm ${errorCosto ? 'text-red-400' : 'text-green-400'}`}>{mensajeCosto}</p>}
        </div>
      </div>


      {/* --- LISTA DE TODAS LAS PIEZAS (sin cambios) --- */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold text-white mb-6">
          Registro General de Piezas
        </h3>
        {/* ... (Todo el JSX de la lista de piezas sigue exactamente igual) ... */}
        {cargandoPiezas ? ( <p>...</p> ) : piezas.length === 0 ? ( <p>...</p> ) : (
          <div className="space-y-4">
            {piezas.map((pieza) => (
              <div key={pieza.id} className={`bg-gray-800 p-4 rounded-lg flex justify-between items-center shadow-md ${idActualizando === pieza.id ? 'opacity-50' : ''}`}>
                <div>
                  <p className="text-lg font-medium text-white">{pieza.nombre_pieza}</p>
                  <p className="text-sm text-taller-beige/70">
                    Alumna: <span className="font-medium text-taller-beige">
                      {pieza.alumnas ? pieza.alumnas.nombre_completo : '...'}
                    </span>
                    ({pieza.alumnas ? pieza.alumnas.email : '...'})
                  </p>
                  <p className="text-xs text-gray-500">
                    Registrada el: {new Date(pieza.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <select value={pieza.estado} onChange={(e) => manejarCambioEstado(e, pieza.id)} disabled={idActualizando === pieza.id} className="bg-gray-700 text-white text-sm font-semibold rounded-md p-2 border border-gray-600 focus:outline-none focus:border-blue-500">
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