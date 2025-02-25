import { Facebook, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Công ty */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Công ty</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                Giới thiệu
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Tuyển dụng
              </a>
            </li>
            <li>
              <a href="#" className="hover:underlin">
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Điều khoản sử dụng
              </a>
            </li>
          </ul>
        </div>

        {/* Dịch vụ khách hàng */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Dịch vụ khách hàng</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                Trung tâm trợ giúp
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Kiểm tra đơn hàng
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Đổi trả & Bảo hành
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Thông tin vận chuyển
              </a>
            </li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Liên hệ</h3>
          <p className="text-sm mb-2">Bạn có câu hỏi? Liên hệ với chúng tôi:</p>
          <p className="text-sm">Email: support@motorking.com</p>
          <p className="text-sm mb-4">Hotline: +84 123 456 789</p>
          <div className="flex space-x-4 text-2xl">
            <a href="#" className="hover:text-cyan-500">
              <Facebook />
            </a>
            <a href="#" className="hover:text-cyan-500">
              <Instagram />
            </a>
            <a href="#" className="hover:text-cyan-500">
              <Youtube />
            </a>
          </div>
        </div>

        {/* Bản tin */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Trợ giúp</h3>
          <p className="text-sm mb-3">
            Gửi email cho chúng tôi nếu bạn cần trợ giúp.
          </p>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            className="w-full p-2 rounded bg-gray-800/90 text-white placeholder-gray-400 mb-2"
          />
          <button className="w-full bg-cyan-500 text-white p-2 rounded hover:bg-cyan-600">
            Gửi Email
          </button>
        </div>
      </div>

      {/* Bản quyền & Liên kết */}
      <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-6 text-center text-sm">
        <p>© 2025 MotorKing. Bảo lưu mọi quyền.</p>
        <div className="flex justify-center space-x-6 mt-2">
          <a href="#" className="hover:underline">
            FAQ
          </a>
          <a href="#" className="hover:underline">
            Vận chuyển
          </a>
          <a href="#" className="hover:underline">
            Đổi trả
          </a>
          <a href="#" className="hover:underline">
            Liên hệ
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
