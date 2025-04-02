import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const NavMenuItem = ({
  menu,
  isActive,
  onMouseEnter,
  onMouseLeave,
  isMobile,
}) => {
  if (isMobile) {
    return (
      <div className="space-y-1">
        <button
          onClick={onMouseEnter}
          className="w-full text-left px-4 py-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          {menu.title}
        </button>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pl-8 space-y-1"
            >
              {menu.items.map((item) => (
                <Link
                  key={item.id}
                  to={`/categories_products/${item.id}`}
                  className="block py-2 text-sm hover:text-cyan-500"
                >
                  {item.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className="relative group "
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        to={`/category/${menu.id}`}
        className="inline-block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-cyan-500 transition-colors whitespace-nowrap text-center"
      >
        {menu.title}
      </Link>
      <AnimatePresence>
        {isActive && menu.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50 mt-2"
          >
            {menu.items.map((item) => (
              <Link
                key={item.id}
                to={`/categories_products/${item.id}`}
                className="block px-4 py-2 text-sm hover:bg-cyan-50 dark:hover:bg-gray-700 text-left transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

NavMenuItem.propTypes = {
  menu: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        parentId: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func,
  isMobile: PropTypes.bool,
};

export default NavMenuItem;
