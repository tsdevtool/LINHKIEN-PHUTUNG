import PropTypes from "prop-types";
import { useCategories } from "../../hooks/useCategories";
import SearchBox from "./SearchBox";
import NavMenuItem from "./NavMenuItem";
import { LoadingMenu, ErrorMenu } from "../skeletons/LoadingStates";

const DesktopMenu = ({ activeDropdown, setActiveDropdown }) => {
  const { data: categories, isLoading, isError } = useCategories();

  if (isLoading) return <LoadingMenu />;
  if (isError) return <ErrorMenu />;

  // Kiểm tra nếu không có danh mục
  if (!categories || categories.length === 0) {
    return (
      <div className="hidden lg:flex lg:w-2/3 lg:justify-center">
        <div className="w-full max-w-4xl flex flex-col items-center">
          <div className="w-2/3 mb-4">
            <SearchBox />
          </div>
          <div className="text-center py-4">Không có danh mục nào.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex lg:w-2/3 lg:justify-center">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="w-2/3 mb-4">
          <SearchBox />
        </div>
        <div className="w-[90%]">
          <ul className="flex justify-between items-center ">
            {categories.map((menu) => (
              <li key={menu.id} className="px-2 uppercase">
                <NavMenuItem
                  menu={menu}
                  isActive={activeDropdown === menu.title}
                  onMouseEnter={() => setActiveDropdown(menu.title)}
                  onMouseLeave={() => setActiveDropdown(null)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

DesktopMenu.propTypes = {
  activeDropdown: PropTypes.string,
  setActiveDropdown: PropTypes.func.isRequired,
};

export default DesktopMenu;
