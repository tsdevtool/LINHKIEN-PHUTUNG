<?php
namespace Management\App\Actions\Product;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use function PHPUnit\Framework\isEmpty;

class ListProductInChildCategory{
    private $errorResponse, $succesResponse;
    public function __construct($errorResponse, $succesResponse){
        $this->errorResponse = $errorResponse;
        $this->succesResponse = $succesResponse;
    }

    public function execute(Request $request):JsonResponse
    {
        try {
            $category = Category::findOrFail($request->category_id);
            if(!$category || !$category->is_active || isEmpty($category->parent_id)) {
                return $this->errorResponse->execute('Không tìm thấy danh mục này',404);
            }

            if($category->products->count() <= 0){
                return $this->succesResponse->execute($category,'Danh mục này hiện chưa có sản phẩm nào',204);   
            }

            return $this->succesResponse->execute($category,'',200);
        } catch (\Exception $e) {
            return $this->errorResponse->execute('Lỗi server lấy sản phẩm theo danh mục con' . $e->getMessage(),500);
        }
    }
}