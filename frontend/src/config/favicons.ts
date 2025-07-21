/**
 * Favicon configuration for theme-based dynamic loading
 * Maps themes to their respective favicon directories and defines favicon files
 */

export type ThemeName = 'system' | 'dark-flat' | 'dark-accent' | 'light-accent' | 'light-flat';

/**
 * Maps theme names to their corresponding favicon directory paths in public/
 */
export const FAVICON_THEME_PATHS: Record<ThemeName, string> = {
  'system': '/icons_dark_flat', // Default to dark-flat for system theme
  'dark-flat': '/icons_dark_flat',
  'dark-accent': '/icons_dark_accent', 
  'light-accent': '/icons_light_accent',
  'light-flat': '/icons_light_flat',
};

/**
 * Defines the favicon files that should be loaded for each theme
 * Each object represents a <link> tag that will be dynamically created
 */
export const FAVICON_FILES = [
  {
    rel: 'icon',
    type: 'image/x-icon',
    filename: 'favicon.ico',
    sizes: undefined,
  },
  {
    rel: 'icon',
    type: 'image/png',
    filename: 'favicon-16x16.png',
    sizes: '16x16',
  },
  {
    rel: 'icon',
    type: 'image/png', 
    filename: 'favicon-32x32.png',
    sizes: '32x32',
  },
  {
    rel: 'apple-touch-icon',
    type: 'image/png',
    filename: 'apple-touch-icon.png',
    sizes: '180x180',
  },
  {
    rel: 'icon',
    type: 'image/png',
    filename: 'android-chrome-192x192.png',
    sizes: '192x192',
  },
  {
    rel: 'icon',
    type: 'image/png',
    filename: 'android-chrome-512x512.png', 
    sizes: '512x512',
  },
] as const;

/**
 * Removes all existing favicon link elements from document head
 * This prevents duplicate favicons when switching themes
 */
export const removeFavicons = (): void => {
  const faviconSelectors = [
    'link[rel="icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="shortcut icon"]',
  ];
  
  faviconSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => element.remove());
  });
};

/**
 * Dynamically loads favicons for the specified theme
 * @param theme - The theme name to load favicons for
 */
export const loadFaviconsForTheme = (theme: ThemeName): void => {
  // Remove existing favicons first
  removeFavicons();
  
  // Get the base path for this theme's favicons
  const basePath = FAVICON_THEME_PATHS[theme];
  
  // Create and append new favicon link elements
  FAVICON_FILES.forEach(favicon => {
    const link = document.createElement('link');
    link.rel = favicon.rel;
    link.type = favicon.type;
    link.href = `${basePath}/${favicon.filename}`;
    
    if (favicon.sizes) {
      link.sizes = favicon.sizes;
    }
    
    document.head.appendChild(link);
  });
  
  console.log(`✅ Loaded favicons for theme: ${theme} from ${basePath}`);
};