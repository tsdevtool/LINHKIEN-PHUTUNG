import { useEffect, useState } from "react";

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`relative w-16 h-8 flex items-center bg-cyan-500 rounded-full p-1 transition-all ${
        darkMode ? "bg-cyan-500" : "bg-gray-400"
      }`}
    >
      <div
        className={`absolute left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-all ${
          darkMode ? "translate-x-8 bg-yellow-400" : "translate-x-0 bg-gray-200"
        }`}
      />
    </button>
  );
};

export default DarkModeToggle;
