<?php

namespace App\Http\Controllers\Employees;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderController extends Controller
{
    public function index()
    {
        try {
            $orders = Order::orderBy('createdAt', 'desc')->get();
            return response()->json([
                'success' => true,
                'orders' => $orders
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            // Validate order data
            $this->validateOrder($request);
            
            // Check product quantities before creating order
            foreach ($request->items as $item) {
                $product = Product::find($item['productId']);
                if (!$product) {
                    throw new \Exception("Không tìm thấy sản phẩm với ID: {$item['productId']}");
                }
                
                if (!$product->hasEnoughQuantity($item['quantity'])) {
                    throw new \Exception("Sản phẩm {$product->name} chỉ còn {$product->quantity} trong kho");
                }
            }

            // Create order
            $order = new Order($request->all());
            $order->save();

            // Update product quantities
            foreach ($request->items as $item) {
                $product = Product::find($item['productId']);
                $product->updateQuantity($item['quantity']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn hàng thành công',
                'order' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo đơn hàng: ' . $e->getMessage()
            ], 400);
        }
    }

    private function validateOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'orderNumber' => 'required|string|unique:orders,orderNumber',
            'customerId' => 'required|string',
            'customerInfo' => 'required|array',
            'customerInfo.name' => 'required|string',
            'customerInfo.phone' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'totalAmount' => 'required|numeric|min:0',
            'finalTotal' => 'required|numeric|min:0',
            'paymentMethod' => 'required|string',
            'shippingMethod' => 'required|string',
            'staffId' => 'required|string',
            'staffInfo' => 'required|array',
            'staffInfo.name' => 'required|string'
        ]);

        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
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
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $order = Order::find($id);
            if (!$order) {
                throw new \Exception('Không tìm thấy đơn hàng');
            }

            // Validate update data
            $validator = Validator::make($request->all(), [
                'customerInfo' => 'required|array',
                'customerInfo.name' => 'required|string',
                'customerInfo.phone' => 'required|string',
                'customerInfo.address' => 'required|string',
                'items' => 'required|array|min:1',
                'items.*.productId' => 'required|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'totalAmount' => 'required|numeric|min:0',
                'finalTotal' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                throw new \Exception($validator->errors()->first());
            }

            // Update all fields
            $order->update([
                'customerInfo' => $request->customerInfo,
                'items' => $request->items,
                'totalAmount' => $request->totalAmount,
                'finalTotal' => $request->finalTotal,
                'status' => $request->status ?? $order->status,
                'paymentStatus' => $request->paymentStatus ?? $order->paymentStatus,
                'shippingStatus' => $request->shippingStatus ?? $order->shippingStatus,
                'note' => $request->note ?? $order->note,
                'updatedAt' => now()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật đơn hàng thành công',
                'order' => $order
            ], 200);
        } catch (Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật đơn hàng: ' . $e->getMessage(),
            ], 400);
        }
    }
} 