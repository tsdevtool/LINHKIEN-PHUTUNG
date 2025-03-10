import { Loader2 } from "lucide-react";

export const LoadingMenu = () => (
  <div className="flex justify-center items-center h-24">
    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
  </div>
);

export const ErrorMenu = () => (
  <div className="text-center text-red-500 py-4">
    Không thể tải danh mục. Vui lòng thử lại sau.
  </div>
);
