import type {Config} from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-solitude)',
        foreground: 'var(--foreground)',
        solitude: 'var(--color-solitude)',
        horizon: 'var(--color-horizon)',
        cyprus: 'var(--color-cyprus)',
        link: 'var(--color-link)',
        'mountain-meadow': 'var(--color-mountain-meadow)',
        'echo-blue': 'var(--color-echo-blue)',
        'dodger-blue': 'var(--color-dodger-blue)',
        'oyster-bay': 'var(--color-oyster-bay)',
        'medium-turquoise': 'var(--color-medium-turquoise)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)'
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)'
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)'
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)'
        }
      },
      transitionProperty: {

      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        'f-card': '0 0 16px #102a4314',
        'f-card-inset': 'inset 0 0 16px #102a4314'
      },
      backgroundImage: {
        header: 'linear-gradient(268deg, var(--color-medium-turquoise) 0%, var(--color-dodger-blue) 100%)',
      },}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
