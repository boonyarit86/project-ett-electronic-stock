import { createContext } from 'react';

// variable global of react
export const AuthContext = createContext({
    isLoggedIn: false,
    token: null,
    userStatus: null,
    login: () => { },
    logout: () => { },
});