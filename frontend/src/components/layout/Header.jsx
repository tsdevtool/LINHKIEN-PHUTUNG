import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaShoppingCart,
  FaBell,
  FaQuestionCircle,
  FaGlobe,
} from "react-icons/fa";

const Header = () => {
  return (
    <header className="bg-primary">
      {/* Top header */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2 text-white text-sm">
          <div className="flex items-center space-x-4">
            <Link to="/seller" className="hover:opacity-80">
              Kênh Người Bán
            </Link>
            <Link to="/download" className="hover:opacity-80">
              Tải ứng dụng
            </Link>
            <div className="flex items-center space-x-2">
              <span>Kết nối</span>
              <Link to="#" className="hover:opacity-80">
                <FaFacebook />
              </Link>
              <Link to="#" className="hover:opacity-80">
                <FaInstagram />
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/notifications"
              className="flex items-center hover:opacity-80"
            >
              <FaBell className="mr-1" />
              <span>Thông Báo</span>
            </Link>
            <Link to="/help" className="flex items-center hover:opacity-80">
              <FaQuestionCircle className="mr-1" />
              <span>Hỗ Trợ</span>
            </Link>
            <div className="flex items-center hover:opacity-80">
              <FaGlobe className="mr-1" />
              <span>Tiếng Việt</span>
            </div>
            <Link to="/profile" className="hover:opacity-80">
              <img
                src="https://via.placeholder.com/24"
                alt="User"
                className="w-6 h-6 rounded-full"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-white text-2xl font-bold">
            <img src="/logo.png" alt="Logo" className="h-12" />
          </Link>

          {/* Search bar */}
          <div className="flex-1 mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Voucher thời trang 50.000Đ"
                className="w-full py-2 px-4 rounded-sm"
              />
              <button className="absolute right-0 top-0 h-full px-6 bg-primary text-white rounded-r-sm hover:opacity-90">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Search suggestions */}
            <div className="flex space-x-2 mt-2 text-white text-sm">
              <Link to="#" className="hover:opacity-80">
                Túi Xách Nữ
              </Link>
              <Link to="#" className="hover:opacity-80">
                Sassysis
              </Link>
              <Link to="#" className="hover:opacity-80">
                Váy Tiệc Cưới Sang Chảnh
              </Link>
              <Link to="#" className="hover:opacity-80">
                Túi Xách Cho Mẹ U40
              </Link>
              <Link to="#" className="hover:opacity-80">
                Váy Nữ
              </Link>
              <Link to="#" className="hover:opacity-80">
                Nước Giặt Lix
              </Link>
            </div>
          </div>

          {/* Cart */}
          <Link to="/cart" className="text-white relative">
            <FaShoppingCart className="text-2xl" />
            <span className="absolute -top-2 -right-2 bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              1
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
