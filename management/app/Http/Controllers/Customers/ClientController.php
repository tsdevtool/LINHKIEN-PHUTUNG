<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\DetailProductRequest;
use App\Http\Requests\Product\ListProductInChildCategoryRequest;
use App\Actions\Customer\Product\DetailProduct;
use App\Actions\Customer\Product\ListProductInChildCategory;
use Illuminate\Http\JsonResponse;

class ClientController extends Controller
{
    private $detailProduct;
    private $listProductInChildCategory;
    
    public function __construct(
        DetailProduct $detailProduct,
        ListProductInChildCategory $listProductInChildCategory
    ){
        $this->detailProduct = $detailProduct;
        $this->listProductInChildCategory = $listProductInChildCategory;
    }

    /**
     * Xem thông tin chi tiết sản phẩm
     *
     * @param DetailProductRequest $request
     * @return JsonResponse
     */
    public function showDetailProduct(DetailProductRequest $request): JsonResponse
    {
        return $this->detailProduct->execute($request);
    }

    /**
     * Xem danh sách sản phẩm theo danh mục con
     *
     * @param ListProductInChildCategoryRequest $request
     * @return JsonResponse
     */
    public function showListProductFollowChildCategory(ListProductInChildCategoryRequest $request): JsonResponse
    {
        return $this->listProductInChildCategory->execute($request);
    }
}
