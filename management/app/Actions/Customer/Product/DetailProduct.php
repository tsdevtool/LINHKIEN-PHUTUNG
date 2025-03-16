<?php

namespace App\Actions\Customer\Product;

use App\Http\Requests\Product\DetailProductRequest;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DetailProduct
{
    use ApiResponse;

    /**
     * Execute the action
     *
     * @param DetailProductRequest $request
     * @return JsonResponse
     */
    public function execute(DetailProductRequest $request): JsonResponse
    {
        try {
            $product = $this->findAndValidateProduct($request->id);
            if (!$product) {
                return $this->errorResponse('Không tìm thấy sản phẩm');
            }

            return $this->successResponse(
                'Lấy thông tin sản phẩm thành công',
                $this->formatProductResponse($product)
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Có lỗi xảy ra khi lấy thông tin sản phẩm', $e);
        }
    }

    /**
     * Find and validate product
     *
     * @param string $id
     * @return Product|null
     */
    private function findAndValidateProduct(string $id): ?Product
    {
        return Product::with(['category'])
            ->where('_id', $id)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Format product response
     *
     * @param Product $product
     * @return array
     */
    private function formatProductResponse(Product $product): array
    {
        return [
            'id' => $product->_id,
            'name' => $product->name,
            'price' => $product->price,
            'quantity' => $product->quantity,
            'description' => $product->description,
            'image_url' => $product->image_url,
            'additional_images' => $product->additional_images,
            'category' => [
                'id' => $product->category->_id,
                'name' => $product->category->name
            ],
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at
        ];
    }
} 