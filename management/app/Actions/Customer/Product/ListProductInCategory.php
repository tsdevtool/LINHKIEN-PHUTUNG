<?php

namespace App\Actions\Customer\Product;


use App\Http\Requests\Product\ListProductInCategoryRequest;
use App\Traits\ApiResponse;
use App\Traits\CategoryTrait;
use Illuminate\Http\JsonResponse;

class ListProductInCategory
{
    use ApiResponse;
    use CategoryTrait;
    public function execute(ListProductInCategoryRequest $request): JsonResponse
    {
        $category = $this->checkCategoryIsExist($request->category_id);
        $products = $category->products;
        return $this->successResponse($products,"Lấy danh sách sản phẩm theo danh mục cha thành công");
    }


}