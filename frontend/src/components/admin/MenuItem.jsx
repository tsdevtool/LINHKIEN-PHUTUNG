import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const MenuItem = ({ item, isOpen, isLocked, isActive }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  return (
    <div className="relative">
      <Link
        to={item.link}
        onClick={
          item.subItems
            ? (e) => {
                e.preventDefault();
                setIsSubMenuOpen(!isSubMenuOpen);
              }
            : undefined
        }
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300",
          "hover:bg-gray-800 hover:translate-x-1",
          isActive && "bg-gray-800 text-blue-400",
          !isActive && "text-gray-300 hover:text-white"
        )}
      >
        <div
          className={cn(
            "min-w-8 h-8 flex items-center justify-center",
            "rounded-lg bg-gray-800/50",
            isActive && "bg-blue-500/20 text-blue-500"
          )}
        >
          {item.icon}
        </div>
        {(isOpen || isLocked) && (
          <div className="flex items-center justify-between flex-1">
            <span className="font-medium">{item.name}</span>
            {item.subItems && (
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  isSubMenuOpen && "rotate-180"
                )}
              />
            )}
          </div>
        )}
      </Link>

      {item.subItems && (isOpen || isLocked) && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 pl-12",
            isSubMenuOpen ? "max-h-96" : "max-h-0"
          )}
        >
          {item.subItems.map((subItem, index) => (
            <Link
              key={index}
              to={subItem.link}
              className={cn(
                "block py-2 px-3 text-sm rounded-lg transition-all duration-300",
                "text-gray-400 hover:text-white hover:bg-gray-800/50 hover:translate-x-1",
                "my-1"
              )}
            >
              {subItem.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

MenuItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    link: PropTypes.string.isRequired,
    subItems: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
};

export default MenuItem;
