<?php

namespace App\Actions\Home;

use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class GetHomeCategoriesAction
{
    use ApiResponse;

    /**
     * Execute the action to get parent categories with their children's products
     */
    public function execute(): JsonResponse
    {
        try {
            $categories = $this->getParentCategoriesWithProducts();
            return $this->successResponse('Lấy danh sách thành công', $categories);
        } catch (\Exception $e) {
            return $this->errorResponse('Có lỗi xảy ra khi lấy thông tin danh mục', $e);
        }
    }

    /**
     * Get parent categories with their children's products
     */
    private function getParentCategoriesWithProducts(): array
    {
        return Category::where('parent_id', null)
            ->where('active', true)
            ->with(['children' => function($query) {
                $query->where('active', true)
                    ->with(['products' => function($query) {
                        $query->where('quantity', '>', 0)
                            ->where('active', true)
                            ->select('_id', 'name', 'price', 'quantity', 'image_url', 'category_id');
                    }]);
            }])
            ->get()
            ->map(function($parentCategory) {
                return [
                    'id' => $parentCategory->_id,
                    'name' => $parentCategory->name,
                    'products' => $this->getFormattedProducts($parentCategory)
                ];
            })
            ->toArray();
    }

    /**
     * Get formatted products from child categories
     */
    private function getFormattedProducts(Category $parentCategory): array
    {
        return $parentCategory->children
            ->flatMap(function($child) {
                return $child->products->map(function($product) {
                    return [
                        'id' => $product->_id,
                        'name' => $product->name,
                        'price' => $product->price,
                        'quantity' => $product->quantity,
                        'image_url' => $product->image_url
                    ];
                });
            })
            ->shuffle()
            ->take(6)
            ->values()
            ->toArray();
    }
} 