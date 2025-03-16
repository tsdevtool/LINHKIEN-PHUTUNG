<?php

namespace App\Traits;

use App\Models\Category;

trait CategoryTrait
{
    //check category is exist
    protected function checkCategoryIsExist(string $id): ?Category
    {
        return Category::find($id);
    }

}
