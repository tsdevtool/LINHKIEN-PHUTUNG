<?php

namespace App\Traits;

use App\Models\Category;

trait CategoryTrait
{
    //check category is exist
    protected function checkCategoryIsExist(string $id): Category
    {
        $category = Category::find($id);
        if (!$category) {
            return $this->errorResponse("Danh mục không tồn tại",404);
        }
        return $category;
    }

}
