<?php

namespace App\Actions\Employee\Order;

use App\Models\Order;
use App\Enums\OrderType;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\OrderStatus;
use App\Http\Requests\Order\CreateEmployeeOrderFromCartRequest;
use App\Traits\Order\ManagesOrderItems;
use App\Traits\Order\GeneratesOrderResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class CreateOrderFromCart
{
    use ManagesOrderItems, GeneratesOrderResponse;

    public function execute(CreateEmployeeOrderFromCartRequest $request): JsonResponse
    {
        try {
            // Get and validate cart items
            $cartItems = $this->getCartItems($request->cart_item_ids);
            
            // Calculate order details
            $orderDetails = $this->calculateOrderItems($cartItems);

            // Create order
            $order = Order::create([
                'recipient_name' => $request->recipient_name,
                'recipient_phone' => $request->recipient_phone,
                'recipient_address' => $request->recipient_address,
                'payment_type' => $request->payment_type,
                'payment_status' => $request->payment_type === PaymentType::CASH->value ? PaymentStatus::PAID : PaymentStatus::UNPAID,
                'order_method' => $request->order_method,
                'order_type' => OrderType::STORE,
                'status' => OrderStatus::PENDING,
                'user_id' => $request->user_id,
                'employee_id' => Auth::id(),
                'total' => $orderDetails['total'],
                'discount' => $request->discount ?? 0,
                'items' => $orderDetails['items']
            ]);

            // Remove cart items
            $this->removeCartItems($request->cart_item_ids);

            return $this->generateSuccessResponse($order, 'Tạo đơn hàng thành công');

        } catch (\Exception $e) {
            return $this->generateErrorResponse('Lỗi khi tạo đơn hàng: ' . $e->getMessage());
        }
    }
} 