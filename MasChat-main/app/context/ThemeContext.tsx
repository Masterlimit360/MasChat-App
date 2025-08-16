// Re-export the theme context from constants
import { ThemeProvider, useTheme } from '../../constants/ThemeContext';

export { ThemeProvider, useTheme };

// Default export to fix warning
export default ThemeProvider;