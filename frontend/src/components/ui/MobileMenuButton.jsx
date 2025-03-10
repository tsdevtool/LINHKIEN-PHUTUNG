import PropTypes from "prop-types";
import { Menu as MenuIcon, X } from "lucide-react";

const MobileMenuButton = ({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
  >
    {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
  </button>
);

MobileMenuButton.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default MobileMenuButton;
