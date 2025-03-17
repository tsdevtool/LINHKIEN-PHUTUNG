<?php

namespace App\Http\Controllers\Customers;

use App\Actions\Customer\Order\CreateOrderFromCart;
use App\Actions\Customer\Order\CancelOrder;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Cart;
use App\Models\CartItem;
use App\Enums\OrderMethod;
use App\Enums\OrderType;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\OrderStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Exception;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    private $createOrderFromCart;
    private $cancelOrder;

    public function __construct(
        CreateOrderFromCart $createOrderFromCart,
        CancelOrder $cancelOrder
    ) {
        $this->createOrderFromCart = $createOrderFromCart;
        $this->cancelOrder = $cancelOrder;
    }

    public function createFromCart(Request $request): JsonResponse
    {
        return $this->createOrderFromCart->execute($request);
    }

    public function cancel(string $id): JsonResponse
    {
        return $this->cancelOrder->execute($id);
    }
} 