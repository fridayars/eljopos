import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        // Default: dark mode. Read from localStorage if user has previously chosen.
        const saved = localStorage.getItem('eljo-theme') as Theme | null
        return saved === 'light' ? 'light' : 'dark'
    })

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('eljo-theme', theme)
    }, [theme])

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

    return {
        theme,
        toggleTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
    }
}
