<?php

namespace App\Http\Controllers\Customers;

use App\Actions\Customer\Cart\AddToCart;
use App\Actions\Customer\Cart\GetCart;
use App\Actions\Customer\Cart\RemoveFromCart;
use App\Actions\Customer\Cart\UpdateCartItemQuantity;
use App\Http\Requests\Cart\GetCartRequest;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartItemQuantityRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class CartController extends Controller
{
    private $getCart;
    private $addToCart;
    private $updateCartItemQuantity;
    private $removeFromCart;

    public function __construct(
        GetCart $getCart,
        AddToCart $addToCart,
        UpdateCartItemQuantity $updateCartItemQuantity,
        RemoveFromCart $removeFromCart
    ){
        $this->getCart = $getCart;
        $this->addToCart = $addToCart;
        $this->updateCartItemQuantity = $updateCartItemQuantity;
        $this->removeFromCart = $removeFromCart;
    }

    /**
     * Lấy thông tin giỏ hàng của người dùng hiện tại
     *
     * @param GetCartRequest $request
     * @return JsonResponse
     */
    public function index(GetCartRequest $request): JsonResponse
    {
        return $this->getCart->execute($request);
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     *
     * @param AddToCartRequest $request
     * @return JsonResponse
     */
    public function store(AddToCartRequest $request): JsonResponse
    {
        return $this->addToCart->execute($request);
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     *
     * @param UpdateCartItemQuantityRequest $request
     * @return JsonResponse
     */
    public function update(UpdateCartItemQuantityRequest $request): JsonResponse
    {
        return $this->updateCartItemQuantity->execute($request);
    }

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     *
     * @return JsonResponse
     */
    public function destroy(): JsonResponse
    {
        return $this->removeFromCart->execute();
    }
}
