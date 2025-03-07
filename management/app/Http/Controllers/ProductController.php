<?php

namespace App\Http\Controllers;

use App\Models\Product;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    private array $rules = [
        'name' => 'required|string|max:255',
        'description' => 'required|string',
        'quantity' => 'required|integer|min:0',
        'price' => 'required|numeric|min:0',
        'category_id' => 'required|string',
        'manufactured_at' => 'nullable|date',
        'expires_at' => 'nullable|date|after_or_equal:manufactured_at',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        'images.*' => 'nullable|mimes:jpeg,png,jpg,gif,mp4|max:10240', // 10MB limit cho files
    ];

    /**
     * Lấy danh sách sản phẩm đang hoạt động
     */
    public function index(): JsonResponse
    {
        try {
            $products = Product::active()
                ->with('category')
                ->get();

            return response()->json([
                'status' => 200,
                'products' => $products
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching products: ' . $e->getMessage());
            return $this->errorResponse('Error fetching products', 500);
        }
    }

    /**
     * Lấy chi tiết một sản phẩm
     */
    public function show(string $id): JsonResponse
    {
        try {
            $product = Product::active()
                ->with('category')
                ->find($id);
            
            if (!$product) {
                return $this->errorResponse('Product not found', 404);
            }

            return response()->json([
                'status' => 200,
                'product' => $product
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching product: ' . $e->getMessage());
            return $this->errorResponse('Error fetching product', 500);
        }
    }

    /**
     * Tạo sản phẩm mới
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->rules);

        if ($validator->fails()) {
            return $this->errorResponse($validator->messages(), 422);
        }

        try {
            // Upload ảnh chính
            $mainImageData = $this->handleImageUpload($request, 'image');
            
            // Upload các ảnh phụ
            $additionalImages = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $imageData = $this->handleAdditionalFileUpload($image);
                    if ($imageData) {
                        $additionalImages[] = $imageData;
                    }
                }
            }

            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'quantity' => $request->quantity,
                'price' => $request->price,
                'category_id' => $request->category_id,
                'manufactured_at' => $request->manufactured_at,
                'expires_at' => $request->expires_at,
                'image_url' => $mainImageData['url'] ?? null,
                'image_public_id' => $mainImageData['public_id'] ?? null,
                'images' => $additionalImages,
                'is_active' => true
            ]);

            return response()->json([
                'status' => 201,
                'message' => 'Product created successfully',
                'product' => $product->load('category')
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage());
            
            // Cleanup uploaded images
            if (isset($mainImageData['public_id'])) {
                $this->deleteCloudinaryImage($mainImageData['public_id']);
            }
            foreach ($additionalImages ?? [] as $image) {
                $this->deleteCloudinaryImage($image['public_id']);
            }

            return $this->errorResponse('Error creating product', 500);
        }
    }

    /**
     * Cập nhật sản phẩm
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $product = Product::active()->find($id);
            
            if (!$product) {
                return $this->errorResponse('Product not found', 404);
            }

            $updateRules = array_map(function($rule) {
                return str_replace('required', 'nullable', $rule);
            }, $this->rules);
            
            $validator = Validator::make($request->all(), $updateRules);

            if ($validator->fails()) {
                return $this->errorResponse($validator->messages(), 422);
            }

            // Xử lý ảnh chính
            if ($request->hasFile('image') || $request->has('image')) {
                $mainImageData = $this->handleImageUpdate($request, $product);
                $product->image_url = $mainImageData['url'] ?? null;
                $product->image_public_id = $mainImageData['public_id'] ?? null;
            }

            // Xử lý ảnh phụ
            if ($request->hasFile('images')) {
                // Xóa ảnh cũ nếu có
                foreach ($product->images ?? [] as $image) {
                    $this->deleteCloudinaryImage($image['public_id']);
                }

                $additionalImages = [];
                foreach ($request->file('images') as $image) {
                    $imageData = $this->handleAdditionalFileUpload($image);
                    if ($imageData) {
                        $additionalImages[] = $imageData;
                    }
                }
                $product->images = $additionalImages;
            }

            $product->fill($request->except(['image', 'images']));
            $product->save();

            return response()->json([
                'status' => 200,
                'message' => 'Product updated successfully',
                'product' => $product->load('category')
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating product: ' . $e->getMessage());
            return $this->errorResponse('Error updating product', 500);
        }
    }

    /**
     * Xóa mềm sản phẩm (đưa vào thùng rác)
     */
    public function softDelete(string $id): JsonResponse
    {
        try {
            $product = Product::active()->find($id);
            
            if (!$product) {
                return $this->errorResponse('Product not found', 404);
            }

            $product->delete(); // Sử dụng soft delete

            return response()->json([
                'status' => 200,
                'message' => 'Product moved to trash successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error moving product to trash: ' . $e->getMessage());
            return $this->errorResponse('Error moving product to trash', 500);
        }
    }

    /**
     * Khôi phục sản phẩm từ thùng rác
     */
    public function restore(string $id): JsonResponse
    {
        try {
            $product = Product::onlyTrashed()->find($id);
            
            if (!$product) {
                return $this->errorResponse('Product not found in trash', 404);
            }

            $product->restore();

            return response()->json([
                'status' => 200,
                'message' => 'Product restored successfully',
                'product' => $product->load('category')
            ]);

        } catch (\Exception $e) {
            Log::error('Error restoring product: ' . $e->getMessage());
            return $this->errorResponse('Error restoring product', 500);
        }
    }

    /**
     * Xóa hoàn toàn một sản phẩm
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $product = Product::withTrashed()->find($id);
            
            if (!$product) {
                return $this->errorResponse('Product not found', 404);
            }

            // Xóa ảnh chính
            if ($product->image_public_id) {
                $this->deleteCloudinaryImage($product->image_public_id);
            }

            // Xóa các ảnh phụ
            foreach ($product->images ?? [] as $image) {
                $this->deleteCloudinaryImage($image['public_id']);
            }

            $product->forceDelete();
            return response()->json([
                'status' => 200,
                'message' => 'Product permanently deleted'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting product: ' . $e->getMessage());
            return $this->errorResponse('Error deleting product', 500);
        }
    }

    /**
     * Xóa tất cả sản phẩm trong thùng rác
     */
    public function emptyTrash(): JsonResponse
    {
        try {
            $trashedProducts = Product::onlyTrashed()->get();

            foreach ($trashedProducts as $product) {
                // Xóa ảnh chính
                if ($product->image_public_id) {
                    $this->deleteCloudinaryImage($product->image_public_id);
                }

                // Xóa các ảnh phụ
                foreach ($product->images ?? [] as $image) {
                    $this->deleteCloudinaryImage($image['public_id']);
                }

                $product->forceDelete();
            }

            return response()->json([
                'status' => 200,
                'message' => 'Trash emptied successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error emptying trash: ' . $e->getMessage());
            return $this->errorResponse('Error emptying trash', 500);
        }
    }

    /**
     * Handle image upload to Cloudinary
     */
    private function handleImageUpload(Request $request, string $fieldName): ?array
    {
        if (!$request->hasFile($fieldName)) {
            return null;
        }

        $cloudinaryImage = $request->file($fieldName)->storeOnCloudinary('products', [
            'transformation' => [
                'quality' => 'auto',
                'fetch_format' => 'auto',
                'width' => 800,
                'height' => 800,
                'crop' => 'limit'
            ]
        ]);

        return [
            'url' => $cloudinaryImage->getSecurePath(),
            'public_id' => $cloudinaryImage->getPublicId()
        ];
    }

    /**
     * Handle additional file upload (image or video)
     */
    private function handleAdditionalFileUpload($file): ?array
    {
        if (!$file) {
            return null;
        }

        $options = [
            'resource_type' => 'auto',
            'folder' => 'products',
            'transformation' => [
                'quality' => 'auto',
                'fetch_format' => 'auto'
            ]
        ];

        // Nếu là video
        if (str_starts_with($file->getMimeType(), 'video')) {
            $options['transformation'] = array_merge($options['transformation'], [
                'width' => 720,
                'crop' => 'scale',
                'duration' => 60 // Giới hạn video 60s
            ]);
        } else {
            // Nếu là ảnh
            $options['transformation'] = array_merge($options['transformation'], [
                'width' => 800,
                'height' => 800,
                'crop' => 'limit'
            ]);
        }

        $result = $file->storeOnCloudinary($options);

        return [
            'url' => $result->getSecurePath(),
            'public_id' => $result->getPublicId(),
            'resource_type' => $result->getFileType(),
            'type' => str_starts_with($file->getMimeType(), 'video') ? 'video' : 'image'
        ];
    }

    /**
     * Handle image update in Cloudinary
     */
    private function handleImageUpdate(Request $request, Product $product): ?array
    {
        // Delete existing image if new image is uploaded or image is set to null
        if ($product->image_public_id) {
            $this->deleteCloudinaryImage($product->image_public_id);
        }

        // If image is set to null, return null
        if ($request->has('image') && $request->image === null) {
            return null;
        }

        // If new image is uploaded, store it
        if ($request->hasFile('image')) {
            return $this->handleImageUpload($request, 'image');
        }

        return null;
    }

    /**
     * Delete image from Cloudinary
     */
    private function deleteCloudinaryImage(?string $publicId): void
    {
        if ($publicId) {
            try {
                Cloudinary::destroy($publicId);
            } catch (\Exception $e) {
                Log::error('Error deleting image from Cloudinary: ' . $e->getMessage());
            }
        }
    }

    /**
     * Return error response
     */
    private function errorResponse($message, int $status): JsonResponse
    {
        return response()->json([
            'status' => $status,
            'message' => $message
        ], $status);
    }

    /**
     * Get products in trash
     */
    public function getTrash(): JsonResponse
    {
        try {
            $trashedProducts = Product::onlyTrashed()
                ->with('category')
                ->get();

            return response()->json([
                'status' => 200,
                'products' => $trashedProducts
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching trashed products: ' . $e->getMessage());
            return $this->errorResponse('Error fetching trashed products', 500);
        }
    }
}