/** @type {import('tailwindcss').Config} */
export default {
  // Archivos que Tailwind debe escanear para encontrar clases de estilo
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Lee todos los archivos jsx, js, etc. dentro de 'src'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}