import React, { createContext, useState, useContext } from 'react';

// Create the Theme Context
const ThemeContext = createContext();

// Custom hook to use the Theme Context
export const useTheme = () => {
  return useContext(ThemeContext);
};

// ThemeProvider component to wrap around your application
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // Default theme is 'light'

  // Function to toggle the theme between light and dark
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
