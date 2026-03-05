/** @type {import('tailwindcss').Config} */
 export default {
   content: ['./index.html', './src/**/*.{js,jsx}'],
   theme: {
    extend: {
       colors: {
         primary:   { DEFAULT: '#16a34a', hover: '#15803d', light: '#dcfce7' },
         secondary: { DEFAULT: '#1d4ed8', hover: '#1e40af', light: '#dbeafe' },
         danger:    { DEFAULT: '#dc2626', light: '#fee2e2' },
         warning:   { DEFAULT: '#d97706', light: '#fef3c7' },
       }
     }
   },
   plugins: []
 }
