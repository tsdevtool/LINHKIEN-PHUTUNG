import DarkMode from "./ui/DarkMode";
const SidebarLeft = () => {
  return (
    <div className=" my-8 min-w-1/12 w-[260px] h-fit max-md:hidden ml-3 mr-6 p-6 font-primary bg-white dark:bg-gray-900 rounded-2xl flex flex-col shadow-gray-400 shadow-lg">
      <div className="flex justify-center my-4">
        <DarkMode />
      </div>

      <a
        href="#do-choi-xe-may"
        className="bg-transparent text-center line-clamp-2 my-4 hover:bg-gray-600/20 rounded-xl py-2 px-4 max-md:py-1 max-md:px-2"
      >
        Đồ chơi xe máy
      </a>
      <a
        href="#phu-tung-thay-the"
        className="bg-transparent text-center line-clamp-2 my-4 hover:bg-gray-600/20 rounded-xl py-2 px-4 max-md:py-1 max-md:px-2"
      >
        Phụ tùng thay thế
      </a>
      <a
        href="#vo-xe-may"
        className="bg-transparent text-center line-clamp-2 my-4 hover:bg-gray-600/20 rounded-xl py-2 px-4 max-md:py-1 max-md:px-2"
      >
        Vỏ xe máy (lốp xe)
      </a>
      <a
        href="#nhot-xe-may"
        className="bg-transparent text-center line-clamp-2 my-4 hover:bg-gray-600/20 rounded-xl py-2 px-4 max-md:py-1 max-md:px-2"
      >
        Nhớt xe máy
      </a>
      <a
        href="#phu-tung-theo-xe"
        className="bg-transparent text-center line-clamp-2 my-4 hover:bg-gray-600/20 rounded-xl py-2 px-4 max-md:py-1 max-md:px-2"
      >
        Phụ tùng theo xe
      </a>
    </div>
  );
};

export default SidebarLeft;
