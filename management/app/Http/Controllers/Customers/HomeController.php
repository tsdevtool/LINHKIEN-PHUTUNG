<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class HomeController extends Controller
{
    /**
     * Lấy danh sách category cha và tối đa 6 sản phẩm từ các category con
     *
     * @return JsonResponse
     */
    public function getHomeCategories(): JsonResponse
    {
        try {
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
            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách thành công',
                'data' => $result
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi lấy thông tin danh mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 