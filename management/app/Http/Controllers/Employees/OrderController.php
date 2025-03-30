<?php

namespace App\Http\Controllers\Employees;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\PayOSService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use MongoDB\Laravel\Collection;
use Exception;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Get sorting parameters
            $sortField = $request->input('sortBy', 'createdAt');
            $sortOrder = $request->input('sortOrder', 'desc');
            $filterStatus = $request->input('status');
            $filterPaymentStatus = $request->input('paymentStatus');
            $filterShippingStatus = $request->input('shippingStatus');
            $dateRange = $request->input('dateRange');

            // Start the query
            $query = Order::query();

            // Apply filters
            if ($filterStatus) {
                $query->where('status', $filterStatus);
            }
            if ($filterPaymentStatus) {
                $query->where('paymentStatus', $filterPaymentStatus);
            }
            if ($filterShippingStatus) {
                $query->where('shippingStatus', $filterShippingStatus);
            }

            // Apply date range filter
            if ($dateRange) {
                switch ($dateRange) {
                    case 'today':
                        $query->whereDate('createdAt', Carbon::today());
                        break;
                    case 'week':
                        $query->where('createdAt', '>=', Carbon::now()->subDays(7));
                        break;
                    case 'month':
                        $query->where('createdAt', '>=', Carbon::now()->subDays(30));
                        break;
                }
            }

            // Apply sorting
            $query->orderBy($sortField, $sortOrder);

            // Get results
            $orders = $query->get();
            
            // Convert MongoDB documents to array manually
            $ordersArray = [];
            foreach ($orders as $order) {
                $orderData = $order->getAttributes();
                
                // Convert ObjectIds to strings
                if (isset($orderData['_id'])) {
                    $orderData['_id'] = (string) $orderData['_id'];
                }
                if (isset($orderData['customerId'])) {
                    $orderData['customerId'] = (string) $orderData['customerId'];
                }
                
                // Convert dates to ISO format
                if (isset($orderData['createdAt'])) {
                    $orderData['createdAt'] = $orderData['createdAt']->toISOString();
                }
                if (isset($orderData['updatedAt'])) {
                    $orderData['updatedAt'] = $orderData['updatedAt']->toISOString();
                }
                
                $ordersArray[] = $orderData;
            }
            
            return response()->json([
                'success' => true,
                'orders' => $ordersArray,
                'total' => count($ordersArray),
                'filters' => [
                    'status' => $filterStatus,
                    'paymentStatus' => $filterPaymentStatus,
                    'shippingStatus' => $filterShippingStatus,
                    'dateRange' => $dateRange
                ],
                'sorting' => [
                    'field' => $sortField,
                    'order' => $sortOrder
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching orders:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            // Log request data
            Log::info('Order creation request:', [
                'content_type' => $request->header('Content-Type'),
                'body' => $request->all()
            ]);

            $data = $request->all();

            // Validate required fields
            $requiredFields = [
                'items' => 'Danh sách sản phẩm',
                'customerId' => 'ID khách hàng',
                'customerInfo' => 'Thông tin khách hàng',
                'totalAmount' => 'Tổng tiền hàng',
                'finalTotal' => 'Tổng tiền thanh toán',
                'paymentMethod' => 'Phương thức thanh toán',
                'shippingMethod' => 'Phương thức giao hàng',
                'staffId' => 'ID nhân viên',
                'staffInfo' => 'Thông tin nhân viên'
            ];

            $missingFields = [];
            foreach ($requiredFields as $field => $label) {
                if (!isset($data[$field])) {
                    $missingFields[] = $label;
                }
            }

            if (!empty($missingFields)) {
                throw new Exception('Thiếu thông tin: ' . implode(', ', $missingFields));
            }

            // Check product stock
            foreach ($data['items'] as $item) {
                $product = Product::find($item['productId']);
                if (!$product) {
                    throw new Exception("Không tìm thấy sản phẩm với ID: {$item['productId']}");
                }
                if ($product->quantity < $item['quantity']) {
                    throw new Exception("Sản phẩm {$product->name} chỉ còn {$product->quantity} trong kho");
                }
            }

            // Create order
            $order = new Order($data);
            $order->save();

            // Update product quantities
            foreach ($data['items'] as $item) {
                $product = Product::find($item['productId']);
                $product->quantity -= $item['quantity'];
                $product->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn hàng thành công',
                'order' => $order->toArray()
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('Order creation error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo đơn hàng: ' . $e->getMessage()
            ], 400);
        }
    }

    public function show($id)
    {
        try {
            $order = Order::find($id);
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            $orderArray = $order->toArray();
            $orderArray['_id'] = (string) $orderArray['_id'];
            if (isset($orderArray['customerId'])) {
                $orderArray['customerId'] = (string) $orderArray['customerId'];
            }

            return response()->json([
                'success' => true,
                'order' => $orderArray
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching order:', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            $order = Order::find($id);
            if (!$order) {
                throw new Exception('Không tìm thấy đơn hàng');
            }

            $data = $request->all();
            $order->update($data);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật đơn hàng thành công',
                'order' => $order->toArray()
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('Order update error:', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật đơn hàng: ' . $e->getMessage()
            ], 400);
        }
    }

    public function cancel($id)
    {
        DB::beginTransaction();

        try {
            $order = Order::find($id);
            if (!$order) {
                throw new Exception('Không tìm thấy đơn hàng');
            }

            if ($order->status === 'cancelled') {
                throw new Exception('Đơn hàng đã được huỷ');
            }

            if (in_array($order->status, ['completed', 'shipping'])) {
                throw new Exception('Không thể huỷ đơn hàng ở trạng thái hiện tại');
            }

            // Return products to inventory
            foreach ($order->items as $item) {
                $product = Product::find($item['productId']);
                if ($product) {
                    $product->quantity += $item['quantity'];
                    $product->save();
                }
            }

            $order->status = 'cancelled';
            $order->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Huỷ đơn hàng thành công',
                'order' => $order->toArray()
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('Order cancellation error:', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi huỷ đơn hàng: ' . $e->getMessage()
            ], 400);
        }
    }

    public function createPaymentLink($id)
    {
        try {
            $order = Order::find($id);
            if (!$order) {
                throw new Exception('Không tìm thấy đơn hàng');
            }

            if ($order->paymentStatus === 'paid') {
                throw new Exception('Đơn hàng đã thanh toán');
            }

            Log::info('Creating payment for order:', ['order_id' => $id]);
            
            $payos = new PayOSService();
            $paymentResult = $payos->createPayment($order);

            Log::info('Payment result:', $paymentResult);

            $order->update([
                'paymentInfo' => [
                    'provider' => 'PayOS',
                    'paymentId' => $paymentResult['paymentLinkId'],
                    'status' => 'pending'
                ]
            ]);

            return response()->json([
                'success' => true,
                'paymentUrl' => $paymentResult['checkoutUrl'],
                'paymentId' => $paymentResult['paymentLinkId']
            ]);
        } catch (Exception $e) {
            Log::error('Payment link creation error:', [
                'order_id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo link thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        try {
            $signature = $request->header('x-payos-signature');
            $payload = $request->all();

            Log::info('Received webhook:', [
                'payload' => $payload,
                'signature' => $signature
            ]);

            $payos = new PayOSService();
            if (!$payos->verifyWebhookSignature($payload, $signature)) {
                throw new Exception('Invalid signature');
            }

            $order = Order::where('order_number', $payload['orderReference'])
                         ->orWhere('paymentInfo.paymentId', $payload['paymentLinkId'])
                         ->first();

            if (!$order) {
                throw new Exception('Order not found');
            }

            if ($payload['status'] === 'PAID') {
                $order->paymentStatus = 'paid';
                $order->paymentInfo = [
                    'provider' => 'PayOS',
                    'status' => 'paid',
                    'transactionId' => $payload['transactionId'],
                    'paidAt' => isset($payload['orderInfo']['paymentAt']) 
                        ? Carbon::createFromTimestamp($payload['orderInfo']['paymentAt']) 
                        : now(),
                    'amount' => $payload['amount']
                ];

                if ($order->shippingMethod === 'Nhận tại cửa hàng') {
                    $order->status = 'completed';
                } elseif ($order->status === 'pending') {
                    $order->status = 'confirmed';
                }

                $order->save();

                Log::info('Order payment completed:', [
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->paymentStatus
                ]);
            }

            return response()->json(['success' => true]);
        } catch (Exception $e) {
            Log::error('Webhook processing error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
