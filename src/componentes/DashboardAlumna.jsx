// src/componentes/DashboardAlumna.jsx

import { useState, useEffect, useMemo } from 'react'
import supabase from '../supabaseCliente'
import HistorialModal from './HistorialModal' 

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
  const [modalContent, setModalContent] = useState(null) 

  // --- ¡NUEVO ESTADO! ---
  // Para controlar qué se ve en la vista móvil
  const [vistaActiva, setVistaActiva] = useState('piezas') // 'piezas' o 'cuenta'


  // --- Todos los useEffect (sin cambios) ---
  useEffect(() => { /* ... (obtenerPiezas) ... */ 
    async function obtenerPiezas() {
      setCargandoPiezas(true)
      const { data, error } = await supabase.from('piezas').select('id, nombre_pieza, estado, created_at, foto_url').eq('alumna_id', usuarioId).order('created_at', { ascending: false })
      if (error) console.error('Error al cargar piezas:', error.message)
      else setPiezas(data)
      setCargandoPiezas(false)
    }
    obtenerPiezas()
  }, [usuarioId])
  useEffect(() => { /* ... (obtenerPagos) ... */ 
    async function obtenerPagos() {
      setCargandoPagos(true)
      const { data, error } = await supabase.from('pagos').select('id, monto, concepto, created_at').eq('alumna_id', usuarioId).order('created_at', { ascending: false })
      if (error) console.error('Error al cargar pagos:', error.message)
      else setPagos(data)
      setCargandoPagos(false)
    }
    obtenerPagos()
  }, [usuarioId])
  useEffect(() => { /* ... (obtenerCostos) ... */ 
    async function obtenerCostos() {
      setCargandoCostos(true)
      const { data, error } = await supabase.from('costos').select('id, monto, concepto, created_at').eq('alumna_id', usuarioId).order('created_at', { ascending: false })
      if (error) console.error('Error al cargar costos:', error.message)
      else setCostos(data)
      setCargandoCostos(false)
    }
    obtenerCostos()
  }, [usuarioId])

  // --- Todas las Funciones (sin cambios) ---
  function manejarSeleccionFoto(evento) { /* ... */ 
    if (evento.target.files && evento.target.files[0]) {
      setArchivoFoto(evento.target.files[0])
    }
  }
  async function manejarSubmitNuevaPieza(evento) { /* ... */ 
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
      const { data: dataSubida, error: errorSubida } = await supabase.storage.from('piezas').upload(nombreArchivo, archivoFoto)
      if (errorSubida) {
        setCargandoForm(false)
        setError(true)
        setMensaje(`Error al subir la foto: ${errorSubida.message}`)
        return
      }
      const { data: dataUrl } = supabase.storage.from('piezas').getPublicUrl(nombreArchivo)
      urlDeFotoPublica = dataUrl.publicUrl
    }
    const { data: dataInsert, error: errorInsert } = await supabase.from('piezas').insert({ nombre_pieza: nombrePieza, alumna_id: usuarioId, foto_url: urlDeFotoPublica }).select('id, nombre_pieza, estado, created_at, foto_url')
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
  function formatearMoneda(valor) { /* ... */ 
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

  // --- Funciones 'render' para los items del modal (sin cambios) ---
  const renderPagoItem = (pago) => ( /* ... */ 
    <div key={pago.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
      <div>
        <p className="text-lg font-medium text-green-400">{formatearMoneda(pago.monto)}</p>
        <p className="text-sm text-gray-300">{pago.concepto || 'Pago'}</p>
      </div>
      <p className="text-xs text-gray-400">{new Date(pago.created_at).toLocaleDateString()}</p>
    </div>
  );
  const renderCostoItem = (costo) => ( /* ... */ 
    <div key={costo.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
      <div>
        <p className="text-lg font-medium text-red-400">{formatearMoneda(costo.monto)}</p>
        <p className="text-sm text-gray-300">{costo.concepto || 'Costo de horneado'}</p>
      </div>
      <p className="text-xs text-gray-400">{new Date(costo.created_at).toLocaleDateString()}</p>
    </div>
  );
  

  // --- ¡REESTRUCTURACIÓN! ---
  // 1. Definimos los bloques de contenido como constantes

  // --- BLOQUE DE PIEZAS ---
  const SeccionPiezas = (
    <>
      <h2 className="text-3xl font-semibold text-taller-green mb-4">
        Mi Taller
      </h2>
      
      {/* Formulario de Pieza */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-inner max-w-md mb-12">
        <h3 className="text-xl font-semibold text-white mb-4">
          Registrar una Pieza Nueva
        </h3>
        <form onSubmit={manejarSubmitNuevaPieza}>
          {/* ... (inputs y botón sin cambios) ... */}
          <div className="mb-4">
            <label htmlFor="nombrePieza" className="block text-sm font-medium text-gray-300 mb-2">Nombre o descripción</label>
            <input type="text" id="nombrePieza" className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-blue-500" placeholder="Ej: Taza mediana con asa" value={nombrePieza} onChange={(e) => setNombrePieza(e.target.value)} disabled={cargandoForm}/>
          </div>
          <div className="mb-4">
            <label htmlFor="fotoPieza" className="block text-sm font-medium text-gray-300 mb-2">Foto (Opcional)</label>
            <input type="file" id="fotoPieza" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-taller-beige file:text-taller-dark-blue hover:file:bg-taller-green" 
              onChange={manejarSeleccionFoto} disabled={cargandoForm} accept="image/png, image/jpeg"
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
                    <p className="text-sm text-gray-400">Registrada el: {new Date(pieza.created_at).toLocaleDateString()}</p>
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
    </>
  );

  // --- BLOQUE DE CUENTA ---
  const SeccionCuenta = (
    <>
      <h2 className="text-3xl font-semibold text-taller-green mb-4">
        Mi Cuenta
      </h2>
      <p className="text-lg text-taller-beige/80 mb-8">
        Resumen de tu saldo.
      </p>

      {/* Tarjeta de Saldo */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-inner mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          Tu Saldo Actual
        </h3>
        {(cargandoCostos || cargandoPagos) ? (
          <p className="text-gray-400">Calculando saldo...</p>
        ) : (
          <div>
            <p className="text-lg font-semibold text-taller-beige/80">Saldo a Pagar:</p>
            <p className={`text-4xl font-bold ${saldoPendiente <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatearMoneda(saldoPendiente)}
            </p>
            {saldoPendiente <= 0 && (
              <p className="text-sm text-green-400 mt-2">¡Estás al día!</p>
            )}
            {saldoPendiente > 0 && (
              <p className="text-sm text-red-400 mt-2">Este es el monto que adeudas.</p>
            )}
          </div>
        )}

        {/* Botones de Historial */}
        <div className="mt-6 border-t border-taller-beige/20 pt-4 flex flex-col gap-2">
           <button 
              className="text-sm text-taller-green/80 hover:text-taller-green transition-colors text-left"
              onClick={() => setModalContent('costos')}
           >
              Ver historial de costos
           </button>
           <button 
              className="text-sm text-taller-green/80 hover:text-taller-green transition-colors text-left"
              onClick={() => setModalContent('pagos')}
           >
              Ver historial de pagos
           </button>
        </div>
      </div>
    </>
  );


  // --- ¡NUEVO JSX! ---
  // 2. Renderizamos la app con lógica responsive
  return (
    // Contenedor principal
    <div>
      {/* --- Vista Desktop (Grid) --- */}
      {/* (Se oculta en móvil, se muestra como grid en desktop) */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-8">
        <div className="md:col-span-2">
          {SeccionPiezas}
        </div>
        <div className="md:col-span-1">
          {SeccionCuenta}
        </div>
      </div>

      {/* --- Vista Móvil (Contenido de Pestaña) --- */}
      {/* (Se muestra en móvil, se oculta en desktop) */}
      {/* pb-20 = padding-bottom para que la barra de tabs no tape el contenido */}
      <div className="md:hidden pb-20">
        {vistaActiva === 'piezas' && SeccionPiezas}
        {vistaActiva === 'cuenta' && SeccionCuenta}
      </div>

      {/* --- Barra de Pestañas (Solo Móvil) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-gray-800 border-t border-taller-beige/20 flex justify-around items-center z-40">
        
        {/* Botón Piezas */}
        <button
          onClick={() => setVistaActiva('piezas')}
          className={`flex flex-col items-center justify-center p-2 transition-colors ${vistaActiva === 'piezas' ? 'text-taller-green' : 'text-taller-beige/60'}`}
        >
          {/* Icono Piezas (Grid) */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          <span className="text-xs font-medium">Mis Piezas</span>
        </button>

        {/* Botón Cuenta */}
        <button
          onClick={() => setVistaActiva('cuenta')}
          className={`flex flex-col items-center justify-center p-2 transition-colors ${vistaActiva === 'cuenta' ? 'text-taller-green' : 'text-taller-beige/60'}`}
        >
          {/* Icono Cuenta (User) */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-xs font-medium">Mi Cuenta</span>
        </button>
      </div>

      {/* --- Modales (van al final, sin cambios) --- */}
      {modalContent && (
        <HistorialModal
          titulo={modalContent === 'pagos' ? 'Historial de Pagos' : 'Historial de Costos'}
          items={modalContent === 'pagos' ? pagos : costos}
          renderItem={modalContent === 'pagos' ? renderPagoItem : renderCostoItem}
          onClose={() => setModalContent(null)}
        />
      )}
    </div>
  )
}

export default DashboardAlumna