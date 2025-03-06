<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class UploadController extends Controller
{
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // $uploadedFileUrl = Cloudinary::upload($request->file('image')->getRealPath())->getSecurePath();
        $file = $request->file('avatar');
        // Lưu tệp vào thư mục 'avatars' trong storage và lấy đường dẫn
        $path = $file->store('avatars', 'public');
        // Lưu đường dẫn vào cơ sở dữ liệu
        $user->avatar = Storage::url($path);

        return response()->json(['image_url' => $file]);
    }
}
