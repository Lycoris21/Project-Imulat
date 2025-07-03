// STILL TESTING
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
    const [isDark, setIsDark] = useState(() =>
        localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="px-3 py-1 border rounded text-sm font-medium border-gray-400 dark:border-gray-300 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a1 1 0 01.993.883L11 3v1a1 1 0 01-1.993.117L9 4V3a1 1 0 011-1zm4.22 2.22a1 1 0 011.415 1.414l-.708.708a1 1 0 01-1.415-1.414l.708-.708zM17 9a1 1 0 01.117 1.993L17 11h-1a1 1 0 01-.117-1.993L16 9h1zM4.22 4.22a1 1 0 011.415 0l.708.708A1 1 0 014.93 6.34l-.708-.707a1 1 0 010-1.415zM3 10a1 1 0 011-1h1a1 1 0 01.117 1.993L5 11H4a1 1 0 01-1-1zm1.22 5.78a1 1 0 011.415 0l.708.708a1 1 0 01-1.415 1.414l-.708-.707a1 1 0 010-1.415zm10.56 0a1 1 0 011.415 1.415l-.708.707a1 1 0 01-1.415-1.414l.708-.708zM10 16a1 1 0 01.993.883L11 17v1a1 1 0 01-1.993.117L9 18v-1a1 1 0 011-1z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            )}

        </button>
    );
}
