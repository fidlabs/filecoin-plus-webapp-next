import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

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
        background: "var(--color-solitude)",
        foreground: "var(--foreground)",
        solitude: "var(--color-solitude)",
        horizon: "var(--color-horizon)",
        cyprus: "var(--color-cyprus)",
        link: "var(--color-link)",
        "mountain-meadow": "var(--color-mountain-meadow)",
        "echo-blue": "var(--color-echo-blue)",
        "dodger-blue": "hsl(var(--color-dodger-blue) / <alpha-value>)",
        "oyster-bay": "var(--color-oyster-bay)",
        "medium-turquoise": "var(--color-medium-turquoise)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
      },
      transitionProperty: {},
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "f-card": "0 0 16px #102a4314",
        "f-card-inset": "inset 0 0 16px #102a4314",
        "structure-inset": "inset 0px 0px 0px 1px rgba(66, 68, 90, 1);",
      },
      backgroundImage: {
        // header: 'linear-gradient(268deg, var(--color-dodger-blue) 0%, var(--color-link) 100%)'
        header:
          "linear-gradient(268deg, var(--color-link) 0%, var(--color-link) 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      transitionTimingFunction: {
        "in-sine": "cubic-bezier(0.12, 0, 0.39, 0)",
        "out-sine": "cubic-bezier(0.61, 1, 0.88, 1)",
        "in-out-sine": "cubic-bezier(0.37, 0, 0.63, 1)",

        "in-quad": "cubic-bezier(0.11, 0, 0.5, 0)",
        "out-quad": "cubic-bezier(0.5, 1, 0.89, 1)",
        "in-out-quad": "cubic-bezier(0.45, 0, 0.55, 1)",

        "in-cubic": "cubic-bezier(0.32, 0, 0.67, 0)",
        "out-cubic": "cubic-bezier(0.33, 1, 0.68, 1)",
        "in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",

        "in-quart": "cubic-bezier(0.5, 0, 0.75, 0)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "in-out-quart": "cubic-bezier(0.76, 0, 0.24, 1)",

        "in-quint": "cubic-bezier(0.64, 0, 0.78, 0)",
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out-quint": "cubic-bezier(0.83, 0, 0.17, 1)",

        "in-expo": "cubic-bezier(0.7, 0, 0.84, 0)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",

        "in-circ": "cubic-bezier(0.55, 0, 1, 0.45)",
        "out-circ": "cubic-bezier(0, 0.55, 0.45, 1)",
        "in-out-circ": "cubic-bezier(0.85, 0, 0.15, 1)",

        "in-back": "cubic-bezier(0.36, 0, 0.66, -0.56)",
        "out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "in-out-back": "cubic-bezier(0.68, -0.6, 0.32, 1.6)",

        "in-elastic": "cubic-bezier(0.36, 0.66, 0.04, 1.44)",
        "out-elastic": "cubic-bezier(0.6, -0.44, 0.96, 0.24)",
        "in-out-elastic": "cubic-bezier(0.78, 0.14, 0.15, 0.86)",

        "in-bounce": "cubic-bezier(0.71, -0.46, 0.88, 0.6)",
        "out-bounce": "cubic-bezier(0.12, 0.84, 0.29, 1.16)",
        "in-out-bounce": "cubic-bezier(0.81, -0.44, 0.19, 1.44)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(({ matchUtilities }) => {
      //Add the css properties that you use in tailwind
      matchUtilities({
        "animation-delay": (value) => {
          return {
            "animation-delay": value,
          };
        },
        "transition-duration": (value) => {
          return {
            "transition-duration": value,
          };
        },
      });
    }),
  ],
};
export default config;
