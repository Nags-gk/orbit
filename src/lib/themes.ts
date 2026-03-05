export type ThemeVariable =
    | 'background'
    | 'foreground'
    | 'card'
    | 'card-foreground'
    | 'popover'
    | 'popover-foreground'
    | 'primary'
    | 'primary-foreground'
    | 'secondary'
    | 'secondary-foreground'
    | 'muted'
    | 'muted-foreground'
    | 'accent'
    | 'accent-foreground'
    | 'destructive'
    | 'destructive-foreground'
    | 'border'
    | 'input'
    | 'ring';

export type ThemeTokens = Record<ThemeVariable, string>;

export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    tokens: ThemeTokens;
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
    dark: {
        id: 'dark',
        name: 'Midnight Prism',
        description: 'Deep violet blacks with neon cyan and magenta accents.',
        tokens: {
            'background': '260 40% 4%',
            'foreground': '210 40% 98%',
            'card': '260 30% 8%',
            'card-foreground': '210 40% 98%',
            'popover': '260 30% 12%',
            'popover-foreground': '210 40% 98%',
            'primary': '190 100% 50%',
            'primary-foreground': '260 30% 10%',
            'secondary': '260 20% 18%',
            'secondary-foreground': '210 40% 98%',
            'muted': '260 20% 18%',
            'muted-foreground': '260 20% 65%',
            'accent': '300 100% 50%',
            'accent-foreground': '210 40% 98%',
            'destructive': '0 62.8% 30.6%',
            'destructive-foreground': '210 40% 98%',
            'border': '260 30% 20%',
            'input': '260 30% 20%',
            'ring': '190 100% 50%',
        }
    },
    light: {
        id: 'light',
        name: 'Clean Light',
        description: 'Crisp white backgrounds with vibrant high-contrast accents.',
        tokens: {
            'background': '0 0% 100%',
            'foreground': '240 10% 3.9%',
            'card': '0 0% 100%',
            'card-foreground': '240 10% 3.9%',
            'popover': '0 0% 100%',
            'popover-foreground': '240 10% 3.9%',
            'primary': '221 83% 53%',
            'primary-foreground': '210 40% 98%',
            'secondary': '240 4.8% 95.9%',
            'secondary-foreground': '240 5.9% 10%',
            'muted': '240 4.8% 95.9%',
            'muted-foreground': '240 3.8% 46.1%',
            'accent': '280 83% 53%',
            'accent-foreground': '210 40% 98%',
            'destructive': '0 84.2% 60.2%',
            'destructive-foreground': '210 40% 98%',
            'border': '240 5.9% 90%',
            'input': '240 5.9% 90%',
            'ring': '221 83% 53%',
        }
    },
    cream: {
        id: 'cream',
        name: 'Cream Elegance',
        description: 'Warm, soft off-white hues tailored for reading comfort.',
        tokens: {
            'background': '40 33% 96%', // Warm off-white #F8F5F2
            'foreground': '24 10% 10%', // Deep slate/brown #1C1917
            'card': '0 0% 100%', // Pure white for contrast
            'card-foreground': '24 10% 10%',
            'popover': '40 33% 96%',
            'popover-foreground': '24 10% 10%',
            'primary': '24 38% 46%', // Earthen Terracotta #A16B56
            'primary-foreground': '40 33% 96%',
            'secondary': '40 20% 90%',
            'secondary-foreground': '24 10% 10%',
            'muted': '40 20% 90%',
            'muted-foreground': '24 5% 40%',
            'accent': '180 20% 40%', // Muted Sage Green
            'accent-foreground': '40 33% 96%',
            'destructive': '0 70% 50%',
            'destructive-foreground': '40 33% 96%',
            'border': '40 15% 85%',
            'input': '40 15% 85%',
            'ring': '24 38% 46%',
        }
    }
};

/**
 * Utility function to convert a hex color (e.g. #FF0000) to an HSL string
 * format compatible with Tailwind and orbit's CSS variables (e.g. "0 100% 50%")
 */
export function hexToHsl(hex: string): string {
    // Remove the hash if present
    hex = hex.replace(/^#/, '');

    // Parse the hex string into r, g, b values
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    // Find the min and max values to determine the lightness
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    // Convert to percentages and round
    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);

    return `${hDeg} ${sPct}% ${lPct}%`;
}

/**
 * Utility function to convert an HSL string (e.g. "0 100% 50%")
 * back to a hex color (e.g. "#ff0000") for native color pickers.
 */
export function hslToHex(hslStr: string): string {
    if (!hslStr) return '#000000';

    // Parse "H S% L%"
    const parts = hslStr.replace(/%/g, '').split(' ');
    if (parts.length !== 3) return '#000000';

    let h = parseFloat(parts[0]);
    let s = parseFloat(parts[1]) / 100;
    let l = parseFloat(parts[2]) / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        h /= 360;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
