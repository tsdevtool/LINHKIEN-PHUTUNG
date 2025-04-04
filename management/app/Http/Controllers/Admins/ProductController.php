<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Models\Product;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Exception;

class ProductController extends Controller
{
    private const MAIN_IMAGE_SIZE = 2048; // 2MB
    private const ADDITIONAL_IMAGE_SIZE = 10240; // 10MB
    private const IMAGE_DIMENSIONS = [
        'width' => 800,
        'height' => 800,
        'crop' => 'limit'
    ];

    private array $rules = [
        'name' => 'required|string|max:255',
        'description' => 'required|string',
        'quantity' => 'required|integer|min:0',
        'price' => 'required|numeric|min:0',
        'category_id' => 'required|string',
        'manufactured_at' => 'nullable|date',
        'expires_at' => 'nullable|date|after_or_equal:manufactured_at',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:' . self::MAIN_IMAGE_SIZE,
        'images' => 'nullable',
        'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:' . self::ADDITIONAL_IMAGE_SIZE,
        'pending_actual_quantity' => 'nullable|integer|min:0',
        'is_checked_stock' => 'nullable|boolean'  

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

            return $this->successResponse(200, null, ['products' => $products]);
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
            $product = Product::withTrashed()
                ->with('category')
                ->find($id);
            
            if (!$product) {
                return $this->errorResponse('Product not found', 404);
            }

            return $this->successResponse(200, null, ['product' => $product]);
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
            $this->logInfo('Starting product creation', ['request_data' => $request->except(['image', 'images'])]);

            // Upload ảnh chính
            $mainImageData = $this->handleImageUpload($request, 'image');
            
            // Upload các ảnh phụ
            $additionalImages = $this->handleAdditionalImagesUpload($request);

            $productData = $this->prepareProductData($request, $mainImageData, $additionalImages);
            $product = Product::create($productData);

            $this->logInfo('Product created successfully', [
                'product_id' => $product->_id,
                'images_count' => count($product->images)
            ]);

            return $this->successResponse(201, 'Product created successfully', ['product' => $product->load('category')]);

        } catch (\Exception $e) {
            $this->logError('Error creating product', $e);
            
            // Cleanup uploaded images
            $this->cleanupImages($mainImageData['public_id'] ?? null, $additionalImages ?? []);

            return $this->errorResponse('Error creating product: ' . $e->getMessage(), 500);
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

            $updateRules = $this->getUpdateRules();
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
                $newImages = $this->handleAdditionalImagesUpload($request);
                $product->images = array_merge($product->images ?? [], $newImages);
            }

            $product->fill($request->except(['image', 'images']));
            $product->save();

