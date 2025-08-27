// Theme configuration types for multi-tenant SaaS customization
export interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Main primary color
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Main secondary color
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  accent: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Call-to-action color
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeFonts {
  display: string[]; // For headings and important text
  body: string[]; // For body text and paragraphs
  mono: string[]; // For code and monospace text
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  borderRadius: {
    sm: string;
    DEFAULT: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    full: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
  shadows: {
    sm: string;
    DEFAULT: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface CustomerTheme {
  customerId: string;
  themeId: string;
  customizations?: Partial<ThemeConfig>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
