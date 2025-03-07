<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as MongoModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends MongoModel
{
    use SoftDeletes;

    protected $connection = 'mongodb';
    protected $collection = 'categories';

    protected $fillable = [
        'name',           // Tên category
        'parent_id',      // ID của category cha (null nếu là category cha)
        'parent_name',    // Tên của category cha
        'level',         // Level của category (0: cha, 1: con)
        'path',          // Đường dẫn phân cấp
        'order',         // Thứ tự hiển thị
        'is_active',     // Trạng thái hoạt động
        'deleted_at'     // Thời gian xóa mềm
    ];

    protected $casts = [
        'level' => 'integer',
        'order' => 'integer',
        'is_active' => 'boolean',
        'deleted_at' => 'datetime'
    ];

    protected $hidden = [
        'deleted_at',
        'is_active',
        'path',
        'order'
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Tự động cập nhật path và parent_name khi tạo hoặc cập nhật category
        static::saving(function ($category) {
            if ($category->parent_id) {
                $parent = Category::find($category->parent_id);
                if ($parent) {
                    $category->path = $parent->path . '/' . $category->_id;
                    $category->parent_name = $parent->name;
                    $category->level = 1;
                }
            } else {
                $category->path = $category->_id;
                $category->parent_name = null;
                $category->level = 0;
            }
        });

        // Khi category cha được cập nhật tên, cập nhật parent_name cho tất cả category con
        static::updated(function ($category) {
            if ($category->isDirty('name')) {
                Category::where('parent_id', $category->_id)
                    ->update(['parent_name' => $category->name]);
            }
        });
    }

    /**
     * Get the parent category
     */
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Get the child categories
     */
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id')
            ->orderBy('order', 'asc');
    }

    /**
     * Get all descendants
     */
    public function descendants()
    {
        return $this->hasMany(Category::class, 'path', 'regexp', "^{$this->path}/");
    }

    /**
     * Get products in this category
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Scope for active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for root categories (level 0)
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Format data for response
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Nếu là category con, thêm thông tin category cha
        if ($this->parent_id) {
            $array['parent'] = [
                'id' => $this->parent_id,
                'name' => $this->parent_name
            ];
        }

        // Load relationships if needed
        if ($this->relationLoaded('children')) {
            $array['categories'] = $this->children->map(function ($child) {
                return [
                    'id' => $child->_id,
                    'name' => $child->name,
                    'parent' => [
                        'id' => $child->parent_id,
                        'name' => $child->parent_name
                    ],
                    'products' => $child->when($this->relationLoaded('products'), function ($query) {
                        return $query->products;
                    })
                ];
            });
        }

        return $array;
    }

    /**
     * Move category to new parent
     */
    public function moveTo($newParentId)
    {
        $this->parent_id = $newParentId;
        $this->save();

        // Cập nhật path cho tất cả category con
        foreach ($this->descendants as $descendant) {
            $descendant->save();
        }
    }
}
