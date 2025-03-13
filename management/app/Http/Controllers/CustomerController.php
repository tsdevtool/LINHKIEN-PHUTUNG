<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Exception;

class CustomerController extends Controller
{
    public function index()
    {
        try {
            $customers = Customer::all();
            return response()->json([
                'success' => true,
                'customers' => $customers
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            $query = $request->get('q', '');
            
            $customers = Customer::where('name', 'like', "%$query%")
                               ->orWhere('phone', 'like', "%$query%")
                               ->orWhere('email', 'like', "%$query%")
                               ->get();

            return response()->json([
                'success' => true,
                'customers' => $customers
            ], 200);
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
            $customer = Customer::find($id);

            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => "Không tìm thấy khách hàng"
                ], 404);
            }

            return response()->json([
                'success' => true,
                'customer' => $customer
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
            $customer = Customer::create([
                'name' => $request->name,
                'phone' => $request->phone,
                'email' => $request->email,
                'address' => $request->address,
                'numberOfOrders' => 0,
                'totalSpent' => 0,
                'status' => 'active',
                'createdAt' => now(),
                'updatedAt' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tạo khách hàng thành công',
                'customer' => $customer
            ], 201);
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
            $customer = Customer::find($id);

            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => "Không tìm thấy khách hàng"
                ], 404);
            }

            $customer->update([
                'name' => $request->name ?? $customer->name,
                'phone' => $request->phone ?? $customer->phone,
                'email' => $request->email ?? $customer->email,
                'address' => $request->address ?? $customer->address,
                'status' => $request->status ?? $customer->status,
                'updatedAt' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật khách hàng thành công',
                'customer' => $customer
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $customer = Customer::find($id);

            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => "Không tìm thấy khách hàng"
                ], 404);
            }

            $customer->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa khách hàng thành công'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], 500);
        }
    }
} 