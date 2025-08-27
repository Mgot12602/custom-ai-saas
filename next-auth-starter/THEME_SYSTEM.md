# Centralized Theme Management System

## Overview

This SaaS starter kit now includes a comprehensive centralized theme management system that allows for:

- **Multi-tenant customization**: Different customers can have their own themes
- **Consistent styling**: All components use centralized color and typography tokens
- **Easy theme switching**: Users can preview and switch between themes instantly
- **Developer-friendly**: Strongly typed theme configuration with TypeScript
- **UX/UI best practices**: Professional color palettes, typography, and spacing

## Architecture

### Core Files

- `src/types/theme.ts` - TypeScript interfaces for theme configuration
- `src/themes/default-themes.ts` - Pre-built theme configurations
- `src/contexts/ThemeContext.tsx` - React context for theme management
- `src/components/ThemeSwitcher.tsx` - UI component for switching themes
- `src/app/globals.css` - CSS variables and utility classes

### Theme Structure

Each theme includes:

- **Primary Colors**: Main brand color with 11 shades (50-950)
- **Secondary Colors**: Supporting colors for text and backgrounds
- **Accent Colors**: Call-to-action and highlight colors
- **Neutral Colors**: Grayscale palette for UI elements
- **Semantic Colors**: Success, warning, error, and info colors
- **Typography**: Display, body, and monospace font stacks
- **Spacing**: Consistent spacing scale
- **Border Radius**: Rounded corner variations
- **Shadows**: Drop shadow variations

## Available Themes

### 1. Default Theme
- **Primary**: Modern blue (#3b82f6)
- **Secondary**: Slate gray (#64748b)  
- **Accent**: Magenta (#d946ef)
- **Use Case**: General-purpose applications

### 2. SaaS Theme
- **Primary**: Sky blue (#0ea5e9)
- **Secondary**: Purple (#a855f7)
- **Accent**: Orange (#f97316)
- **Use Case**: Professional SaaS platforms

### 3. Enterprise Theme
- **Primary**: Conservative blue (#0369a1)
- **Secondary**: Dark slate (#475569)
- **Accent**: Gold (#eab308)
- **Use Case**: Enterprise applications

## Usage

### 1. Using Theme Context

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  
  return (
    <div style={{ color: currentTheme.colors.primary[500] }}>
      Current theme: {currentTheme.name}
    </div>
  );
}
```

### 2. Using CSS Classes

The system provides utility classes for common theme colors:

```tsx
// Text colors
<span className="text-primary">Primary text</span>
<span className="text-secondary">Secondary text</span>
<span className="text-accent">Accent text</span>

// Background colors
<div className="bg-primary">Primary background</div>
<div className="bg-secondary">Secondary background</div>

// Typography
<h1 className="font-display">Display font</h1>
<p className="font-body">Body font</p>
```

### 3. Using Tailwind Classes

All theme colors are available as Tailwind classes:

```tsx
// Primary color variations
<button className="bg-primary-500 hover:bg-primary-600 text-primary-50">
  Primary Button
</button>

// Secondary colors
<div className="border-secondary-300 text-secondary-700">
  Secondary element
</div>

// Accent colors  
<span className="text-accent-500 bg-accent-50">
  Accent element
</span>
```

## Multi-Tenant Implementation

### Customer-Specific Themes

```tsx
// In your layout or app component
<ThemeProvider customerId={user.customerId} defaultThemeId="saas">
  <App />
</ThemeProvider>
```

### API Integration

For production use, integrate with your backend:

```tsx
// Example API call in ThemeContext
const loadCustomerTheme = async (customerId: string) => {
  const response = await fetch(`/api/customers/${customerId}/theme`);
  const themeData = await response.json();
  return themeData;
};
```

## Creating Custom Themes

### 1. Define Theme Configuration

```tsx
import { ThemeConfig } from '@/types/theme';

export const customTheme: ThemeConfig = {
  id: 'custom',
  name: 'Custom Theme',
  colors: {
    primary: {
      50: '#...',
      // ... full color palette
      500: '#your-brand-color',
      // ... 
      950: '#...',
    },
    // ... other color groups
  },
  fonts: {
    display: ['Your Display Font', 'fallback'],
    body: ['Your Body Font', 'fallback'],
    mono: ['Your Mono Font', 'fallback'],
  },
  // ... spacing, shadows, etc.
};
```

### 2. Register Theme

Add to `src/themes/default-themes.ts`:

```tsx
export const themes = {
  default: defaultTheme,
  saas: saasTheme,
  enterprise: enterpriseTheme,
  custom: customTheme, // Add your theme
};
```

## Color Guidelines

### Primary Colors
- Use for main actions, links, and brand elements
- `primary-500` is the main brand color
- `primary-50` for light backgrounds
- `primary-900` for dark text

### Secondary Colors  
- Use for text, borders, and subtle elements
- `secondary-500` for regular text
- `secondary-300` for borders
- `secondary-700` for emphasis

### Accent Colors
- Use sparingly for call-to-action elements
- `accent-500` for CTA buttons
- `accent-50` for light accents

### Semantic Colors
- `success` - Green for positive actions
- `warning` - Orange/yellow for caution
- `error` - Red for errors and destructive actions
- `info` - Blue for informational content

## Typography Guidelines

### Font Families

- **Display Font**: Use for headings, titles, and important UI text
- **Body Font**: Use for paragraphs, descriptions, and general content  
- **Mono Font**: Use for code, data, and technical content

### Usage Examples

```tsx
<h1 className="font-display font-bold text-4xl">Main Heading</h1>
<h2 className="font-display font-semibold text-2xl">Subheading</h2>
<p className="font-body text-lg">Body paragraph text</p>
<code className="font-mono text-sm">Code snippet</code>
```

## Best Practices

### 1. Consistency
- Always use theme tokens instead of hardcoded colors
- Use semantic color names when possible
- Maintain consistent spacing using theme values

### 2. Accessibility
- Ensure sufficient color contrast ratios
- Test themes in both light and dark modes
- Provide alternative text styling for different contexts

### 3. Performance
- Theme switching happens instantly via CSS custom properties
- No layout shifts when changing themes
- Efficient re-rendering with React context

### 4. Maintenance
- Document any custom theme additions
- Test theme changes across all components
- Keep theme definitions in version control

## Components Updated

The following components have been updated to use the centralized theme system:

- ✅ Navbar
- ✅ Footer  
- ✅ LanguageSwitcher
- ✅ ThemeSwitcher
- ✅ Button (UI component)
- ✅ Home page
- ✅ Layout components

## Migration Guide

When updating existing components to use the theme system:

1. Replace hardcoded colors with theme classes:
   ```tsx
   // Before
   <div className="bg-blue-500 text-white">
   
   // After  
   <div className="bg-primary text-primary-contrast">
   ```

2. Use theme typography classes:
   ```tsx
   // Before
   <h1 className="font-bold">
   
   // After
   <h1 className="font-display font-bold">
   ```

3. Apply consistent transitions:
   ```tsx
   <button className="transition-colors duration-200 hover:bg-primary-600">
   ```

## Troubleshooting

### Theme Not Loading
- Check that ThemeProvider wraps your app components
- Verify theme ID exists in available themes
- Check browser console for context errors

### Styles Not Updating
- Ensure CSS custom properties are being set
- Check that Tailwind is processing theme classes
- Verify component re-rendering after theme change

### TypeScript Errors
- Import theme types: `import { ThemeConfig } from '@/types/theme'`
- Ensure theme objects match ThemeConfig interface
- Check for typos in color shade names (50, 100, 200, etc.)
