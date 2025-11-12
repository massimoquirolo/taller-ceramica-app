// src/componentes/DashboardAlumna.jsx

import { useState, useEffect } from 'react'
import supabase from '../supabaseCliente'

function DashboardAlumna({ perfil, usuarioId }) {
  
  // --- Estados del Formulario de Piezas ---
  const [nombrePieza, setNombrePieza] = useState('')
  // NUEVO: Estado para el archivo de la foto
  const [archivoFoto, setArchivoFoto] = useState(null)
  
  const [cargandoForm, setCargandoForm] = useState(false) 
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState(false)

  // --- Estados de la Lista de Piezas ---
  const [piezas, setPiezas] = useState([])
  const [cargandoPiezas, setCargandoPiezas] = useState(true)

  // --- Estados de la Lista de Pagos ---
  const [pagos, setPagos] = useState([])
  const [cargandoPagos, setCargandoPagos] = useState(true)

  // --- useEffect para cargar PIEZAS (MODIFICADO) ---
  // Ahora también pedimos la 'foto_url'
  useEffect(() => {
    async function obtenerPiezas() {
      setCargandoPiezas(true)
      // NUEVO: Pedimos 'foto_url'
      const { data, error } = await supabase
        .from('piezas')
        .select('id, nombre_pieza, estado, created_at, foto_url') 
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

  // --- useEffect para cargar PAGOS (sigue igual) ---
  useEffect(() => {
    async function obtenerPagos() {
      setCargandoPagos(true)
      const { data, error } = await supabase
        .from('pagos')
        .select('id, monto, concepto, created_at')
        .eq('alumna_id', usuarioId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al cargar pagos:', error.message)
      } else {
        setPagos(data)
      }
      setCargandoPagos(false)
    }
    obtenerPagos()
  }, [usuarioId])


  // --- NUEVO: Función para manejar la selección de la foto ---
  function manejarSeleccionFoto(evento) {
    if (evento.target.files && evento.target.files[0]) {
      setArchivoFoto(evento.target.files[0])
    }
  }

  // --- FUNCIÓN DE SUBMIT (¡MUY MODIFICADA!) ---
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

    let urlDeFotoPublica = null // Variable para guardar la URL de la foto

    // --- NUEVO: PASO 1 - Subir la foto (si existe) ---
    if (archivoFoto) {
      // Creamos un nombre único para el archivo (ej: 'IDUsuario-timestamp.jpg')
      const nombreArchivo = `${usuarioId}-${Date.now()}`
      
      const { data: dataSubida, error: errorSubida } = await supabase.storage
        .from('piezas') // El bucket que creamos
        .upload(nombreArchivo, archivoFoto, {
          cacheControl: '3600', // 1 hora de caché
          upsert: false
        })

      if (errorSubida) {
        // Si falla la subida de la foto, paramos
        setCargandoForm(false)
        setError(true)
        setMensaje(`Error al subir la foto: ${errorSubida.message}`)
        return
      }

      // Si la foto sube bien, obtenemos su URL pública
      const { data: dataUrl } = supabase.storage
        .from('piezas')
        .getPublicUrl(nombreArchivo)
      
      urlDeFotoPublica = dataUrl.publicUrl
    }

    // --- PASO 2: Insertar la pieza en la base de datos (como antes) ---
    // (Ahora incluimos la 'foto_url' si existe)
    const { data: dataInsert, error: errorInsert } = await supabase
      .from('piezas')
      .insert({ 
        nombre_pieza: nombrePieza,
        alumna_id: usuarioId,
        foto_url: urlDeFotoPublica // Aquí va la URL (o null si no hay foto)
      })
      .select('id, nombre_pieza, estado, created_at, foto_url') // Pedimos la fila completa

    setCargandoForm(false)

    if (errorInsert) {
      setError(true)
      setMensaje(`Error al registrar la pieza: ${errorInsert.message}`)
    } else {
      // ¡Éxito!
      setError(false)
      setMensaje('¡Pieza registrada con éxito!')
      setNombrePieza('') // Limpiamos el formulario
      setArchivoFoto(null) // Limpiamos la foto
      
      const [nuevaPieza] = dataInsert
      setPiezas(piezasActuales => [nuevaPieza, ...piezasActuales])
    }
  }


  // --- Función para formatear dinero (sigue igual) ---
  function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(valor)
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* --- COLUMNA 1 y 2: PIEZAS --- */}
      <div className="md:col-span-2">
        <h2 className="text-3xl font-semibold text-taller-green mb-4">
          Mi Taller
        </h2>
        {/* ... (texto de 'p' sigue igual) ... */}

        {/* Formulario de Pieza (MODIFICADO) */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-inner max-w-md mb-12">
          <h3 className="text-xl font-semibold text-white mb-4">
            Registrar una Pieza Nueva
          </h3>
          <form onSubmit={manejarSubmitNuevaPieza}>
            
            {/* Input de Nombre (sigue igual) */}
            <div className="mb-4">
              <label htmlFor="nombrePieza" className="block text-sm font-medium text-gray-300 mb-2">
                Nombre o descripción
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

            {/* NUEVO: Input de Foto */}
            <div className="mb-4">
              <label htmlFor="fotoPieza" className="block text-sm font-medium text-gray-300 mb-2">
                Foto (Opcional)
              </label>
              <input
                type="file"
                id="fotoPieza"
                className="w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-taller-beige file:text-taller-dark-blue
                  hover:file:bg-taller-green"
                onChange={manejarSeleccionFoto}
                disabled={cargandoForm}
                accept="image/png, image/jpeg" // Acepta solo imágenes
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-taller-green text-taller-dark-blue font-bold hover:bg-taller-beige disabled:bg-gray-500 transition-colors"
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

        {/* Lista de Piezas (MODIFICADA) */}
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
                  {/* NUEVO: Contenedor flex para foto + texto */}
                  <div className="flex items-center gap-4">
                    {/* Mostramos la foto si existe */}
                    {pieza.foto_url ? (
                      <img 
                        src={pieza.foto_url} 
                        alt={pieza.nombre_pieza}
                        className="w-16 h-16 rounded-md object-cover" // Estilo de la miniatura
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                        Sin foto
                      </div>
                    )}
                    
                    {/* Info de la pieza */}
                    <div>
                      <p className="text-lg font-medium text-white">{pieza.nombre_pieza}</p>
                      <p className="text-sm text-gray-400">
                        Registrada el: {new Date(pieza.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Estado (sigue igual) */}
                  <span className="px-3 py-1 bg-gray-700 text-yellow-300 text-sm font-semibold rounded-full uppercase tracking-wider">
                    {pieza.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- COLUMNA 3: PAGOS (sigue igual) --- */}
      <div className="md:col-span-1">
        {/* ... (Todo el JSX de Mis Pagos sigue exactamente igual) ... */}
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