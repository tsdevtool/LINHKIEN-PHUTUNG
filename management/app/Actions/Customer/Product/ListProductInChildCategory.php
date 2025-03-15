<?php

namespace App\Actions\Customer\Product;

use App\Http\Requests\Product\ListProductInChildCategoryRequest;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ListProductInChildCategory
{
    use ApiResponse;

    /**
     * Execute the action
     *
     * @param ListProductInChildCategoryRequest $request
     * @return JsonResponse
     */
    public function execute(ListProductInChildCategoryRequest $request): JsonResponse
    {
        try {
            $category = $this->findAndValidateCategory($request->category_id);
            if (!$category) {
                return $this->errorResponse('Không tìm thấy danh mục');
            }

            if ($category->parent_id === null) {
                return $this->errorResponse('Danh mục này không phải danh mục con');
            }

            $products = $category->products()
                ->where('active', true)
                ->where('quantity', '>', 0)
                ->with('reviews')
                ->get()
                ->map(function ($product) {
                    return $this->formatProductResponse($product);
                });

            return $this->successResponse(
                'Lấy danh sách sản phẩm thành công',
                [
                    'category' => [
                        'id' => $category->_id,
                        'name' => $category->name,
                        'parent' => [
                            'id' => $category->parent->_id,
                            'name' => $category->parent->name
                        ]
                    ],
                    'products' => $products
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Có lỗi xảy ra khi lấy danh sách sản phẩm', $e);
        }
    }

    /**
     * Find and validate category
     *
     * @param string $id
     * @return Category|null
     */
    private function findAndValidateCategory(string $id): ?Category
    {
        return Category::with('parent')
            ->where('_id', $id)
            ->where('active', true)
            ->first();
    }

    /**
     * Format product response
     *
     * @param mixed $product
     * @return array
     */
    private function formatProductResponse($product): array
    {
        $avgRating = $product->reviews->avg('rating') ?? 0;
        $reviewCount = $product->reviews->count();

        return [
            'id' => $product->_id,
            'name' => $product->name,
            'price' => $product->price,
            'quantity' => $product->quantity,
            'image_url' => $product->image_url,
            'average_rating' => round($avgRating, 1),
            'review_count' => $reviewCount
        ];
    }
} 