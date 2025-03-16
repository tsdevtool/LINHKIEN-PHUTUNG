<?php

namespace App\Actions\Customer\Product;

use App\Http\Requests\Product\ListProductInChildCategoryRequest;
use App\Models\Category;
use App\Models\Product;
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
            // Lấy category và kiểm tra tồn tại
            $category = $this->findAndValidateCategory($request->category_id);
            if (!$category) {
                return $this->errorResponse('Không tìm thấy danh mục', 404);
            }

            // Kiểm tra có phải danh mục con không
            if ($category->parent_id === null) {
                return $this->errorResponse('Danh mục này không phải danh mục con', 400);
            }

            // Lấy các tham số từ request
            $perPage = $request->getPerPage();
            $sortParams = $request->getSortParams();
            $search = $request->getSearchQuery();

            // Query sản phẩm với phân trang
            $query = Product::where('category_id', $category->_id)
                ->active();

            // Thêm tìm kiếm theo tên nếu có
            if (!empty($search)) {
                $query->where('name', 'like', '%' . $search . '%');
            }

            // Sắp xếp theo tham số
            $query->orderBy($sortParams['sort_by'], $sortParams['sort_direction']);

            // Phân trang
            $products = $query->paginate($perPage);

            // Format response khi không có sản phẩm
            if ($products->isEmpty()) {
                return $this->successResponse(
                    [
                        'category' => [
                            'id' => $category->_id,
                            'name' => $category->name,
                            'parent' => [
                                'id' => $category->parent->_id,
                                'name' => $category->parent->name
                            ]
                        ],
                        'current_page' => 1,
                        'data' => [],
                        'first_page_url' => null,
                        'from' => null,
                        'last_page' => 1,
                        'last_page_url' => null,
                        'next_page_url' => null,
                        'per_page' => $perPage,
                        'prev_page_url' => null,
                        'to' => null,
                        'total' => 0,
                        'filters' => [
                            'sort_by' => $sortParams['sort_by'],
                            'sort_direction' => $sortParams['sort_direction'],
                            'search' => $search
                        ]
                    ],
                    'Không có sản phẩm nào trong danh mục này'
                );
            }

            // Format response khi có sản phẩm
            return $this->successResponse(
                [
                    'category' => [
                        'id' => $category->_id,
                        'name' => $category->name,
                        'parent' => [
                            'id' => $category->parent->_id,
                            'name' => $category->parent->name
                        ]
                    ],
                    'current_page' => $products->currentPage(),
                    'data' => $products->items(),
                    'first_page_url' => $products->url(1),
                    'from' => $products->firstItem(),
                    'last_page' => $products->lastPage(),
                    'last_page_url' => $products->url($products->lastPage()),
                    'next_page_url' => $products->nextPageUrl(),
                    'per_page' => $products->perPage(),
                    'prev_page_url' => $products->previousPageUrl(),
                    'to' => $products->lastItem(),
                    'total' => $products->total(),
                    'filters' => [
                        'sort_by' => $sortParams['sort_by'],
                        'sort_direction' => $sortParams['sort_direction'],
                        'search' => $search
                    ]
                ],
                'Lấy danh sách sản phẩm theo danh mục con thành công'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Có lỗi xảy ra khi lấy danh sách sản phẩm: ' . $e->getMessage(), 500);
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
            ->where('is_active', true)
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