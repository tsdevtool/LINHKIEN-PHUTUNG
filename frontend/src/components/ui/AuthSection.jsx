import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { LockKeyhole, ShoppingCart } from "lucide-react";
import ProfileMenu from "./ProfileMenu";

const AuthSection = ({ isAdmin, user, cart }) => (
  <div className="flex items-center space-x-4">
    {isAdmin && (
      <Link
        to="/dashboard"
        className="bg-cyan-400 hover:bg-cyan-600 text-white px-3 py-1 rounded-md font-medium
        transition duration-300 ease-in-out hidden sm:flex items-center"
      >
        <LockKeyhole className="w-4 h-4 mr-1" />
        <span>Dashboard</span>
      </Link>
    )}
    <ProfileMenu />
    {user && (
      <Link to="/cart" className="relative group flex items-center space-x-1">
        <ShoppingCart className="w-6 h-6 text-gray-600 dark:text-white group-hover:text-cyan-500" />
        {cart > 0 && (
          <span className="absolute -top-2 -right-2 bg-amber-400 text-white rounded-full px-2 py-0.5 text-xs">
            {cart}
          </span>
        )}
      </Link>
    )}
  </div>
);

AuthSection.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  user: PropTypes.bool.isRequired,
  cart: PropTypes.number.isRequired,
};

export default AuthSection;
