<?php

namespace App\Actions\Cart;

use App\Actions\Notification\ErrorResponse;
use App\Actions\Notification\SuccessResponse;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;


class UpdateCartItemQuantity
{
    private $errorResponse, $successResponse;

    public function __construct(ErrorResponse $errorResponse, SuccessResponse $successResponse)
    {
        $this->errorResponse = $errorResponse;
        $this->successResponse = $successResponse;
    }

    public function execute(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'cart_item_id' => 'required|string|exists:cart_items,_id',
                'quantity' => 'required|integer'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse->execute('Lỗi: ' . $validator->errors()->first(), 422);
            }

            $user = Auth::user();
            if (!$user) {
                return $this->errorResponse->execute('Yêu cầu đăng nhập', 401);
            }

            $cartItem = CartItem::with('cart')->find($request->cart_item_id);
            
            if (!$cartItem) {
                return $this->errorResponse->execute('Không tìm thấy sản phẩm trong giỏ hàng', 404);
            }

            if ($cartItem->cart->user_id !== $user->_id) {
                return $this->errorResponse->execute('Không có quyền thực hiện thao tác này', 403);
            }

            if (!$cartItem->cart->isPending()) {
                return $this->errorResponse->execute('Không thể cập nhật giỏ hàng ở trạng thái này', 400);
            }

            $product = Product::find($cartItem->product_id);
            if (!$product || !$product->is_active) {
                return $this->errorResponse->execute('Sản phẩm không khả dụng', 400);
            }

            $cartItem->quantity += $request->quantity;
            if ($cartItem->quantity > $product->quantity) {
                return $this->errorResponse->execute('Số lượng sản phẩm trong kho không đủ', 400);
            }
            if ($cartItem->quantity <= 0) {
                $cartItem->delete();

                $cart = $cartItem->cart;
                $cart->total_price = $cart->items->sum('total_price');
                $cart->save();
                
                return $this->successResponse->execute([
                    'status' => 200,
                    'message' => 'Đã xóa sản phẩm khỏi giỏ hàng',
                    'data' => [
                        'cart' => $cart->load('items.product')
                    ]
                ], 200);
            }
            $cartItem->save();

            return $this->successResponse->execute(
                $cartItem, 'Cập nhật số lượng sản phẩm thành công'
            );
        } catch (\Exception $e) {
            return $this->errorResponse->execute('Lỗi cập nhật số lượng sản phẩm: ' . $e->getMessage(), 500);
        }
    }
}