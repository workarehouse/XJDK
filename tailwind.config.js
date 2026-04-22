/** @type {import('tailwindcss').Config} */
const animate = require('tailwindcss-animate')
const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

export default {
    darkMode: ['class'],
    content: ['./index.html', './pages/**/*.{ts,tsx,vue}', './components/**/*.{ts,tsx,vue}', './src/**/*.{ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans]
            },
            colors: {
                primary: colors.indigo
            },
            keyframes: {
                'accordion-down': {
                    from: { height: 0 },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: 0 }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            }
        }
    },
    plugins: [
        require("@tailwindcss/typography"), //Tailwind CSS 排版
        require('@tailwindcss/forms'), //Tailwind CSS 表单
        require('tailwindcss-debug-screens'), //Tailwind CSS 调试屏幕
        animate
    ]
}
