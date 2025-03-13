<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Exception;

class CategoryController extends Controller
{
    private array $rules = [
        'name' => 'required|string|max:255',
        'parent_id' => 'nullable|string|exists:categories,_id',
    ];

    /**
     * Lấy tất cả categories dạng cây (có phân cấp)
     */
    public function index(): JsonResponse
    {
        try {
            $categories = Category::active()
                ->where('level', 0)
                ->with(['children' => function($query) {
                    $query->active();
                }])
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->_id,
                        'name' => $category->name,
                        'categories' => $category->children->map(function ($child) {
                            return [
                                'id' => $child->_id,
                                'name' => $child->name,
                                'parent' => [
                                    'id' => $child->parent_id,
                                    'name' => $child->parent_name
                                ]
                            ];
                        })
                    ];
                });

            return response()->json([
                'status' => 200,
                'categories' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching categories: ' . $e->getMessage());
            return $this->errorResponse('Error fetching categories', 500);
        }
    }

    /**
     * Lấy chi tiết một category và sản phẩm của nó
     */
    public function show(string $id): JsonResponse
    {
        try {
            $category = Category::active()
                ->with(['children' => function($query) {
                    $query->active()->with('products');
                }])
                ->with('products')
                ->find($id);

            if (!$category) {
                return $this->errorResponse('Category not found', 404);
            }

            $response = [
                'id' => $category->_id,
                'name' => $category->name
            ];

            if ($category->parent_id) {
                $response['parent'] = [
                    'id' => $category->parent_id,
                    'name' => $category->parent_name
                ];
            }

            if ($category->children->count() > 0) {
                $response['categories'] = $category->children->map(function ($child) {
                    return [
                        'id' => $child->_id,
                        'name' => $child->name,
                        'parent' => [
                            'id' => $child->parent_id,
                            'name' => $child->parent_name
                        ],
                        'products' => $child->products
                    ];
                });
            }

            $response['products'] = $category->products;

            return response()->json([
                'status' => 200,
                'category' => $response
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching category: ' . $e->getMessage());
            return $this->errorResponse('Error fetching category', 500);
        }
    }

    /**
     * Tạo category mới
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->rules);

        if ($validator->fails()) {
            return $this->errorResponse($validator->messages(), 422);
        }

        try {
            $category = Category::create([
                'name' => $request->name,
                'parent_id' => $request->parent_id,
                'is_active' => true
            ]);

            return response()->json([
                'status' => 201,
                'message' => 'Category created successfully',
                'category' => $category
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating category: ' . $e->getMessage());
            return $this->errorResponse('Error creating category', 500);
        }
    }

    /**
     * Cập nhật category
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $category = Category::active()->find($id);
            
            if (!$category) {
                return $this->errorResponse('Category not found', 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'nullable|string|max:255',
                'parent_id' => 'nullable|string|exists:categories,_id',
                'order' => 'nullable|integer|min:0'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->messages(), 422);
            }

            if ($request->has('parent_id') && $request->parent_id !== $category->parent_id) {
                $category->moveTo($request->parent_id);
            }

            $category->fill($request->only(['name', 'order']));
            $category->save();

            return response()->json([
                'status' => 200,
                'message' => 'Category updated successfully',
                'category' => $category
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating category: ' . $e->getMessage());
            return $this->errorResponse('Error updating category', 500);
        }
    }

    /**
     * Xóa category
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $category = Category::with(['children', 'products'])->find($id);
            
            if (!$category) {
                return $this->errorResponse('Category not found', 404);
            }

            if ($category->children->count() > 0 || $category->products->count() > 0) {
                return $this->errorResponse('Cannot delete category with subcategories or products', 422);
            }

            $category->delete();

            return response()->json([
                'status' => 200,
                'message' => 'Category deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting category: ' . $e->getMessage());
            return $this->errorResponse('Error deleting category', 500);
        }
    }

    /**
     * Lấy danh sách category đã xoá
     */
    public function getTrashedCategories(): JsonResponse
    {
        try {
            $trashedCategories = Category::onlyTrashed()->get();

            return response()->json([
                'status' => 200,
                'message' => 'Trashed categories retrieved successfully',
                'categories' => $trashedCategories
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting trashed categories: ' . $e->getMessage());
            return $this->errorResponse('Error getting trashed categories', 500);
        }
    }

    /**
     * Khôi phục một category đã xoá
     */
    public function restore(string $id): JsonResponse
    {
        try {
            $category = Category::onlyTrashed()->find($id);

            if (!$category) {
                return $this->errorResponse('Category not found in trash', 404);
            }

            $category->restore();

            return response()->json([
                'status' => 200,
                'message' => 'Category restored successfully',
                'category' => $category
            ]);
        } catch (\Exception $e) {
            Log::error('Error restoring category: ' . $e->getMessage());
            return $this->errorResponse('Error restoring category', 500);
        }
    }
    
    /**
     * Xoá vĩnh viễn một category
     */
    public function forceDelete(string $id): JsonResponse
    {
        try {
            $category = Category::onlyTrashed()->find($id);

            if (!$category) {
                return $this->errorResponse('Category not found in trash', 404);
            }

            // Xoá vĩnh viễn category
            $category->forceDelete();

            return response()->json([
                'status' => 200,
                'message' => 'Category permanently deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error permanently deleting category: ' . $e->getMessage());
            return $this->errorResponse('Error permanently deleting category', 500);
        }
    }

    /**
     * Move category to new position
     */
    public function moveCategory(Request $request, string $id): JsonResponse
    {
        try {
            $category = Category::find($id);
            if (!$category) {
                return $this->errorResponse('Category not found', 404);
            }

            $validator = Validator::make($request->all(), [
                'new_parent_id' => 'nullable|string|exists:categories,_id',
                'order' => 'nullable|integer|min:0'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->messages(), 422);
            }

            if ($request->has('new_parent_id')) {
                $category->moveTo($request->new_parent_id);
            }

            if ($request->has('order')) {
                $category->order = $request->order;
                $category->save();
            }

            return response()->json([
                'status' => 200,
                'message' => 'Category moved successfully',
                'category' => $category->load('children')
            ]);
        } catch (\Exception $e) {
            Log::error('Error moving category: ' . $e->getMessage());
            return $this->errorResponse('Error moving category', 500);
        }
    }

    private function errorResponse($message, int $status): JsonResponse
    {
        return response()->json([
            'status' => $status,
            'message' => $message
        ], $status);
    }
}