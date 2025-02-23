import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import DarkMode from "../../components/ui/DarkMode";

const HomePage = () => {
  return (
    <div className="bg-white text-black dark:bg-black dark:text-white p-4 h-screen">
      <Header />
      <Navbar />
      <DarkMode />
    </div>
  );
};

export default HomePage;
