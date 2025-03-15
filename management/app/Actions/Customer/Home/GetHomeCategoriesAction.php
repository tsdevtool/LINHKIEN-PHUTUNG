<?php

namespace App\Actions\Customer\Home;

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
            
            return $this->successResponse($categories, 'Lấy danh sách thành công');
        } catch (\Exception $e) {
            return $this->errorResponse('Có lỗi xảy ra khi lấy thông tin danh mục' . $e->getMessage());
        }
    }

    private function getParentCategoriesWithProducts(){
        $result = Category::where('parent_id', null)
                ->with(['children.products'])
                ->get()
                ->map(function($parentCategory) {
                    $childProducts = $parentCategory->children->flatMap(function($child) {
                        return $child->products
                            ->filter(function($product) {
                                return $product->quantity > 0;
                            })
                            ->map(function($product) {
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
                    ->values();

                    return [
                        'id' => $parentCategory->_id,
                        'name' => $parentCategory->name,
                        'products' => $childProducts
                    ];
                });
            return $result;
    }

} 