            return $this->successResponse(200, 'Product updated successfully', ['product' => $product->load('category')]);

        } catch (\Exception $e) {
            $this->logError('Error updating product', $e);
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

            $product->delete();
            return $this->successResponse(200, 'Product moved to trash successfully');

        } catch (\Exception $e) {
            $this->logError('Error moving product to trash', $e);
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
            return $this->successResponse(200, 'Product restored successfully', ['product' => $product->load('category')]);

        } catch (\Exception $e) {
            $this->logError('Error restoring product', $e);
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

            // Xóa ảnh chính và ảnh phụ
            $this->cleanupImages($product->image_public_id, $product->images ?? []);
            
            $product->forceDelete();
            return $this->successResponse(200, 'Product permanently deleted');

        } catch (\Exception $e) {
            $this->logError('Error deleting product', $e);
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
                $this->cleanupImages($product->image_public_id, $product->images ?? []);
                $product->forceDelete();
            }

            return $this->successResponse(200, 'Trash emptied successfully');

        } catch (\Exception $e) {
            $this->logError('Error emptying trash', $e);
            return $this->errorResponse('Error emptying trash', 500);
        }
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

            return $this->successResponse(200, null, ['products' => $trashedProducts]);
        } catch (\Exception $e) {
            $this->logError('Error fetching trashed products', $e);
            return $this->errorResponse('Error fetching trashed products', 500);
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
            'transformation' => array_merge(
                ['quality' => 'auto', 'fetch_format' => 'auto'],
                self::IMAGE_DIMENSIONS
            )
        ]);

        return [
            'url' => $cloudinaryImage->getSecurePath(),
            'public_id' => $cloudinaryImage->getPublicId()
        ];
    }

    /**
     * Handle multiple image uploads
     */
    private function handleAdditionalImagesUpload(Request $request): array
    {
        $additionalImages = [];
        
        if (!$request->hasFile('images')) {
            return $additionalImages;
        }

        $uploadedFiles = $request->file('images');
        $files = is_array($uploadedFiles) ? $uploadedFiles : [$uploadedFiles];
        
        $this->logInfo('Processing additional images', ['count' => count($files)]);

        foreach ($files as $index => $image) {
            $imageData = $this->handleAdditionalFileUpload($image);
            
            if ($imageData) {
                $additionalImages[] = [
                    'url' => $imageData['url'],
                    'public_id' => $imageData['public_id']
                ];
            }
        }

        $this->logInfo('Final additional images array', [
            'count' => count($additionalImages),
            'images' => $additionalImages
        ]);

        return $additionalImages;
    }

    /**
     * Handle single additional file upload
     */
    private function handleAdditionalFileUpload($file): ?array
    {
        if (!$file || !$file->isValid()) {
            return null;
        }

        try {
            $options = [
                'folder' => 'products/additional',
                'resource_type' => 'auto',
                'transformation' => array_merge(
                    ['quality' => 'auto', 'fetch_format' => 'auto'],
                    self::IMAGE_DIMENSIONS
                )
            ];

            $result = Cloudinary::upload($file->getRealPath(), $options);

            return [
                'url' => $result->getSecurePath(),
                'public_id' => $result->getPublicId()
            ];
        } catch (\Exception $e) {
            $this->logError('Error uploading additional file', $e);
            return null;
        }
    }

    /**
     * Handle image update in Cloudinary
     */
    private function handleImageUpdate(Request $request, Product $product): ?array
    {
        if ($product->image_public_id) {
            $this->deleteCloudinaryImage($product->image_public_id);
        }

        if ($request->has('image') && $request->image === null) {
            return null;
        }

        return $request->hasFile('image') ? $this->handleImageUpload($request, 'image') : null;
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
                $this->logError('Error deleting image from Cloudinary', $e);
            }
        }
    }

    /**
     * Cleanup uploaded images
     */
    private function cleanupImages(?string $mainImageId, array $additionalImages): void
    {
        if ($mainImageId) {
            $this->deleteCloudinaryImage($mainImageId);
        }

        foreach ($additionalImages as $image) {
            if (isset($image['public_id'])) {
                $this->deleteCloudinaryImage($image['public_id']);
            }
        }
    }

    /**
     * Prepare product data for creation
     */
    private function prepareProductData(Request $request, ?array $mainImageData, array $additionalImages): array
    {
        return [
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
            'is_active' => true,
            'pending_actual_quantity' => 0, // Giá trị mặc định là null
            'is_checked_stock' => "Chờ kiểm kho" // Giá trị mặc định là "Chờ kiểm kho"

        ];
    }

    /**
     * Get update validation rules
     */
    private function getUpdateRules(): array
    {
        return array_map(function($rule) {
            return str_replace('required', 'nullable', $rule);
        }, $this->rules);
    }

    /**
     * Log info message
     */
    private function logInfo(string $message, array $context = []): void
    {
        Log::info($message, $context);
    }

    /**
     * Log error message
     */
    private function logError(string $message, \Exception $e): void
    {
        Log::error($message . ': ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
    }

    /**
     * Return success response
     */
    private function successResponse(int $status, ?string $message = null, array $data = []): JsonResponse
    {
        $response = ['status' => $status];
        
        if ($message) {
            $response['message'] = $message;
        }

        return response()->json(array_merge($response, $data), $status);
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
     * Get products for admin
     * Phương thức: GET 
     * Endpoint: /api/products/list/for-admin-waitingconfirmation
     */
    // Hàm này sẽ lấy danh sách tất cả các sản phẩm có trạng thái "Chờ xác nhận"
    public function getProductsForAdminWattingConfirmation(): JsonResponse
    {
        Log::info('API getProductsForAdmin called');
        
        $products = Product::where('is_checked_stock', 'Chờ xác nhận')
            ->get(['name', 'quantity', 'pending_actual_quantity', 'is_checked_stock']);
    
        Log::info('Products found:', $products->toArray());
    
        if ($products->isEmpty()) {
            return $this->successResponse(200, 'No products found with status "Chờ xác nhận"', ['products' => []]);
        }
    
        return $this->successResponse(200, null, ['products' => $products]);
    }
    /**
     * Get products for admin confirmation
     * Phương thức: GET 
     * Endpoint: /api/products/list/for-admin-confirmation
     */
    public function getProductsForAdminConfirmation(): JsonResponse
    {
        Log::info('API getProductsForAdmin called');
        
        $products = Product::where('is_checked_stock', 'Đã xác nhận')
            ->get(['name', 'quantity', 'pending_actual_quantity', 'is_checked_stock']);
    
        Log::info('Products found:', $products->toArray());
    
        if ($products->isEmpty()) {
            return $this->successResponse(200, 'No products found with status "Chờ xác nhận"', ['products' => []]);
        }
    
        return $this->successResponse(200, null, ['products' => $products]);
    }

    /**
     * Get products for employee
     * Phương thức: GET 
     * Endpoint: /api/products/list/for-employee
     */
    // Hàm này sẽ lấy danh sách tất cả các sản phẩm có trạng thái "Chờ kiểm kho"
    public function getProductsForEmployee(): JsonResponse
    {
        $products = Product::where('is_checked_stock', 'Chờ kiểm kho')
            ->get(['name', 'quantity', 'pending_actual_quantity', 'is_checked_stock']);

        // Kiểm tra nếu không có sản phẩm, trả về 200 với mảng trống
        if ($products->isEmpty()) {
            return $this->successResponse(200, 'No products found with status "Chờ kiểm kho"', ['products' => []]);
        }

        return $this->successResponse(200, null, ['products' => $products]);
    }
    /**
     * Request stock check
     * Phương thức: POST 
     * Endpoint: /api/products/request-stock-check
     */
    // Hàm này sẽ cập nhật tất cả các sản phẩm trong kho với trạng thái "Chờ kiểm kho"
    public function requestStockCheck(): JsonResponse
    {
        Product::query()->update(['is_checked_stock' => 'Chờ kiểm kho']);
        return $this->successResponse(200, 'Stock check requested successfully');
    }

    /**
     * Recheck product
     * Phương thức: POST 
     * Endpoint: /api/products/recheck-product/{id}
     */
    // Hàm này sẽ cập nhật trạng thái của một sản phẩm cụ thể về "Chờ kiểm kho"
    public function recheckProduct(string $id): JsonResponse
    {
        $product = Product::find($id);
    
        if (!$product) {
            return $this->errorResponse('Product not found', 404);
        }
    
        $product->is_checked_stock = 'Chờ kiểm kho';
        $product->save();
    
        return $this->successResponse(200, 'Product set to "Chờ kiểm kho"');
    }

    /**
     * Confirm stock check
     * Phương thức: POST 
     * Endpoint: /api/products/admin-confirm-stock-check/{id}
     */
    // Hàm này sẽ cập nhật trạng thái của một sản phẩm cụ thể về "Đã xác nhận" và cập nhật số lượng
    public function confirmStockCheck(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->errorResponse('Product not found', 404);
        }

        $product->quantity = $product->pending_actual_quantity;
        $product->is_checked_stock = 'Đã xác nhận';
        $product->save();

        return $this->successResponse(200, 'Stock check confirmed successfully');
    }

    /**
     * Employee confirm stock check
     * Phương thức: POST 
     * Endpoint: /api/products/employee-confirm-stock-check/{id}
     */
    // Hàm này sẽ cập nhật trạng thái của một sản phẩm cụ thể về "Chờ xác nhận" và cập nhật số lượng
    public function employeeConfirmStockCheck(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);
    
        if (!$product) {
            return $this->errorResponse('Product not found', 404);
        }
    
        // Kiểm tra giá trị pending_actual_quantity
        $pendingActualQuantity = $request->input('pending_actual_quantity');
        if (!is_numeric($pendingActualQuantity) || $pendingActualQuantity < 0) {
            return $this->errorResponse('Invalid pending_actual_quantity. It must be a number greater than or equal to 0.', 422);
        }
    
        $product->pending_actual_quantity = $pendingActualQuantity;
        $product->is_checked_stock = 'Chờ xác nhận';
        $product->save();
    
        return $this->successResponse(200, 'Stock check updated successfully');
    }
        /**
     * Restock product
     * Phương thức: POST
     * Endpoint: /api/products/restock/{id}
     */
    public function restockProduct(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->errorResponse('Product not found', 404);
        }

        // Kiểm tra giá trị restock_quantity
        $restockQuantity = $request->input('restock_quantity');
        if (!is_numeric($restockQuantity) || $restockQuantity <= 0) {
            return $this->errorResponse('Invalid restock_quantity. It must be a number greater than 0.', 422);
        }

        // Cập nhật số lượng sản phẩm
        $product->quantity += $restockQuantity;
        $product->save();

        return $this->successResponse(200, 'Product restocked successfully', ['product' => $product]);
    }

}