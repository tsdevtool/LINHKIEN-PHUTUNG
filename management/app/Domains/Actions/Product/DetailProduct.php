<?php
namespace Management\App\Actions\Product;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DetailProduct{
    private $errorResponse, $successResponse;

    public function __construct($errorResponse, $successResponse){
        $this->errorResponse = $errorResponse;
        $this->successResponse = $successResponse;
    }

    public function execute(Request $request):JsonResponse{
       try{
        $product = Product::find($request->id);
        if(!$product){
            return $this->errorResponse->execute('Không tìm thấy thông tin sản phẩm này', 404);
        }
        if($product->isActive ===false){
            return $this->errorResponse->execute('Sản phẩm không còn khả dụng', 400);
        }
        return $this->successResponse->execute([
            'status'=>200,
            'result'=> $product,
        ]);
       }catch(\Exception $e){
        return $this->errorResponse->execute("Lỗi lấy sản phẩm ở server" . $e->getMessage(),500);
       }
    }
}