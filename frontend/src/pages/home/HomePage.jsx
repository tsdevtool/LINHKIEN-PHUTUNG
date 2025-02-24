import Header from "../../components/Header";
import Navbar from "../../components/Navbar";

const HomePage = () => {
  return (
    <div className="bg-white text-black dark:bg-black dark:text-white p-4 h-screen">
      <Header />
      <Navbar />
    </div>
  );
};

export default HomePage;
