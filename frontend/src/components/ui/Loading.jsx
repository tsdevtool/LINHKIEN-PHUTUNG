import { Loader } from "lucide-react";

const Loading = () => {
  return (
    <div className="h-screen">
      <div className="flex justify-center items-center dark:bg-black h-full">
        <Loader className="animate-spin text-cyan-600 size-10" />
      </div>
    </div>
  );
};

export default Loading;
