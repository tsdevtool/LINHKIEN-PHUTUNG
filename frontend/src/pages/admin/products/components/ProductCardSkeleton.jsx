import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-4 flex flex-col h-full animate-pulse">
      <div className="block relative overflow-hidden rounded-xl">
        <Skeleton className="w-full h-40 rounded-xl" />
      </div>

      <div className="mt-3 flex flex-col flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />

        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />

        <div className="mt-auto">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
