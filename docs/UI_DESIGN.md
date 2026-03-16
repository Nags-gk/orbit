# 🎨 UI & UX Design System

This document outlines the core design philosophies and technical implementations behind Orbit's beautiful interface.

## 💎 The Theming Engine

Orbit was engineered to feel visually cohesive across devices regardless of the environment. We achieve this through a fully custom, declarative Tailwind CSS CSS variable engine.

### How It Works

1.  Rather than hardcoding classes like `text-blue-500`, we map everything to functional roles.
    *   `--primary`: The main accent color (used in gradients, key active buttons).
    *   `--background`: Space background (often deep grey/blue depending on mode).
    *   `--foreground`: The primary text color.
    *   `--card`: The Glass pane background base.
    *   `--destructive`: Warning/Error states (like the "Delete" transaction buttons).

2.  **State Rehydration**: These CSS variables are stored persistently on the user's device via `Zustand` and rehydrated the moment the root layout loads (`ThemeProvider.tsx`).
3.  **Color Transformations**: Variables are stored as HSL values (`"220 80% 50%"`). 

---

## 🪟 Real Glassmorphism

Glassmorphism is more than just setting opacity; it's about lighting and depth.

Orbit implements these through specific Tailwind utility layers:

*   **`className="glass-card"`**: 
    1.  Sets `bg-card/40` (translucency).
    2.  Sets `backdrop-blur-md` (frosted glass blur effect).
    3.  Applies a subtle 1px border `border-border/50` to give the "edge" feeling of glass.

*   **Elevated Components (`glass-card-glow`)**: Important widgets (like total balance displays) glow dynamically on hover to direct user attention.

---

## 🔄 Dynamic Presets

Orbit includes high-end visual presets out of the box:

*   **Midnight Prism**: Deep purple/black space gradients with cyan highlights. Uses CSS radial mesh gradients.
*   **Clean Light**: A high-impact, sleek light mode with stark contrast.
*   **Cream Elegance**: Warm, soft, high-readability mode modeled after classic financial ledgers or reading applications.

### Applying Presets

Themes are hot-swapped by simply mutating the overarching `<html style="--primary: ...">` attributes. Because the entire component library (built using custom variants in `ui/button`, `ui/card`) relies on these variables, the entire app visually shifts in ~5 milliseconds.

---

## 🎛️ Component Library (shadcn/ui + Radix)

We build atop Radix UI primitives because they afford us complete control over styling without discarding ARIA accessibility standards.

*   **Modals / Dialogs**: Animated and centered, handling trapped focus so screen readers can interpret them correctly. We enforce a blur backdrop `bg-background/80 blur-sm` overlay for modals to immediately draw the eye to the dialog box.
*   **Forms & Validation**: Input inputs are styled with subtle rings (`ring-2 ring-primary ring-offset-background`) for distinct typing states. Empty fields are caught natively before firing API logic.

---

## 📱 PWA Considerations

When designing Orbit, we accounted for Native-App specific concerns:

1.  **Safe Areas (`env(safe-area-inset-bottom)`)**: Mobile notched devices are padded natively correctly so UI isn't obstructed by the iOS sweeping bar.
2.  **Overscroll/Rubber-Banding**: Orbit aggressively limits body scrolling via `overflow-hidden` at the root frame to ensure it feels like a native dashboard application, rather than a scrolling website page.

Everything inside Orbit is designed to be frictionless, vibrant, and stunning.
