<?php

namespace App\Actions\Customer\Order;

use App\Models\Order;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class GetOrderDetail
{
    use ApiResponse;

    /**
     * Execute the action to get detailed information about a specific order
     *
     * @param string $id Order ID
     * @return JsonResponse
     */
    public function execute(string $id): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return $this->errorResponse('Người dùng chưa đăng nhập', 401);
            }

            $order = Order::where('_id', $id)
                ->where('user_id', $userId)
                ->first();

            if (!$order) {
                return $this->errorResponse('Không tìm thấy đơn hàng', 404);
            }

            // Get detailed product information for each item
            $items = [];
            foreach ($order->items as $item) {
                $product = Product::find($item['product_id']);
                $items[] = [
                    'product_id' => $item['product_id'],
                    'product_name' => $product ? $product->name : 'Sản phẩm không xác định',
                    'product_image' => $product ? $product->image : null,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['quantity'] * $item['price']
                ];
            }

            // Format the order details
            $orderDetail = [
                'id' => $order->_id,
                'order_number' => $order->order_number,
                'created_at' => $order->created_at->format('d/m/Y H:i:s'),
                'status' => [
                    'value' => $order->status->value,
                    'label' => $order->status->label()
                ],
                'payment' => [
                    'type' => $order->payment_type->label(),
                    'status' => $order->payment_status->label()
                ],
                'delivery' => [
                    'method' => $order->order_method->label(),
                    'recipient_name' => $order->recipient_name,
                    'recipient_phone' => $order->recipient_phone,
                    'recipient_address' => $order->recipient_address
                ],
                'items' => $items,
                'summary' => [
                    'subtotal' => $order->total,
                    'discount' => $order->discount,
                    'shipping_fee' => $order->shipping_fee,
                    'final_total' => $order->final_total
                ],
                'can_cancel' => $order->canCancel()
            ];

            return $this->successResponse($orderDetail, 'Lấy thông tin đơn hàng thành công');
        } catch (\Exception $e) {
            return $this->errorResponse('Lỗi khi lấy thông tin đơn hàng: ' . $e->getMessage());
        }
    }
} 