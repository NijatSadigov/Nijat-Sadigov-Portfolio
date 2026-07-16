
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Colours are token vars (see index.css). They hold full colour values
      // (oklch accents), so Tailwind's `/alpha` syntax won't work on them —
      // use color-mix() for transparency instead.
      colors: {
        accent: 'var(--accent)',
        accent2: 'var(--accent-2)',
        onAccent: 'var(--on-accent)',
        bg: 'var(--bg)',
        bg2: 'var(--bg-2)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        text: 'var(--text)',
        dim: 'var(--dim)',
        faint: 'var(--faint)',
        // legacy aliases, kept so the admin UI keeps working
        ink: 'var(--text)',
        muted: 'var(--dim)',
        line: 'var(--border)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        line: 'var(--border)',
        soft: 'var(--border-2)',
      },
      borderRadius: {
        theme: 'var(--radius)',
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        body: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        pixel: ['Silkscreen', 'monospace'],
      },
      maxWidth: {
        shell: 'var(--maxw)',
      },
      transitionTimingFunction: {
        theme: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
        'theme-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
