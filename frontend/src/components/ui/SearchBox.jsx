import { Search } from "lucide-react";

const SearchBox = () => {
  return (
    <div className="relative w-full md:max-w-xl">
      <input
        type="text"
        className="w-full px-4 py-2 border border-cyan-100 rounded-full text-sm shadow focus:outline-none focus:ring-2 focus:ring-cyan-500"
        placeholder="Bạn muốn tìm gì nè?"
      />
      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-500 text-white py-2 px-4 rounded-full focus:outline-none">
        <Search size={14} />
      </button>
    </div>
  );
};

export default SearchBox;
