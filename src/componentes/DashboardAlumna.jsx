// src/componentes/DashboardAlumna.jsx

import { useState, useEffect, useMemo } from 'react'
import supabase from '../supabaseCliente'

// Recibimos 'usuarioId' (sigue igual)
function DashboardAlumna({ perfil, usuarioId }) {
  
  // --- Estados (sin cambios) ---
  const [nombrePieza, setNombrePieza] = useState('')
  const [archivoFoto, setArchivoFoto] = useState(null)
  const [cargandoForm, setCargandoForm] = useState(false) 
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState(false)
  const [piezas, setPiezas] = useState([])
  const [cargandoPiezas, setCargandoPiezas] = useState(true)
  const [pagos, setPagos] = useState([])
  const [cargandoPagos, setCargandoPagos] = useState(true)
  const [costos, setCostos] = useState([])
  const [cargandoCostos, setCargandoCostos] = useState(true)


  // --- useEffect para cargar PIEZAS (sin cambios) ---
  useEffect(() => {
    async function obtenerPiezas() {
      setCargandoPiezas(true)
      const { data, error } = await supabase
        .from('piezas')
        .select('id, nombre_pieza, estado, created_at, foto_url') 
        .eq('alumna_id', usuarioId)
        .order('created_at', { ascending: false })
      if (error) console.error('Error al cargar piezas:', error.message)
      else setPiezas(data)
      setCargandoPiezas(false)
    }
    obtenerPiezas()
  }, [usuarioId])

  // --- useEffect para cargar PAGOS (sin cambios) ---
  useEffect(() => {
    async function obtenerPagos() {
      setCargandoPagos(true)
      const { data, error } = await supabase
        .from('pagos')
        .select('id, monto, concepto, created_at')
        .eq('alumna_id', usuarioId)
        .order('created_at', { ascending: false })
      if (error) console.error('Error al cargar pagos:', error.message)
      else setPagos(data)
      setCargandoPagos(false)
    }
    obtenerPagos()
  }, [usuarioId])
  
  // --- useEffect para cargar COSTOS (sin cambios) ---
  useEffect(() => {
    async function obtenerCostos() {
      setCargandoCostos(true)
      const { data, error } = await supabase
        .from('costos')
        .select('id, monto, concepto, created_at')
        .eq('alumna_id', usuarioId)
        .order('created_at', { ascending: false })
      if (error) console.error('Error al cargar costos:', error.message)
      else setCostos(data)
      setCargandoCostos(false)
    }
    obtenerCostos()
  }, [usuarioId])


  // --- Función manejarSeleccionFoto (sin cambios) ---
  function manejarSeleccionFoto(evento) {
    if (evento.target.files && evento.target.files[0]) {
      setArchivoFoto(evento.target.files[0])
    }
  }

  // --- Función manejarSubmitNuevaPieza (sin cambios) ---
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
    let urlDeFotoPublica = null 

    if (archivoFoto) {
      const nombreArchivo = `${usuarioId}-${Date.now()}`
      const { data: dataSubida, error: errorSubida } = await supabase.storage
        .from('piezas')
        .upload(nombreArchivo, archivoFoto)

      if (errorSubida) {
        setCargandoForm(false)
        setError(true)
        setMensaje(`Error al subir la foto: ${errorSubida.message}`)
        return
      }

      const { data: dataUrl } = supabase.storage
        .from('piezas')
        .getPublicUrl(nombreArchivo)
      urlDeFotoPublica = dataUrl.publicUrl
    }

    const { data: dataInsert, error: errorInsert } = await supabase
      .from('piezas')
      .insert({ 
        nombre_pieza: nombrePieza,
        alumna_id: usuarioId,
        foto_url: urlDeFotoPublica
      })
      .select('id, nombre_pieza, estado, created_at, foto_url')

    setCargandoForm(false)

    if (errorInsert) {
      setError(true)
      setMensaje(`Error al registrar la pieza: ${errorInsert.message}`)
    } else {
      setError(false)
      setMensaje('¡Pieza registrada con éxito!')
      setNombrePieza('')
      setArchivoFoto(null) 
      const [nuevaPieza] = dataInsert
      setPiezas(piezasActuales => [nuevaPieza, ...piezasActuales])
    }
  }

  // --- Función formatearMoneda (sin cambios) ---
  function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(valor)
  }

  // --- Lógica de Cálculo de Saldos (sin cambios) ---
  const [totalCostos, totalPagos, saldoPendiente] = useMemo(() => {
    const totalCostos = costos.reduce((acc, costo) => acc + (costo.monto || 0), 0)
    const totalPagos = pagos.reduce((acc, pago) => acc + (pago.monto || 0), 0)
    const saldoPendiente = totalCostos - totalPagos
    
    return [totalCostos, totalPagos, saldoPendiente]
  }, [costos, pagos])


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* --- COLUMNA 1 y 2: PIEZAS (Sin Cambios) --- */}
      <div className="md:col-span-2">
        <h2 className="text-3xl font-semibold text-taller-green mb-4">
          Mi Taller
        </h2>
        
        {/* Formulario de Pieza */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-inner max-w-md mb-12">
          <h3 className="text-xl font-semibold text-white mb-4">
            Registrar una Pieza Nueva
          </h3>
          <form onSubmit={manejarSubmitNuevaPieza}>
            <div className="mb-4">
              <label htmlFor="nombrePieza" className="block text-sm font-medium text-gray-300 mb-2">
                Nombre o descripción
              </label>
              <input type="text" id="nombrePieza" className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500" placeholder="Ej: Taza mediana con asa" value={nombrePieza} onChange={(e) => setNombrePieza(e.target.value)} disabled={cargandoForm}/>
            </div>
            <div className="mb-4">
              <label htmlFor="fotoPieza" className="block text-sm font-medium text-gray-300 mb-2">
                Foto (Opcional)
              </label>
              <input type="file" id="fotoPieza" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-taller-beige file:text-taller-dark-blue hover:file:bg-taller-green" 
                onChange={manejarSeleccionFoto}
                disabled={cargandoForm} 
                accept="image/png, image/jpeg"
              />
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-taller-green text-taller-dark-blue font-bold hover:bg-taller-beige disabled:bg-gray-500 transition-colors" disabled={cargandoForm}>
              {cargandoForm ? 'Registrando...' : 'Registrar Pieza'}
            </button>
          </form>
          {mensaje && <p className={`mt-4 text-sm ${error ? 'text-red-400' : 'text-green-400'}`}>{mensaje}</p>}
        </div>

        {/* Lista de Piezas */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-white mb-6">
            Mis Piezas Registradas
          </h3>
          {cargandoPiezas ? ( <p className="text-gray-400">Cargando tus piezas...</p> ) : piezas.length === 0 ? ( <p className="text-gray-400">Aún no has registrado ninguna pieza.</p> ) : (
            <div className="space-y-4">
              {piezas.map((pieza) => (
                <div key={pieza.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center shadow-md">
                  <div className="flex items-center gap-4">
                    {pieza.foto_url ? (
                      <img src={pieza.foto_url} alt={pieza.nombre_pieza} className="w-16 h-16 rounded-md object-cover"/>
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center text-gray-500 text-xs">Sin foto</div>
                    )}
                    <div>
                      <p className="text-lg font-medium text-white">{pieza.nombre_pieza}</p>
                      <p className="text-sm text-gray-400">
                        Registrada el: {new Date(pieza.created_at).toLocaleDateString()}
                      </p>
                    </div>
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


      {/* --- ¡COLUMNA 3 MODIFICADA! --- */}
      <div className="md:col-span-1">
        <h2 className="text-3xl font-semibold text-taller-green mb-4">
          Mi Cuenta
        </h2>
        <p className="text-lg text-taller-beige/80 mb-8">
          Resumen de tu saldo.
        </p>

        {/* --- Tarjeta de Saldo Pendiente (SIMPLIFICADA) --- */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-inner mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            Tu Saldo Actual
          </h3>
          {(cargandoCostos || cargandoPagos) ? (
            <p className="text-gray-400">Calculando saldo...</p>
          ) : (
            <div>
              <p className="text-lg font-semibold text-taller-beige/80">Saldo a Pagar:</p>
              
              {/* Lógica de color: Verde si es 0 o negativo (a favor), Rojo si debe */}
              <p className={`text-4xl font-bold ${saldoPendiente <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatearMoneda(saldoPendiente)}
              </p>
              
              {/* Texto de ayuda */}
              {saldoPendiente <= 0 && (
                <p className="text-sm text-green-400 mt-2">¡Estás al día!</p>
              )}
              {saldoPendiente > 0 && (
                <p className="text-sm text-red-400 mt-2">Este es el monto que adeudas.</p>
              )}
            </div>
          )}

          {/* --- Botones para ver detalle (Paso 2) --- */}
          <div className="mt-6 border-t border-taller-beige/20 pt-4 flex flex-col gap-2">
             <button className="text-sm text-taller-green/80 hover:text-taller-green transition-colors text-left">
                Ver historial de costos
             </button>
             <button className="text-sm text-taller-green/80 hover:text-taller-green transition-colors text-left">
                Ver historial de pagos
             </button>
          </div>

        </div>

        {/* ¡YA NO MOSTRAMOS EL HISTORIAL DE PAGOS AQUÍ! */}
        
      </div>
      
    </div>
  )
}

export default DashboardAlumna