import { useState } from "react";
import Logo from "./ui/Logo";
import MobileMenuButton from "./ui/MobileMenuButton";
import AuthSection from "./ui/AuthSection";
import DesktopMenu from "./ui/DesktopMenu";
import MobileMenu from "./ui/MobileMenu";
import { useAuthStore } from "../store/authUser";
const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {user} = useAuthStore();
  const [cart] = useState(3);
  const [isAdmin] = useState(false);

  return (
    <nav className="mt-4 py-4 px-4 md:px-6 mx-2 md:mx-4 bg-white shadow-2xl dark:bg-gray-600/80 border border-cyan-400 rounded-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between lg:justify-normal">
          <div className="flex items-center lg:w-1/6">
            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
            <Logo />
          </div>
          <DesktopMenu
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
          <div className="flex items-center lg:w-1/6 lg:justify-end">
            <AuthSection isAdmin={isAdmin} user={user} cart={cart} />
          </div>
        </div>
        <MobileMenu
          isOpen={isMobileMenuOpen}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />
      </div>
    </nav>
  );
};

export default Navbar;
