// src/componentes/HistorialModal.jsx

import React from 'react';

/**
 * Un componente de Modal genérico.
 * Recibe:
 * - titulo: El título a mostrar (ej: "Historial de Pagos")
 * - items: El array de datos a listar (ej: la lista 'pagos')
 * - onClose: La función que se llama para cerrar el modal
 * - renderItem: Una función que le dice cómo dibujar cada item
 */
function HistorialModal({ titulo, items, onClose, renderItem }) {
  return (
    // 1. El Fondo Oscuro (Backdrop)
    // Cubre toda la pantalla y se cierra al hacer clic
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose} 
    >
      {/* 2. El Contenido del Modal */}
      {/* Detenemos la propagación para que al hacer clic aquí no se cierre */}
      <div 
        className="bg-gray-800 w-full max-w-lg p-6 rounded-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* 3. Botón de Cerrar (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-taller-beige/50 hover:text-taller-beige transition-colors"
        >
          {/* Un ícono de 'X' simple */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 4. Título */}
        <h2 className="text-2xl font-semibold text-taller-green mb-6">{titulo}</h2>

        {/* 5. Lista de Items */}
        {/* Hacemos que la lista tenga scroll si es muy larga */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {items.length === 0 ? (
            <p className="text-gray-400">No hay movimientos para mostrar.</p>
          ) : (
            // Usamos la función 'renderItem' que nos pasaron
            // para dibujar cada item de la lista
            items.map((item) => renderItem(item))
          )}
        </div>
      </div>
    </div>
  );
}

export default HistorialModal;