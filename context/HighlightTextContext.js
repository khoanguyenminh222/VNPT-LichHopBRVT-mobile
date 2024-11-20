import React, { createContext, useState, useContext } from 'react';

// Tạo context để quản lý từ cần highlight
const HighlightTextContext = createContext();

export const HighlightTextProvider = ({ children }) => {
    const [highlightText, setHighlightText] = useState('');

    return (
        <HighlightTextContext.Provider value={{ highlightText, setHighlightText }}>
            {children}
        </HighlightTextContext.Provider>
    );
};

export const useHighlightText = () => useContext(HighlightTextContext);