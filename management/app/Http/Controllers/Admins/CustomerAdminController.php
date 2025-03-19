<?php

namespace App\Http\Controllers\Admins;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Exception;
use Carbon\Carbon;
class CustomerAdminController extends Controller
{
    public function GetAllCustomer()
    {
        $customer = Customer::where('status', 'active')
            ->get();
        if($customer->isEmpty())
        {
            return response()->json([
                'status' => 200,
                'message' => 'Không có khách hàng nào đang hoạt động.'
            ], 200);
        }else{
            return response()->json([
                'status' => 200,
                'customer' => $customer
            ], 200);
        }
    }
    public function GetAllCustomer_unActive()
    {
        $customer = Customer::where('status', 'unactive')
            ->get();
        if($customer->isEmpty())
        {
            return response()->json([
                'status' => 200,
                'message' => 'Không có khách hàng nào bị khóa hoạt động.'
            ], 200);
        }else{
            return response()->json([
                'status' => 200,
                'customer' => $customer
            ], 200);
        }
    }
    public function Block_Active($_id, $type)
    {
        if($_id)
        {
            $customer = Customer::find($_id);
            if($customer)
            {
                $type = (bool) $type;

                $customer->update([
                    'status' => $type ? 'active' : 'unactive'
                ]);
                return response()->json([
                    'status' => 200,
                    'message' => 'Cập nhật thành công.'
                ], 404);
            }else{
                return response()->json([
                    'status' => 404,
                    'message' => 'Không tìm thấy khách hàng.'
                ], 404);
            }
        }else{
            return response()->json([
                'status' => 400,
                'message' => 'Thiếu ID khách hàng.'
            ], 400);
        }
    }
    public function addCustomer(Request $request)
    {

    }
}
?>
