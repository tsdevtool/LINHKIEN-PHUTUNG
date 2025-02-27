<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use MongoDB\BSON\ObjectId;

class User extends Model
{
    protected $connection = 'mongodb'; // Kết nối MongoDB
    protected $collection = 'users';   // Collection trong MongoDB
    protected $primaryKey = '_id';     // Khóa chính trong MongoDB
    public $timestamps = false;        // Không sử dụng timestamps với MongoDB
    public $incrementing = false;      // Không dùng auto-increment như MySQL
    protected $keyType = 'string';     // Định nghĩa khóa chính là string
    protected $fillable = [
        'firstname',  
        'lastname',
        'phone',
        'password',
        'image',
        'deliveryAddress',
        'searchHistory',
        'numberOfOrder'
    ];

    /**
     * Đảm bảo `_id` sử dụng ObjectId khi truy vấn
     */
    public function getIdAttribute($value)
    {
        return (string) $value;
    }

    public static function findByObjectId($id)
    {
        return self::where('_id', new ObjectId($id))->first();
    }
}
