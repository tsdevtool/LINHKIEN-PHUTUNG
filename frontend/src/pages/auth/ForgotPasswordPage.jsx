import { PhoneCallIcon } from "lucide-react";

const ForgotPasswordPage = () => {
  return (
    <div className="flex justify-center items-center w-full  min-h-screen bg-linear-to-tr from-gray-200 via-pink-200 to-cyan-500">
      <div
        className={`w-3xl h-auto bg-gray-200/80 rounded-4xl shadow-2xl overflow-hidden`}
      >
        <form
          action=""
          className="w-full justify-center flex flex-col gap-5 p-10"
        >
          <h1 className="text-4xl -mx-2.5 my-0 font-bold">
            Tìm tài khoản của bạn
          </h1>
          <p>Vui lòng nhập số điện thoại của bạn để nhận mật khẩu mới</p>
          <div className="relative flex">
            <PhoneCallIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-800" />
            <input
              type="text"
              className="w-full p-3 pr-14 bg-gray-200/60 rounded-xl border-2 text-[16px] text-gray-900 font-medium placeholder-gray-500 placeholder:font-medium"
              placeholder="Số điện thoại"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full h-12 bg-pink-400/80 rounded-lg shadow-xl border-none cursor-pointer text-[16px] text-white font-semibold hover:bg-pink-400"
          >
            Nhận mật khẩu mới
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
