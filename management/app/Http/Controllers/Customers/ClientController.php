<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\DetailProductRequest;
use App\Http\Requests\Product\ListProductInCategoryRequest;
use App\Http\Requests\Product\ListProductInChildCategoryRequest;
use App\Actions\Customer\Product\DetailProduct;
use App\Actions\Customer\Product\ListProductInCategory;
use App\Actions\Customer\Product\ListProductInChildCategory;
use App\Actions\Customer\Product\SearchProduct;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClientController extends Controller
{
    private $detailProduct;
    private $listProductInChildCategory;
    private $listProductInCategory;
    private $searchProduct;
    
    public function __construct(
        DetailProduct $detailProduct,
        ListProductInChildCategory $listProductInChildCategory,
        ListProductInCategory $listProductInCategory,
        SearchProduct $searchProduct
        ){
        $this->detailProduct = $detailProduct;
        $this->listProductInChildCategory = $listProductInChildCategory;
        $this->listProductInCategory = $listProductInCategory;
        $this->searchProduct = $searchProduct;
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

    /**
     * Xem danh sách sản phẩm theo danh mục cha
     *
     * @param ListProductInCategoryRequest $request
     * @return JsonResponse
     */
   public function showListProductFollowCategory(ListProductInCategoryRequest $request): JsonResponse
   {
    return $this->listProductInCategory->execute($request);
   }

   /**
    * Tìm kiếm sản phẩm theo tên
    *
    * @param Request $request
    * @return JsonResponse
    */
   public function searchProducts(Request $request): JsonResponse
   {
    return $this->searchProduct->execute($request);
   }
}
