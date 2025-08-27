import {defineRouting} from 'next-intl/routing';

export const locales = ['en', 'es', 'fr', 'ca'];
export const defaultLocale = 'en';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,
 
  // Used when no locale matches
  defaultLocale,
  
  // Always include the locale prefix in the URL
  localePrefix: 'always'
});
