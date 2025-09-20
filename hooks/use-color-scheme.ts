import { useColorScheme as _useColorScheme } from 'react-native';

// Wrapper to default to dark theme when system preference is undefined.
export function useColorScheme(): 'light' | 'dark' | null {
	const scheme = _useColorScheme();
	// If scheme is null (web or undefined), prefer dark to satisfy project request.
	if (scheme === null || scheme === undefined) return 'dark';
	return scheme;
}
