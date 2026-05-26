/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a' }
      },
      fontFamily: { sans:['"DM Sans"','system-ui','sans-serif'], display:['"Syne"','system-ui','sans-serif'] },
      boxShadow: { card:'0 1px 4px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)', 'card-md':'0 4px 16px rgba(0,0,0,0.08)', 'card-lg':'0 12px 32px rgba(0,0,0,0.12)', drawer:'-6px 0 40px rgba(0,0,0,0.14)' },
      animation: { 'fade-up':'fadeUp 0.2s ease-out', 'slide-in':'slideIn 0.28s cubic-bezier(0.16,1,0.3,1)', shimmer:'shimmer 1.5s infinite linear', 'spin-slow':'spin 1s linear infinite' },
      keyframes: {
        fadeUp:   { from:{opacity:'0',transform:'translateY(8px)'},  to:{opacity:'1',transform:'translateY(0)'}  },
        slideIn:  { from:{opacity:'0',transform:'translateX(100%)'}, to:{opacity:'1',transform:'translateX(0)'}  },
        shimmer:  { '0%':{backgroundPosition:'-200% 0'}, '100%':{backgroundPosition:'200% 0'} },
      }
    }
  },
  plugins: []
}
