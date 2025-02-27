<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    // Lấy danh sách tất cả sản phẩm
    public function index()
    {
        $products = Product::all();
        return response()->json(['status' => 200, 'products' => $products]);
    }

    // Lấy thông tin một sản phẩm cụ thể
    public function show($id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json(['status' => 404, 'message' => 'Product not found'], 404);
        }

        return response()->json(['status' => 200, 'product' => $product]);
    }

    // Thêm sản phẩm mới
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|string',
            'manufactured_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:manufactured_at',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'message' => $validator->messages(),
            ], 200);
        }

        $product = Product::create($request->all());

        return response()->json(['status' => 201, 'message' => 'Product created', 'product' => $product], 201);
    }

    // Cập nhật sản phẩm
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json(['status' => 404, 'message' => 'Product not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'quantity' => 'sometimes|integer|min:0',
            'price' => 'sometimes|numeric|min:0',
            'category_id' => 'sometimes|string',
            'manufactured_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:manufactured_at',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'message' => $validator->messages(),
            ], 200);
        }

        $product->update($request->all());

        return response()->json(['status' => 200, 'message' => 'Product updated', 'product' => $product]);
    }

    // Xóa sản phẩm
    public function destroy($id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json(['status' => 404, 'message' => 'Product not found'], 404);
        }

        $product->delete();
        return response()->json(['status' => 200, 'message' => 'Product deleted']);
    }
}
