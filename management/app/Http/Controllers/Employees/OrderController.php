<?php

namespace App\Http\Controllers\Employees;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\PayOSService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Exception;

class OrderController extends Controller
{
    public function index()
    {
        try {
            $orders = Order::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'orders' => $orders
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->all();

            // Validate
            $validator = Validator::make($data, [
                'customerId' => 'required|string',
                'customerInfo' => 'required|array',
                'items' => 'required|array|min:1',
                'totalAmount' => 'required|numeric',
                'finalTotal' => 'required|numeric',
                'paymentMethod' => 'required|string',
                'shippingMethod' => 'required|string',
                'staffId' => 'required|string',
                'staffInfo' => 'required|array'
            ]);

            if ($validator->fails()) {
                throw new Exception($validator->errors()->first());
            }

            // Tạo mã đơn hàng tự động
            $orderNumber = Order::generateOrderNumber(); // Viết hàm này trong Model

            // Kiểm tra tồn kho
            foreach ($data['items'] as $item) {
                $product = Product::find($item['productId']);
                if (!$product) {
                    throw new Exception("Không tìm thấy sản phẩm: {$item['productId']}");
                }
                if ($product->quantity < $item['quantity']) {
                    throw new Exception("Sản phẩm {$product->name} chỉ còn {$product->quantity} trong kho");
                }
            }

            // Lưu đơn hàng
            $order = Order::create([
                'order_number' => $orderNumber,
                'customerId' => $data['customerId'],
                'customerInfo' => $data['customerInfo'],
                'items' => $data['items'],
                'totalAmount' => $data['totalAmount'],
                'finalTotal' => $data['finalTotal'],
                'paymentMethod' => $data['paymentMethod'],
                'shippingMethod' => $data['shippingMethod'],
                'staffId' => $data['staffId'],
                'staffInfo' => $data['staffInfo'],
                'status' => 'pending'
            ]);

            // Trừ kho
            foreach ($data['items'] as $item) {
                Product::where('id', $item['productId'])
                    ->decrement('quantity', $item['quantity']);
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn hàng thành công',
                'order' => $order
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo đơn hàng: ' . $e->getMessage()
            ], 400);
        }
    }

    public function show($id)
    {
        try {
            $order = Order::find($id);
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'order' => $order
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            $order = Order::find($id);
            if (!$order) {
                throw new Exception('Không tìm thấy đơn hàng');
            }

            $order->update([
                'customerInfo' => $request->customerInfo,
                'items' => $request->items,
                'totalAmount' => $request->totalAmount,
                'finalTotal' => $request->finalTotal,
                'status' => $request->status ?? $order->status,
                'paymentStatus' => $request->paymentStatus ?? $order->paymentStatus,
                'shippingStatus' => $request->shippingStatus ?? $order->shippingStatus,
                'note' => $request->note ?? $order->note
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật đơn hàng thành công',
                'order' => $order
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật đơn hàng: ' . $e->getMessage()
            ], 400);
        }
    }

    public function cancel($id)
    {
        DB::beginTransaction();

        try {
            $order = Order::find($id);
            if (!$order) throw new Exception('Không tìm thấy đơn hàng');
            if ($order->status === 'cancelled') throw new Exception('Đơn hàng đã được huỷ');
            if (in_array($order->status, ['completed', 'shipping'])) {
                throw new Exception('Không thể huỷ đơn hàng ở trạng thái hiện tại');
            }

            foreach ($order->items as $item) {
                Product::where('id', $item['productId'])
                    ->increment('quantity', $item['quantity']);
            }

            $order->update(['status' => 'cancelled']);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Huỷ đơn hàng thành công',
                'order' => $order
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi huỷ đơn hàng: ' . $e->getMessage()
            ], 400);
        }
    }

    public function createPaymentLink($id)
    {
        try {
            $order = Order::find($id);
            if (!$order) throw new Exception('Không tìm thấy đơn hàng');
            if ($order->paymentStatus === 'paid') {
                throw new Exception('Đơn hàng đã thanh toán');
            }

            $payos = new PayOSService();
            $paymentResult = $payos->createPayment($order);

            $order->update([
                'paymentInfo' => [
                    'provider' => 'PayOS',
                    'paymentId' => $paymentResult['paymentLinkId'],
                    'status' => 'pending'
                ]
            ]);

            return response()->json([
                'success' => true,
                'paymentUrl' => $paymentResult['checkoutUrl'],
                'paymentId' => $paymentResult['paymentLinkId']
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo link thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        try {
            $signature = $request->header('x-payos-signature');
            $payload = $request->all();

            $payos = new PayOSService();
            if (!$payos->verifyWebhookSignature($payload, $signature)) {
                return response()->json(['success' => false, 'message' => 'Invalid signature'], 400);
            }

            $order = Order::where('order_number', $payload['orderReference'])->first();
            if (!$order) {
                return response()->json(['success' => false, 'message' => 'Order not found'], 404);
            }

            if ($payload['status'] === 'PAID') {
                $order->update([
                    'paymentStatus' => 'paid',
                    'paymentInfo' => [
                        'transactionId' => $payload['transactionId'],
                        'paidAt' => now(),
                        'amount' => $payload['amount'],
                        'paymentMethod' => 'PayOS'
                    ],
                    'status' => $order->shippingMethod === 'Nhận tại cửa hàng' ? 'completed' : 'confirmed'
                ]);
            }

            return response()->json(['success' => true]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
