import React, { createContext, useContext, useState, useEffect } from "react";
import { View } from "react-native";
import { colorScheme } from "nativewind";
import { themes } from "@/utils/color-theme";

interface ThemeProviderProps {
    children: React.ReactNode;
}

type ThemeContextType = {
    theme: "light" | "dark";
    isDark: boolean;
    toggleTheme: () => void;
    themeVars: ReturnType<typeof themes.dark>;
    isInitialized: boolean;
};

export const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    isDark: true,
    toggleTheme: () => { },
    themeVars: themes.dark,
    isInitialized: true,
});

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("dark");
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize theme on mount
    useEffect(() => {
        setIsInitialized(true);
    }, []);

    const themeVars = themes[currentTheme];
    const isDark = currentTheme === "dark";

    const toggleTheme = () => {
        const newTheme = currentTheme === "light" ? "dark" : "light";
        setCurrentTheme(newTheme);
        colorScheme.set(newTheme);
    };

    // Don't render until initialized
    if (!isInitialized) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, isDark, toggleTheme, themeVars, isInitialized }}>
            <View style={themeVars} className="flex-1 bg-background">
                {children}
            </View>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeProvider;
