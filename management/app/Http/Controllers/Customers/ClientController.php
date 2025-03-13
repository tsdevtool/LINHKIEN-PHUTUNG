<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Management\App\Actions\Product\DetailProduct;

class ClientController extends Controller
{
    private $detailProduct;
    
    public function __construct(DetailProduct $detailProduct){
        $this->detailProduct = $detailProduct;
    }
    //Xem thong tin chi san pham
    public function showDetailProduct(Request $request){
        return $this->detailProduct->execute($request);
    }

    //Xem danh sach san pham theo danh muc con
    public function showListProductFollowChildCategory(Request $request){

    }
}
