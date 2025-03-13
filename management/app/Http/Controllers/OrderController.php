<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use Illuminate\Http\Request;
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
            // Validate đầu vào
            if (!$request->customerId || empty($request->items)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thiếu thông tin khách hàng hoặc sản phẩm'
                ], 400);
            }

            // Lấy thông tin khách hàng
            $customer = Customer::find($request->customerId);
            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy khách hàng'
                ], 404);
            }

            // Tạo mã đơn hàng
            $orderNumber = 'DH' . date('ymd') . str_pad(Order::count() + 1, 4, '0', STR_PAD_LEFT);

            // Tính tổng tiền
            $totalAmount = 0;
            foreach ($request->items as $item) {
                $totalAmount += $item['price'] * $item['quantity'];
            }

            // Tạo đơn hàng
            $order = Order::create([
                'orderNumber' => $orderNumber,
                'customerId' => $request->customerId,
                'customerInfo' => [
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'address' => $customer->address
                ],
                'items' => $request->items,
                'totalAmount' => $totalAmount,
                'discount' => $request->discount ?? 0,
                'shippingFee' => $request->shippingFee ?? 0,
                'finalTotal' => $totalAmount - ($request->discount ?? 0) + ($request->shippingFee ?? 0),
                'paymentMethod' => $request->paymentMethod,
                'paymentStatus' => $request->paymentStatus ?? 'pending',
                'shippingMethod' => $request->shippingMethod,
                'shippingStatus' => $request->shippingStatus ?? 'pending',
                'note' => $request->note,
                'status' => $request->status ?? 'pending',
                'staffId' => $request->staffId,
                'staffInfo' => $request->staffInfo ?? [
                    'name' => null,
                    'role' => 'employee'
                ],
                'createdAt' => now(),
                'updatedAt' => now()
            ]);

            // Cập nhật thông tin khách hàng
            $customer->update([
                'numberOfOrders' => $customer->numberOfOrders + 1,
                'totalSpent' => $customer->totalSpent + $order->finalTotal
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn hàng thành công',
                'order' => $order
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
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
            $order = Order::find($id);
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            $order->update([
                'status' => $request->status ?? $order->status,
                'paymentStatus' => $request->paymentStatus ?? $order->paymentStatus,
                'shippingStatus' => $request->shippingStatus ?? $order->shippingStatus,
                'note' => $request->note ?? $order->note,
                'updatedAt' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật đơn hàng thành công',
                'order' => $order
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }
} 