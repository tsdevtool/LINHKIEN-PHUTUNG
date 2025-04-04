<?php

namespace App\Http\Controllers\Customers;

use App\Actions\Customer\Order\CreateOrderFromCart;
use App\Actions\Customer\Order\CancelOrder;
use App\Actions\Customer\Order\GetAllOrder;
use App\Actions\Customer\Order\GetOrderDetail;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CreateOrderFromCartRequest;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    private $createOrderFromCart;
    private $cancelOrder;
    private $getAllOrder;
    private $getOrderDetail;

    public function __construct(
        CreateOrderFromCart $createOrderFromCart,
        CancelOrder $cancelOrder,
        GetAllOrder $getAllOrder,
        GetOrderDetail $getOrderDetail
    ) {
        $this->createOrderFromCart = $createOrderFromCart;
        $this->cancelOrder = $cancelOrder;
        $this->getAllOrder = $getAllOrder;
        $this->getOrderDetail = $getOrderDetail;
    }

    /**
     * Lấy danh sách đơn hàng của người dùng hiện tại
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return $this->getAllOrder->execute();
    }

    /**
     * Lấy chi tiết đơn hàng
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        return $this->getOrderDetail->execute($id);
    }

    /**
     * Tạo đơn hàng mới từ giỏ hàng
     *
     * @param CreateOrderFromCartRequest $request
     * @return JsonResponse
     */
    public function createFromCart(CreateOrderFromCartRequest $request): JsonResponse
    {
        return $this->createOrderFromCart->execute($request);
    }

    /**
     * Hủy đơn hàng
     *
     * @param string $id
     * @return JsonResponse
     */
    public function cancel(string $id): JsonResponse
    {
        return $this->cancelOrder->execute($id);
    }

    
} 