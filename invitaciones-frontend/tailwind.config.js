/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        // Suave aparición de opacidad
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Entrada sutil elevándose desde abajo
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(24px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInUpSubtle: {
          '0%': {
            opacity: '0',
            transform: 'translateY(12px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        // Entrada sutil descendiendo desde arriba
        fadeInDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-24px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInDownSubtle: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-12px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        // Entrada sutil desde los laterales
        fadeInLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-24px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        fadeInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(24px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        // Entrada con escala suave
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.94)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        scaleInSubtle: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.97)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        // Entrada con ligero desenfoque a nítido
        blurIn: {
          '0%': {
            opacity: '0',
            filter: 'blur(10px)',
          },
          '100%': {
            opacity: '1',
            filter: 'blur(0)',
          },
        },
        // Desplazamiento limpio
        slideUp: {
          '0%': {
            transform: 'translateY(100%)',
          },
          '100%': {
            transform: 'translateY(0)',
          },
        },
        // Efecto suave de flotación infinita para badges o decoraciones
        floatSubtle: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-6px)',
          },
        },
        // Pulsación suave y tenue
        pulseSubtle: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.88',
            transform: 'scale(1.02)',
          },
        },
        // Línea que se expande desde el centro hacia los lados
        expandFromCenter: {
          '0%': { transform: 'scaleX(0)', opacity: '0' },
          '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
        // Escala + subida combinada (para ilustraciones)
        scaleUpIn: {
          '0%': { opacity: '0', transform: 'scale(0.82) translateY(28px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        // Péndulo suave infinito
        pendulum: {
          '0%':   { transform: 'rotate(0deg)' },
          '25%':  { transform: 'rotate(-1.5deg)' },
          '75%':  { transform: 'rotate(1.5deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        // Péndulo más pronunciado (para ilustraciones de brindis, etc)
        pendulumStrong: {
          '0%':   { transform: 'rotate(0deg)' },
          '25%':  { transform: 'rotate(-6deg)' },
          '75%':  { transform: 'rotate(6deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        // Animaciones de entrada más largas, pausadas y elegantes (curvas cubic-bezier de desaceleración suave)
        'fade-in': 'fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-fast': 'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-slow': 'fadeIn 2s cubic-bezier(0.16, 1, 0.3, 1) both',

        'fade-in-up': 'fadeInUp 1.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-up-subtle': 'fadeInUpSubtle 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-up-slow': 'fadeInUp 2.2s cubic-bezier(0.16, 1, 0.3, 1) both',

        'fade-in-down': 'fadeInDown 1.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-down-subtle': 'fadeInDownSubtle 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',

        'fade-in-left': 'fadeInLeft 1.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-right': 'fadeInRight 1.4s cubic-bezier(0.16, 1, 0.3, 1) both',

        'scale-in': 'scaleIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in-subtle': 'scaleInSubtle 1.0s cubic-bezier(0.16, 1, 0.3, 1) both',

        'blur-in': 'blurIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',

        'float-subtle': 'floatSubtle 4s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'expand-from-center': 'expandFromCenter 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-up-in': 'scaleUpIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pendulum': 'pendulum 5s ease-in-out 2 both',
        'pendulum-strong': 'pendulumStrong 3.5s ease-in-out 2 both',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
