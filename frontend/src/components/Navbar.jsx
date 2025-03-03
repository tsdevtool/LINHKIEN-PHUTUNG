import { useState } from "react";
import { Link } from "react-router-dom";
import SearchBox from "./ui/SearchBox";
import {
  CircleUserRound,
  LockKeyhole,
  LogOut,
  ShoppingCart,
} from "lucide-react";
import { useAuthStore } from "../store/authUser";
import ProfileMenu from "./ui/ProfileMenu";

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  // const { user, logout } = useAuthStore();

  const [user, setUser] = useState(true);
  const [cart, setCart] = useState(3);
  const [isAdmin, setIsAdmin] = useState(false);
  // const [isLogged, setIsLogged] = useState(true);
  return (
    <nav className="mt-4 py-4 px-6 bg-white shadow-2xl dark:bg-gray-600/80 border border-cyan-400 rounded-2xl justify-center flex">
      <div className="flex justify-between items-center w-7xl">
        {/* Logo */}
        <Link to={"/"} className="w-16 flex flex-col items-center max-md:mr-6">
          <img src="/logo-nobg.png" alt="Logo" />
          <span className="text-cyan-600 dark:text-cyan-200 font-bold">
            MotorKing
          </span>
        </Link>

        {/* Search */}
        <div className="relative flex flex-col max-w-4xl max-md:w-lg justify-center items-center gap-3">
          <SearchBox />
          <div className="flex w-full gap-4 font-medium">
            <ul className="grid justify-center items-center grid-cols-5 max-md:grid-cols-3 gap-6">
              {[
                {
                  title: "ĐỒ CHƠI XE MÁY",
                  items: [
                    "Tay thắng + Phụ kiện",
                    "Bao tay + Gù",
                    "Kính chiếu hậu + Ốc kiến",
                    "Đèn led xe máy",
                    "Đĩa xe máy",
                  ],
                },
                {
                  title: "PHỤ TÙNG THAY THẾ",
                  items: [
                    "Phuộc xe máy",
                    "Nhông sên dĩa",
                    "Bố thắng (Má phanh)",
                    "Mâm xe máy",
                    "Bình ắc quy xe máy",
                  ],
                },
                {
                  title: "VỎ XE MÁY (LỐP XE)",
                  items: ["Vỏ xe Michelin", "Vỏ xe Dunlop"],
                },
                {
                  title: "NHỚT XE MÁY",
                  items: ["Motul", "Mobil", "Fuchs", "Ipone"],
                },
                {
                  title: "PHỤ TÙNG THEO XE",
                  items: [
                    "Liên hệ",
                    "Liên hệ",
                    "Liên hệ",
                    "Liên hệ",
                    "Liên hệ",
                  ],
                },
              ].map((menu, index) => (
                <li
                  key={index}
                  className="text-center cursor-pointer hover:text-cyan-500 z-10"
                  onMouseEnter={() => setActiveDropdown(menu.title)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {menu.title}
                  {activeDropdown === menu.title && (
                    <div
                      className={`absolute top-full left-0 w-full bg-gray-200/80 p-2 shadow-md rounded-2xl text-black z-0 grid  ${
                        index > 3
                          ? "flex-col-reverse grid-cols-3"
                          : "grid-cols-3"
                      } overflow-hidden`}
                    >
                      {menu.items.map((item, i) => (
                        <a
                          key={i}
                          href="#"
                          className={`block px-4 py-2 rounded-2xl hover:bg-cyan-600 hover:text-white m-2 truncate ${
                            index > 3 ? "text-end" : "text-start"
                          }`}
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Auth */}
        <div className="flex flex-col justify-center items-center gap-3">
          <div className="flex justify-center items-center gap-2">
            {isAdmin && (
              <Link
                to={"/dashboard"}
                className="bg-cyan-400 hover:bg-cyan-600 text-white px-3 py-1 rounded-md font-medium
              transition duration-300 ease-in-out flex items-center"
              >
                <LockKeyhole className="inline-block mr-1" size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}
            <ProfileMenu />
            {/* {isLogged ? (
              <button
                className="bg-red-700 hover:bg-red-400 text-white py-2 px-4 
						rounded-md flex items-center transition duration-300 ease-in-out"
                onClick={() => setIsLogged(false)}
              >
                <LogOut size={18} />
              </button>
            ) : (
              <>
                <Link
                  to={"/auth"}
                  className="bg-lime-700/80 hover:bg-lime-500 text-white py-2 px-4 
									rounded-md flex items-center transition duration-300 ease-in-out text-sm"
                >
                  <CircleUserRound className="mr-2" size={18} />
                  Đăng nhập / Đăng ký
                </Link>
              </>
            )} */}
          </div>
          {user && (
            <Link

              to={"/cart"}
              className="relative group text-gray-600 hover:text-cyan-300 transition duration-300 ease-in-out z-10"

              <ShoppingCart
                className="inline-block mr-1 dark:text-white group-hover:text-cyan-300"
                size={24}
              />
              <span className="hidden sm:inline dark:text-white ">Cart</span>
              {cart > 0 && (
                <span className="absolute -top-2 -left-2 bg-amber-400  text-white rounded-full px-2 py-0.5 text-xs group-hover:bg-amber-300 transition duration-300 ease-in-out font-medium">
                  {cart}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
