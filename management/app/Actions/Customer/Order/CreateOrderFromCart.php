<?php

namespace App\Actions\Customer\Order;

use App\Models\Order;
use App\Models\Cart;
use App\Models\Product;
use App\Models\CartItem;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\OrderMethod;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class CreateOrderFromCart
{
    use ApiResponse;

    /**
     * Execute the action to create an order from cart items
     * 
     * @param array $data Cart item IDs and order information
     * @return JsonResponse
     */
    public function execute($data): JsonResponse
    {
        try {
            // Lấy các cart items được chọn
            $cartItems = CartItem::whereIn('_id', $data['cart_item_ids'])->get();
            if ($cartItems->isEmpty()) {
                return $this->errorResponse('Không tìm thấy sản phẩm trong giỏ hàng');
            }

            // Chuyển đổi cart items thành order items
            $orderItems = [];
            $totalAmount = 0;
            foreach ($cartItems as $item) {
                $product = Product::find($item->product_id);
                if (!$product) {
                    throw new \Exception("Không tìm thấy sản phẩm");
                }
                
                if ($product->quantity < $item->quantity) {
                    throw new \Exception("Sản phẩm {$product->name} chỉ còn {$product->quantity} trong kho");
                }
                
                $itemTotal = $product->price * $item->quantity;
                $totalAmount += $itemTotal;
                
                $orderItems[] = [
                    'product_id' => (string)$product->_id,
                    'quantity' => (int)$item->quantity,
                    'price' => (float)$product->price,
                    'total' => (float)$itemTotal
                ];
            }

            // Lấy label của order method
            $orderMethod = OrderMethod::from($data['order_method']);
            
            // Tạo đơn hàng với items là mảng
            $order = new Order();
            $order->customer_id = Auth::id();
            $order->customer_info = [
                'name' => $data['recipient_name'],
                'phone' => $data['recipient_phone'],
                'address' => $data['recipient_address']
            ];
            $order->items = $orderItems;
            $order->total_amount = $totalAmount;
            $order->discount = (int)($data['discount'] ?? 0);
            $order->shipping_fee = 0;
            $order->finaltotal = $totalAmount - $order->discount + $order->shipping_fee;
            $order->payment_method = $data['payment_type'];
            $order->payment_status = PaymentStatus::UNPAID;
            $order->shipping_method = $orderMethod->label();
            $order->shipping_status = 'pending';
            $order->status = OrderStatus::PENDING;
            $order->note = $data['note'] ?? null;
            $order->confirmed_at = null;
            $order->shipping_updated_at = null;
            $order->delivered_at = null;
            $order->cancelled_at = null;
            $order->save();

            // Cập nhật số lượng sản phẩm
            foreach ($orderItems as $item) {
                Product::where('_id', $item['product_id'])
                    ->decrement('quantity', $item['quantity']);
            }

            // Xóa các cart items đã được đặt hàng
            CartItem::whereIn('_id', $data['cart_item_ids'])->delete();

            return $this->successResponse([
                'order_id' => $order->_id,
                'message' => 'Đặt hàng thành công'
            ]);

        } catch (\Exception $e) {
            return $this->errorResponse('Lỗi khi tạo đơn hàng: ' . $e->getMessage());
        }
    }
} 