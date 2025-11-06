import { type NavigateFunction } from 'react-router-dom';

// Store the navigate function reference
export const navigationRef: { current: NavigateFunction | null } = {
    current: null,
};

// Set the navigate function reference
export function setNavigationRef(navigateFunction: NavigateFunction) {
    navigationRef.current = navigateFunction;
}

// Navigate from outside React components
export function navigate(to: string, options?: { replace?: boolean }) {
    if (navigationRef.current) {
        navigationRef.current(to, options);
    } else {
        console.warn('Navigation ref is not set. Make sure the router is initialized.');
    }
}

