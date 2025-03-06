<?php

namespace App\Http\Controllers;

use App\Models\Product;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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
    // public function store(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'name' => 'required|string|max:255',
    //         'description' => 'required|string',
    //         'quantity' => 'required|integer|min:0',
    //         'price' => 'required|numeric|min:0',
    //         'category_id' => 'required|string',
    //         'manufactured_at' => 'nullable|date',
    //         'expires_at' => 'nullable|date|after_or_equal:manufactured_at',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'status' => 422,
    //             'message' => $validator->messages(),
    //         ], 200);
    //     }

    //     $product = Product::create($request->all());

    //     return response()->json(['status' => 201, 'message' => 'Product created', 'product' => $product], 201);
    // }
    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|string',
            'manufactured_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:manufactured_at',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Kiểm tra file ảnh
        ]);

        
    
        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'message' => $validator->messages(),
            ], 422);
        }
    
        // Upload ảnh lên Cloudinary nếu có ảnh
        // $imageUrl = null;
        // if ($request->hasFile('image_url')) {
        //     $file = $request->file('image_url');
        //     // $uploadedFile = Cloudinary::upload($request->file('image')->getRealPath())->getSecurePath();
        //     // $imageUrl = $uploadedFile;$file = $request->file('avatar');
            

        //     $path = $file->store('products', 'public');

        // // Lấy URL công khai của ảnh
        //     $imageUrl = Storage::url($path);
            

        // }
      

    
        // Tạo sản phẩm với ảnh đã upload
        // $product = Product::create([
        //     'name' => $request->name,
        //     'description' => $request->description,
        //     'quantity' => $request->quantity,
        //     'price' => $request->price,
        //     'category_id' => $request->category_id,
        //     'manufactured_at' => $request->manufactured_at,
        //     'expires_at' => $request->expires_at,
        //     'image_url' => $imageUrl, // Lưu link ảnh vào database
        // ]);
        $product = new Product();
        $product->name = $request->name;
        $product->description = $request->description;
        $product->quantity = $request->quantity;
        $product->price = $request->price;
        $product->category_id = $request->category_id;
        $product->manufactured_at = $request->manufactured_at;
        $product->expires_at = $request->expires_at;
        if ($request->hasFile('image_url')) {
            $file = $request->file('image_url');
            // $uploadedFile = Cloudinary::upload($request->file('image')->getRealPath())->getSecurePath();
            // $imageUrl = $uploadedFile;$file = $request->file('avatar');
            
            $path = $file->store('images', 'public');
        // Lấy URL công khai của ảnh
            $product->image_url = Storage::url($path);
        }
        $product->save();

    
        return response()->json([
            'status' => 201,
            'message' => 'Product created successfully',
            'product' => $product
        ], 201);
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
