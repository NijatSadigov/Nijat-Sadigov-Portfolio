/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Driven by a CSS variable so it can shift per active profile/theme.
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace'],
        serifResearch: ['Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
}
