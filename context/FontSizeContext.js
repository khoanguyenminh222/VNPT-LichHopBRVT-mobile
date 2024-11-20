import React, { createContext, useState, useContext } from 'react';

// Tạo context cho cỡ chữ
const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState(16);

    return (
        <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
            {children}
        </FontSizeContext.Provider>
    );
};

export const useFontSize = () => useContext(FontSizeContext);
