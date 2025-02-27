<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    // Lấy danh sách tất cả nhà cung cấp
    public function index()
    {
        $suppliers = Supplier::all();
        return response()->json(['status' => 200, 'suppliers' => $suppliers],200);
    }

    // Lấy thông tin một nhà cung cấp cụ thể
    public function show($id)
    {
        $supplier = Supplier::find($id);
        
        if (!$supplier) {
            return response()->json(['status' => 404, 'message' => 'Supplier not found'], 404);
        }

        return response()->json(['status' => 200, 'supplier' => $supplier],200);
    }

    // Thêm nhà cung cấp mới
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'required|string|max:255',
            'is_play' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'message' => $validator->messages(),
            ], 200);
        }

        
        $supplier = Supplier::create($request->all());

        return response()->json(['status' => 201, 'message' => 'Supplier created', 'supplier' => $supplier], 201);
    }

    // Cập nhật thông tin nhà cung cấp
    public function update(Request $request, $id)
    {
        $supplier = Supplier::find($id);
        
        if (!$supplier) {
            return response()->json(['status' => 404, 'message' => 'Supplier not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'sometimes|string|max:255',
            'is_play' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'message' => $validator->messages(),
            ], 200);
        }

        $supplier->update($request->all());

        return response()->json(['status' => 200, 'message' => 'Supplier updated', 'supplier' => $supplier]);
    }

    // Xóa nhà cung cấp
    public function destroy($id)
    {
        $supplier = Supplier::find($id);
        
        if (!$supplier) {
            return response()->json(['status' => 404, 'message' => 'Supplier not found'], 404);
        }

        $supplier->delete();
        return response()->json(['status' => 200, 'message' => 'Supplier deleted']);
    }
}
