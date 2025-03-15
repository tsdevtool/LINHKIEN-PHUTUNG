<?php

namespace App\Http\Controllers\Customers;

use App\Http\Controllers\Controller;
use App\Actions\Customer\Home\GetHomeCategoriesAction;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    private $getHomeCategoriesAction;

    public function __construct(GetHomeCategoriesAction $getHomeCategoriesAction)
    {
        $this->getHomeCategoriesAction = $getHomeCategoriesAction;
    }

    /**
     * Lấy danh sách category cha và tối đa 6 sản phẩm từ các category con
     */
    public function getHomeCategories(): JsonResponse
    {
        return $this->getHomeCategoriesAction->execute();
    }
} 