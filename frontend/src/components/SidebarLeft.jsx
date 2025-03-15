import { useCategories } from "@/hooks/useCategories";
import DarkMode from "./ui/DarkMode";
import { ErrorMenu, LoadingMenu } from "./skeletons/LoadingStates";

const SidebarLeft = () => {
  const { data: categories, isLoading, isError } = useCategories();

  if (isLoading) return <LoadingMenu />;
  if (isError) return <ErrorMenu />;

  if (!categories || categories.length === 0) {
    return (
      <div className=" my-8 min-w-1/12 w-[260px] h-fit max-md:hidden ml-3 mr-6 p-6 font-primary bg-white dark:bg-gray-900 rounded-2xl flex flex-col shadow-gray-400 shadow-lg">
        <div className="flex justify-center my-4">
          <DarkMode />
        </div>
        <div className="text-center py-4">Không có danh mục nào.</div>
      </div>
    );
  }

  return (
    <div className=" my-8 min-w-1/12 w-[260px] h-fit max-md:hidden ml-3 mr-6 p-6 font-primary bg-white dark:bg-gray-900 rounded-2xl flex flex-col shadow-gray-400 shadow-lg">
      <div className="flex justify-center my-4">
        <DarkMode />
      </div>

      {categories.map((category) => (
        <a
          key={category.id}
          href={`#${category.title}`}
          className="bg-transparent text-center line-clamp-2 my-4 hover:bg-gray-600/20 rounded-xl py-2 px-4 max-md:py-1 max-md:px-2"
        >
          {category.title}
        </a>
      ))}
    </div>
  );
};

export default SidebarLeft;
