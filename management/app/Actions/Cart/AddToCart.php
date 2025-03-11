<?php

namespace App\Actions\Cart;

use App\Actions\Notification\ErrorResponse;
use App\Actions\Notification\SuccessResponse;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AddToCart
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
                'product_id' => 'required|string|exists:products,_id',
                'quantity' => 'required|integer|min:1'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse->execute('Lỗi:' . $validator->errors()->first(), 422);
            }

            $user = Auth::user();
            if (!$user) {
                return $this->errorResponse->execute('Người dùng chưa đăng nhập', 401);
            }

            $product = Product::find($request->product_id);
            if (!$product) {
                return $this->errorResponse->execute('Không tìm thấy sản phẩm', 404);
            }

            if ($product->quantity < $request->quantity) {
                return $this->errorResponse->execute('Số lượng sản phẩm trong kho không đủ', 400);
            }

            $cart = Cart::firstOrCreate([
                'user_id' => $user->_id,
                'status' => Cart::STATUS_PENDING
            ]);
            
            $cartItem = $cart->items()->where('product_id', $product->_id)->first();

            if ($cartItem) {
                // Update quantity if product exists
                if (($cartItem->quantity + $request->quantity) > $product->quantity) {
                    return $this->errorResponse->execute('Số lượng sản phẩm trong kho không đủ', 400);
                }
                $cartItem->quantity += $request->quantity;
                $cartItem->save();
            } else {
                // Add new cart item if product not in cart
                $cart->items()->create([
                    'product_id' => $product->_id,
                    'quantity' => $request->quantity,
                    'price' => $product->price
                ]);
            }

            $cart->total_price = $cart->items->sum('total_price');
            $cart->save();

            return $this->successResponse->execute([
                'status' => 200,
                'message' => 'Đã thêm sản phẩm vào giỏ hàng',
                'data' => [
                    'cart' => $cart->load('items.product'),
                    'user' => [
                        'id' => $user->_id,
                        'name' => $user->name,
                        'email' => $user->email
                    ]
                ]
            ], 200);
            
        } catch (\Throwable $th) {
            return $this->errorResponse->execute('Lỗi thêm sản phẩm vào giỏ hàng: ' . $th->getMessage(), 500);
        }
    }
}