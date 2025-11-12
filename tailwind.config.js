/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'taller-dark-blue': '#31405D',
        'taller-beige': '#EAE3D0',
        'taller-green': '#C8CCB8',
      }
    },
  }, // <-- La llave de 'theme' se cierra AQUÍ

  // 'plugins' va AFUERA de 'theme', al mismo nivel.
  plugins: [], 
}