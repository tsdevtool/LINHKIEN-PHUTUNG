import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "../../hooks/useCategories";
import SearchBox from "./SearchBox";
import NavMenuItem from "./NavMenuItem";
import { LoadingMenu, ErrorMenu } from "../skeletons/LoadingStates";

const MobileMenu = ({ isOpen, activeDropdown, setActiveDropdown }) => {
  const { data: categories, isLoading, isError } = useCategories();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="lg:hidden mt-4 overflow-hidden"
      >
        <div className="py-4">
          <SearchBox />
        </div>
        <div className="space-y-2">
          {isLoading ? (
            <LoadingMenu />
          ) : isError ? (
            <ErrorMenu />
          ) : (
            categories.map((menu) => (
              <NavMenuItem
                key={menu.id}
                menu={menu}
                isActive={activeDropdown === menu.title}
                onMouseEnter={() =>
                  setActiveDropdown(
                    activeDropdown === menu.title ? null : menu.title
                  )
                }
                isMobile={true}
              />
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

MobileMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  activeDropdown: PropTypes.string,
  setActiveDropdown: PropTypes.func.isRequired,
};

export default MobileMenu;
