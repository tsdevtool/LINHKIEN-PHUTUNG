<?php

namespace App\Http\Controllers\Customers;

use App\Actions\Cart\AddToCart;
use App\Actions\Cart\GetCart;
use App\Actions\Cart\RemoveFromCart;
use App\Actions\Cart\UpdateCartItemQuantity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Cart;
use Exception;

class CartController extends Controller
{
    private $getCart;
    private $addToCart;
    private $updateCartItemQuantity;
    private $removeFromCart;
    public function __construct(GetCart $getCart, AddToCart $addToCart, UpdateCartItemQuantity $updateCartItemQuantity, RemoveFromCart $removeFromCart){
        $this->getCart = $getCart;
        $this->addToCart = $addToCart;
        $this->updateCartItemQuantity = $updateCartItemQuantity;
        $this->removeFromCart = $removeFromCart;
    }

    public function index(Request $request): JsonResponse
    {
        return $this->getCart->execute($request);
    }

    public function store(Request $request):JsonResponse{
        return $this->addToCart->execute($request);
    }

    public function update(Request $request):JsonResponse{
        return $this->updateCartItemQuantity->execute($request);
    }

    public function destroy(): JsonResponse{
        return $this->removeFromCart->execute();
    }

}
