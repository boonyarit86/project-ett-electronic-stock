import { createContext } from 'react';

// variable global of react
export const AuthContext = createContext({
    token: null,
    userId: null,
    login: () => { },
    logout: () => { },
});