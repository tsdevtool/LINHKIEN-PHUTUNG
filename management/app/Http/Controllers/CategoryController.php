<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    // Lấy danh sách tất cả danh mục
    public function index()
    {
        $categories = Category::all();
        return response()->json(['status' => 200, 'categories' => $categories]);
    }

    // Lấy thông tin một danh mục cụ thể
    public function show($id)
    {
        $category = Category::find($id);
        
        if (!$category) {
            return response()->json(['status' => 404, 'message' => 'Category not found'], 404);
        }

        return response()->json(['status' => 200, 'category' => $category]);
    }

    // Thêm danh mục mới
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'categories' => 'nullable|array',
            'suppliers_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'message' => $validator->messages(),
            ], 200);
        }

        $category = Category::create($request->all());

        return response()->json(['status' => 201, 'message' => 'Category created', 'category' => $category], 201);
    }

    // Cập nhật danh mục
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        
        if (!$category) {
            return response()->json(['status' => 404, 'message' => 'Category not found'], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'categories' => 'nullable|array',
            'suppliers_id' => 'sometimes|string',
        ]);

        $category->update($request->all());

        return response()->json(['status' => 200, 'message' => 'Category updated', 'category' => $category]);
    }

    // Xóa danh mục
    public function destroy($id)
    {
        $category = Category::find($id);
        
        if (!$category) {
            return response()->json(['status' => 404, 'message' => 'Category not found'], 404);
        }

        $category->delete();
        return response()->json(['status' => 200, 'message' => 'Category deleted']);
    }
}
