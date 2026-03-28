/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				brand: {
					DEFAULT: 'hsl(var(--brand))',
					foreground: 'hsl(var(--brand-foreground))'
				},
				highlight: {
					DEFAULT: 'hsl(var(--highlight))',
					foreground: 'hsl(var(--highlight-foreground))'
				}
			},
			borderRadius: {
				'2xl': 'calc(var(--radius) + 4px)',
				xl: 'calc(var(--radius) + 2px)',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				dotFlow: {
					'0%': { transform: 'translateX(-100%) scale(0.8)', opacity: '0' },
					'25%': { transform: 'translateX(0) scale(1.2)', opacity: '1' },
					'50%': { transform: 'translateX(100%) scale(0.8)', opacity: '0.6' },
					'100%': { transform: 'translateX(200%) scale(0.6)', opacity: '0' },
				},
				pulseDot: {
					'0%, 100%': { opacity: 0.3, transform: 'scale(0.9)' },
					'50%': { opacity: 1, transform: 'scale(1.2)' },
				},
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'slide-up-fade': {
					'0%': { opacity: '0', transform: 'translateY(8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-down-fade': {
					'0%': { opacity: '0', transform: 'translateY(-8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(16px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'slide-in-left': {
					'0%': { opacity: '0', transform: 'translateX(-16px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 5px hsl(245 82% 67% / 0.2)' },
					'50%': { boxShadow: '0 0 20px hsl(245 82% 67% / 0.4), 0 0 40px hsl(245 82% 67% / 0.15)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'morph': {
					'0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
					'50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'dotFlow': 'dotFlow 1.5s ease-in-out infinite',
				'pulse-dot': 'pulseDot 1s infinite ease-in-out',
				'slide-up-fade': 'slide-up-fade 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-down-fade': 'slide-down-fade 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'spin-slow': 'spin-slow 3s linear infinite',
				'morph': 'morph 8s ease-in-out infinite'
			},
			fontFamily: {
				heading: [
					'var(--font-heading)',
					'ui-sans-serif',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI Variable Display',
					'Segoe UI',
					'Helvetica',
					'Apple Color Emoji',
					'Arial',
					'sans-serif',
					'Segoe UI Emoji',
					'Segoe UI Symbol',
					'Noto Color Emoji'
				],
				mono: [
					'var(--font-mono)',
					...require("tailwindcss/defaultTheme").fontFamily.mono
				],
				sans: [
					'var(--font-sans)',
					'ui-sans-serif',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI Variable Display',
					'Segoe UI',
					'Helvetica',
					'Apple Color Emoji',
					'Arial',
					'sans-serif',
					'Segoe UI Emoji',
					'Segoe UI Symbol',
					'Noto Color Emoji'
				]
			},
			boxShadow: {
				'glass': '0 8px 32px rgba(99, 102, 241, 0.08)',
				'glass-lg': '0 16px 48px rgba(99, 102, 241, 0.12)',
				'glow': '0 0 20px hsl(245 82% 67% / 0.2)',
				'glow-lg': '0 0 40px hsl(245 82% 67% / 0.3)',
				'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
				'elevated': '0 2px 8px -2px rgba(0,0,0,0.08), 0 4px 16px -4px rgba(0,0,0,0.06)',
				'elevated-lg': '0 4px 16px -4px rgba(0,0,0,0.1), 0 8px 32px -8px rgba(0,0,0,0.08)',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar-hide")],
};
