import {
  KeySquare,
  KeySquareIcon,
  Mail,
  SquareUserRound,
  UserRound,
  UserRoundPen,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authUser";
import toast from "react-hot-toast";
const AuthPage = () => {
  const { searchParams } = new URL(document.location);
  const [positionContainer, setPositionContainer] = useState(false);
  const { login, isLoggingIn, signup, isSigningUp } = useAuthStore();
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const emailValue = searchParams.get("email");
  const [email, setEmail] = useState(emailValue || "");

  const handleSignUp = (e) => {
    e.preventDefault();
    if (password !== rePassword) return toast.error("Mật khẩu chưa khớp");
    signup({ phone, password, firstname, lastname, email });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    login({ phone, password });
  };
  return (
    <div className="flex justify-center items-center w-full  min-h-screen bg-linear-to-tr from-gray-200 via-pink-200 to-cyan-500">
      <div
        className={`relative w-4xl h-[550px] bg-gray-200/80 rounded-4xl shadow-2xl overflow-hidden`}
      >
        {/* Login */}
        <div
          className={`absolute right-0 w-[50%] flex items-center text-black text-center h-full rounded-4xl z-10 transition-all duration-[600ms] ease-in-out delay-[1200ms] ${
            positionContainer
              ? "invisible opacity-0 transition-opacity duration-0 delay-[1000ms] right-[50%] "
              : "right-0 "
          }`}
        >
          <form
            onSubmit={handleLogin}
            className="w-full flex flex-col gap-5 p-10 "
          >
            <h1 className="text-4xl -mx-2.5 my-0 font-bold">Đăng nhập</h1>
            <div className="relative flex">
              <SquareUserRound className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-800" />
              <input
                type="text"
                className="w-full p-3 pr-14 bg-gray-200/60 rounded-xl border-none outline-none text-[16px] text-gray-900 font-medium placeholder-gray-500 placeholder:font-medium"
                placeholder="Số điện thoại"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="relative flex">
              <KeySquare className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-800" />
              <input
                type="password"
                className="w-full p-3 pr-14 bg-gray-200/60 rounded-xl border-none outline-none text-[16px] text-gray-900 font-medium placeholder-gray-500 placeholder:font-medium"
                placeholder="Mật khẩu"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="ml-3.5 mr-3.5 my-0">
              <Link
                className="text-sm hover:underline text-gray-800"
                to="/forgot-password"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full h-12 bg-pink-400/80 rounded-lg shadow-xl border-none cursor-pointer text-[16px] text-white font-semibold hover:bg-pink-400"
            >
              Đăng nhập
            </button>
          </form>
        </div>

        {/* Register */}
        <div
          className={`absolute right-0 w-[50%] flex items-center text-black text-center h-full rounded-4xl z-10 transition-all duration-[600ms] ease-in-out delay-[1200ms] ${
            positionContainer
              ? "right-[50%]"
              : "opacity-0 transition-opacity duration-0 delay-[1000ms] right-0 invisible"
          }`}
        >
          <form
            onSubmit={handleSignUp}
            className="w-full flex flex-col gap-5 p-10 z-1"
          >
            <h1 className="text-4xl -mx-2.5 my-0 font-bold">Đăng ký</h1>
            <div className="flex gap-2">
              <div className="relative w-48 flex">
                <UserRoundPen className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-800" />
                <input
                  type="text"
                  className="w-full p-3 pr-14 bg-gray-200/60 rounded-xl border-none outline-none text-[16px] text-gray-900 font-medium placeholder-gray-500 placeholder:font-medium"
                  placeholder="Tên"
                  id="firstname"
                  value={firstname}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="relative w-full flex">
                <UserRound className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-800" />
                <input
                  type="text"
                  className="w-full p-3 pr-14 bg-gray-200/60 rounded-xl border-none outline-none text-[16px] text-gray-900 font-medium placeholder-gray-500 placeholder:font-medium"
                  placeholder="Tên đệm"
                  id="lastname"
                  value={lastname}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="relative flex">
              <SquareUserRound className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-800" />
              <input
                type="text"
                className="w-full p-3 pr-14 bg-gray-200/60 rounded-xl border-none outline-none text-[16px] text-gray-900 font-medium placeholder-gray-500 placeholder:font-medium"
                placeholder="Số điện thoại"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="relative flex">
              <KeySquare className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-800" />
              <input
                type="password"
                className="w-full p-3 pr-14 bg-gray-200/60 rounded-xl border-none outline-none text-[16px] text-gray-900 font-medium placeholder-gray-500 placeholder:font-medium"
                placeholder="Mật khẩu"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="relative flex">
              <KeySquareIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-800" />
              <input
                type="password"
                className="w-full p-3 pr-14 bg-gray-200/60 rounded-xl border-none outline-none text-[16px] text-gray-900 font-medium placeholder-gray-500 placeholder:font-medium"
                placeholder="Nhập lại mật khẩu"
                id="re-password"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                required
              />
            </div>
            <div className="relative flex">
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-800" />
              <input
                type="email"
                className="w-full p-3 pr-14 bg-gray-200/60 rounded-xl border-none outline-none text-[16px] text-gray-900 font-medium placeholder-gray-500 placeholder:font-medium"
                placeholder="Email (Không bắt buộc)"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="ml-3.5 mr-3.5 my-0">
              <Link
                className="text-sm hover:underline text-gray-800"
                to="/forgot-password"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full h-12 bg-pink-400/80 rounded-lg shadow-xl border-none cursor-pointer text-[16px] text-white font-semibold hover:bg-pink-400"
            >
              Đăng ký
            </button>
          </form>
        </div>

        {/* Toggle box */}
        <div
          className={`absolute w-full h-full before:content-[''] before:absolute before:w-[300%] before:h-full before:bg-cyan-400/80 text-white  before:rounded-[150px] before:transition-all transform before:duration-[1800ms] before:ease-in-out ${
            positionContainer ? "before:left-[50%]" : "before:left-[-250%]"
          }`}
        >
          {/* Left */}
          <div
            className={`absolute w-1/2 h-full flex flex-col justify-center items-center  rounded-r-[150px] px-10 left-0 transition-all duration-[1800ms] ease-in-out ${
              positionContainer ? "left-[-50%] delay-[600ms]" : "delay-[600ms]"
            }`}
          >
            <img src="/vite.svg" alt="Logo" className="w-32 h-auto" />
            <h1 className="font-bold text-3xl mb-2">Xin chào!</h1>
            <p className="text-center mb-5">
              Bạn không có tài khoản ư? Đăng ký để sử dụng dịch vụ của chúng tôi
              nhé 😍😍
            </p>
            <button
              className="w-40 h-11 bg-transparent border-2 border-white shadow-none cursor-pointer"
              onClick={() => setPositionContainer(!positionContainer)}
            >
              Đăng ký
            </button>
            <div className="ml-3.5 mr-3.5 mt-6">
              <Link className="text-sm hover:underline text-white" to="/">
                Trở về trang chủ
              </Link>
            </div>
          </div>

          {/* Right */}
          <div
            className={`absolute w-1/2 h-full flex flex-col justify-center items-center  rounded-r-[150px] px-10  transition-all duration-[600ms] ease-in-out ${
              positionContainer
                ? "right-0 delay-[1200ms]"
                : "right-[-50%] delay-[600ms]"
            }`}
          >
            <img src="/vite.svg" alt="Logo" className="w-32 h-auto" />
            <h1 className="font-bold text-3xl mb-2 text-center">
              Welcome back!
            </h1>
            <p className="text-center mb-5">
              Nếu bạn đã có tài khoản. Đăng nhập để sử dụng dịch vụ của chúng
              tôi nhé 😍😍
            </p>
            <button
              className="w-40 h-11 bg-transparent border-2 border-white shadow-none right-[-50%] cursor-pointer"
              onClick={() => setPositionContainer(!positionContainer)}
            >
              Đăng nhập
            </button>
            <div className="ml-3.5 mr-3.5 mt-6">
              <Link className="text-sm hover:underline text-white" to="/">
                Trở về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
