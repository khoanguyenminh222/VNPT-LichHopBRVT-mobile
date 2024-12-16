import React, { createContext, useState } from 'react';

export const FakeIOSContext = createContext();

export const FakeIOSProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState(16);

    return (
        <FakeIOSContext.Provider value={{ isDarkMode, setIsDarkMode, fontSize, setFontSize }}>
            {children}
        </FakeIOSContext.Provider>
    );
};
