import { useEffect, useState } from "react";

const DarkMode = () => {
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
  });
  return (
    <button
      className="p-2 bg-gray-200 dark:bg-gray-800 rounded"
      onClick={() => setDarkMode(!darkMode)}
    >
      {darkMode ? "🌞 Sáng" : "🌙 Tối"}
    </button>
  );
};

export default DarkMode;
