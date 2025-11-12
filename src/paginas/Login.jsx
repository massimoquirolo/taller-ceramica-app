import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import supabase from '../supabaseCliente' // Importamos nuestro cliente de supabase

function PaginaLogin() {

  return (
    // Centramos el formulario en la pantalla con Tailwind
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      
      {/* Contenedor del formulario */}
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Ingreso al Taller
        </h2>

        {/* Este es el componente mágico de Supabase */}
        <Auth
          supabaseClient={supabase} // Le pasamos nuestro cliente
          appearance={{ theme: ThemeSupa }} // Le damos un tema oscuro
          providers={[]} // No usaremos login con Google por ahora
          localization={{
            variables: {
              sign_in: {
                email_label: 'Tu Correo',
                password_label: 'Tu Contraseña',
                button_label: 'Ingresar',
                link_text: '¿Ya tienes cuenta? Ingresa',
              },
              sign_up: {
                email_label: 'Tu Correo',
                password_label: 'Crea una Contraseña',
                button_label: 'Registrarse',
                link_text: '¿No tienes cuenta? Regístrate',
              },
              forgotten_password: {
                link_text: '¿Olvidaste tu contraseña?',
                email_label: 'Tu Correo',
                button_label: 'Reiniciar contraseña',
              }
            },
          }}
        />
        
      </div>
    </div>
  )
}

export default PaginaLogin