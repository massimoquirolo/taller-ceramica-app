import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import supabase from '../supabaseCliente' // Importamos nuestro cliente

function PaginaLogin() {

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Ingreso al Taller
        </h2>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa, // Mantenemos la base oscura
            variables: {
              default: {
                colors: {
                  brand: '#C8CCB8', // Botones (nuestro verde)
                  brandAccent: '#AAB09C', // Botones (hover)
                  inputBackground: '#EAE3D0', // Fondo del input (nuestro beige)
                  inputText: '#31405D', // Texto DENTRO del input (nuestro azul)
                  defaultButtonText: '#31405D', // Texto del botón
                },
              },
            },
          }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Tu Correo',
                password_label: 'Tu Contraseña',
                button_label: 'Ingresar',
                link_text: '¿Ya tienes cuenta? Ingresa',
                // --- ¡LÍNEAS NUEVAS! ---
                email_input_placeholder: 'tu.correo@ejemplo.com',
                password_input_placeholder: 'Tu contraseña',
              },
              sign_up: {
                email_label: 'Tu Correo',
                password_label: 'Crea una Contraseña',
                button_label: 'Registrarse',
                link_text: '¿No tienes cuenta? Regístrate',
                // --- ¡LÍNEAS NUEVAS! ---
                email_input_placeholder: 'tu.correo@ejemplo.com',
                password_input_placeholder: 'Crea una contraseña segura',
              },
              forgotten_password: {
                link_text: '¿Olvidaste tu contraseña?',
                email_label: 'Tu Correo',
                button_label: 'Reiniciar contraseña',
                // --- ¡LÍNEA NUEVA! ---
                email_input_placeholder: 'tu.correo@ejemplo.com',
              }
            },
          }}
        />
        
      </div>
    </div>
  )
}

export default PaginaLogin