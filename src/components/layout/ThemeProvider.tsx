import { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { THEME_PRESETS } from '../../lib/themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { themeId, customColors } = useStore();

    useEffect(() => {
        const root = window.document.documentElement;

        // Get the base preset
        const preset = THEME_PRESETS[themeId] || THEME_PRESETS.dark;

        // Merge base tokens with any user custom overrides
        const finalTokens = { ...preset.tokens, ...customColors };

        // Apply all tokens as CSS variables to the root element
        Object.entries(finalTokens).forEach(([variable, value]) => {
            root.style.setProperty(`--${variable}`, value);
        });

        // Set the basic color-scheme property to help browser defaults
        root.style.colorScheme = themeId === 'light' ? 'light' : 'dark';

        // Toggle Tailwind dark mode based on themeId
        if (themeId === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

    }, [themeId, customColors]);

    return <>{children}</>;
}
