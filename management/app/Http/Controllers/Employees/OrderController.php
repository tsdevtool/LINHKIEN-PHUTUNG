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
            $sortField = $request->input('sortBy', 'created_at');
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
                $query->where('payment_status', $filterPaymentStatus);
            }
            if ($filterShippingStatus) {
                $query->where('shipping_status', $filterShippingStatus);
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

            // Map camelCase to snake_case
            $fieldMapping = [
                'customerInfo' => 'customer_info',
                'customerId' => 'customer_id',
                'totalAmount' => 'total_amount',
                'finalTotal' => 'finaltotal',
                'paymentMethod' => 'payment_method',
                'shippingMethod' => 'shipping_method',
                'shippingFee' => 'shipping_fee',
                'staffId' => 'staff_id',
                'staffInfo' => 'staff_info',
                'staffName' => 'staff_name'
            ];

            // Create a data array that handles both camelCase and snake_case
            $normalizedData = [];
            foreach ($fieldMapping as $camelCase => $snakeCase) {
                if (isset($data[$camelCase])) {
                    $normalizedData[$snakeCase] = $data[$camelCase];
                } elseif (isset($data[$snakeCase])) {
                    $normalizedData[$snakeCase] = $data[$snakeCase];
                }
            }

            // Copy other fields that are not mapped
            foreach ($data as $key => $value) {
                if (!isset($normalizedData[$key]) && !array_key_exists($key, array_flip($fieldMapping))) {
                    $normalizedData[$key] = $value;
                }
            }

            // Log normalized data
            Log::info('Normalized data:', $normalizedData);

            // Validate required fields
            $requiredFields = [
                'items' => 'Danh sách sản phẩm',
                'customer_info' => 'Thông tin khách hàng',
                'total_amount' => 'Tổng tiền hàng',
                'finaltotal' => 'Tổng tiền thanh toán',
                'payment_method' => 'Phương thức thanh toán',
                'shipping_method' => 'Phương thức giao hàng'
            ];

            $missingFields = [];
            foreach ($requiredFields as $field => $label) {
                if (!isset($normalizedData[$field])) {
                    $missingFields[] = $label;
                }
            }

            if (!empty($missingFields)) {
                throw new Exception('Thiếu thông tin: ' . implode(', ', $missingFields));
            }

            // Chuẩn hóa dữ liệu theo cấu trúc model
            $orderData = [
                'customer_id' => $normalizedData['customer_id'] ?? null,
                'customer_info' => $normalizedData['customer_info'],
                'total_amount' => $normalizedData['total_amount'],
                'finaltotal' => $normalizedData['finaltotal'],
                'payment_method' => $normalizedData['payment_method'],
                'shipping_method' => $normalizedData['shipping_method'],
                'discount' => $normalizedData['discount'] ?? 0,
                'shipping_fee' => $normalizedData['shipping_fee'] ?? 0,
                'note' => $normalizedData['note'] ?? '',
                'status' => $normalizedData['status'] ?? 'pending',
                'payment_status' => $normalizedData['payment_status'] ?? 'pending',
                'shipping_status' => $normalizedData['shipping_status'] ?? 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ];

            // Xử lý trường staff_id và staff_info
            if (isset($normalizedData['staff_id'])) {
                $orderData['staff_id'] = $normalizedData['staff_id'];
            }
            
            // Xử lý staff_info từ nhiều nguồn
            if (isset($normalizedData['staff_info'])) {
                $orderData['staff_info'] = $normalizedData['staff_info'];
            } elseif (isset($normalizedData['staff_name'])) {
                $orderData['staff_info'] = [
                    'name' => $normalizedData['staff_name'],
                    'role' => 'employee'
                ];
            }

            // Kiểm tra định dạng của items
            $items = $normalizedData['items'];
            if (!is_array($items)) {
                throw new Exception('Danh sách sản phẩm không hợp lệ');
            }

            // Chuẩn hóa items
            $orderItems = [];
            foreach ($items as $item) {
                // Kiểm tra các trường bắt buộc của item
                if (!isset($item['product_id']) && !isset($item['productId'])) {
                    throw new Exception('Sản phẩm thiếu ID');
                }
                
                // Xử lý product_id để đảm bảo đúng định dạng
                $productId = $item['product_id'] ?? $item['productId'];
                
                // Kiểm tra tồn kho
                $product = Product::find($productId);
                if (!$product) {
                    throw new Exception("Không tìm thấy sản phẩm với ID: {$productId}");
                }
                
                $quantity = $item['quantity'] ?? 1;
                if ($product->quantity < $quantity) {
                    throw new Exception("Sản phẩm {$product->name} chỉ còn {$product->quantity} trong kho");
                }
                
                // Tạo cấu trúc item theo model
                $orderItems[] = [
                    'product_id' => $productId,
                    'name' => $item['name'] ?? $product->name,
                    'quantity' => $quantity,
                    'price' => $item['price'] ?? $product->price,
                    'total' => $item['total'] ?? ($item['price'] * $quantity) ?? ($product->price * $quantity)
                ];
            }
            
            $orderData['items'] = $orderItems;
            
            // Log dữ liệu đơn hàng đã chuẩn hóa
            Log::info('Normalized order data:', $orderData);

            // Tạo đơn hàng
            $order = new Order($orderData);
            $order->save();

            // Cập nhật số lượng sản phẩm
            foreach ($orderItems as $item) {
                $product = Product::find($item['product_id']);
                $product->quantity -= $item['quantity'];
                $product->save();
            }

            DB::commit();

            $orderArray = $order->getAttributes();
            $orderArray['_id'] = (string) $order->_id;

            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn hàng thành công',
                'order' => $orderArray
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

            // Đảm bảo toArray không gây lỗi
            $orderArray = $order instanceof \Illuminate\Database\Eloquent\Model
                ? $order->getAttributes()
                : (array) $order;

            $orderArray['_id'] = (string) ($order->_id ?? $orderArray['_id'] ?? '');

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
            Log::info('Cancel order request received', [
                'id' => $id,
                'request' => request()->all()
            ]);

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
                $productId = $item['product_id'] ?? $item['productId'] ?? null;
                if ($productId) {
                    $product = Product::find($productId);
                    if ($product) {
                        $product->quantity += $item['quantity'];
                        $product->save();
                    }
                }
            }

            $order->status = 'cancelled';
            $order->cancelled_reason = request('cancelReason');
            $order->cancelled_at = now();
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

    public function createPayment(Request $request, $id)
    {
        try {
            $order = Order::find($id);
            if (!$order) {
                throw new Exception('Không tìm thấy đơn hàng');
            }

            if ($order->payment_status === 'paid') {
                throw new Exception('Đơn hàng đã thanh toán');
            }

            // Lấy return_url và cancel_url từ request nếu có
            $returnUrl = $request->input('return_url');
            $cancelUrl = $request->input('cancel_url');

            Log::info('[PayOS] Creating payment for order:', [
                'order_id' => $id,
                'order_number' => $order->order_number,
                'order_data' => $order->toArray(),
                'custom_return_url' => $returnUrl,
                'custom_cancel_url' => $cancelUrl
            ]);
                
            $payos = new PayOSService();
            $paymentResult = $payos->createPayment($order, $returnUrl, $cancelUrl);

            // Cập nhật thông tin thanh toán
            $order->update([
                'payment_info' => [
                    'provider' => 'PayOS',
                    'payment_id' => $paymentResult['paymentLinkId'],
                    'status' => 'pending',
                    'created_at' => now()
                ]
            ]);

            return response()->json([
                'success' => true,
                'paymentUrl' => $paymentResult['checkoutUrl'],
                'paymentId' => $paymentResult['paymentLinkId']
            ]);

        } catch (\Exception $e) {
            Log::error('[PayOS] Payment creation error:', [
                'order_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo link thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    public function findByOrderNumber($orderNumber)
    {
        try {
            Log::info('Finding order with number:', ['order_number' => $orderNumber]);
            
            // Tìm order bằng order_number
            $order = Order::where('order_number', $orderNumber)
                         ->orWhere('orderNumber', $orderNumber)
                         ->first();

            if (!$order) {
                Log::error('Order not found:', ['order_number' => $orderNumber]);
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            // Convert MongoDB ObjectId to string
            $orderData = $order->toArray();
            $orderData['_id'] = (string)$order->_id;

            Log::info('Found order:', [
                'order_number' => $order->order_number,
                'id' => $orderData['_id']
            ]);

            return response()->json([
                'success' => true,
                'order' => $orderData
            ]);

        } catch (\Exception $e) {
            Log::error('Error finding order:', [
                'order_number' => $orderNumber,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tìm đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        try {
            $signature = $request->header('x-payos-signature');
            $payload = $request->all();

            Log::info('[PayOS Webhook] Received webhook data:', [
                'signature' => $signature,
                'payload' => $payload,
                'headers' => $request->headers->all()
            ]);

            // Verify signature nếu có
            if ($signature) {
                $payos = new \App\Services\PayOSService();
                $isValid = $payos->verifyWebhookSignature($payload, $signature);
                
                Log::info('[PayOS Webhook] Signature verification:', ['isValid' => $isValid]);
                
                if (!$isValid) {
                    Log::error('[PayOS Webhook] Invalid signature');
                    return response()->json(['success' => false, 'message' => 'Invalid signature'], 400);
                }
            }

            // Tìm đơn hàng theo orderReference hoặc paymentLinkId
            Log::info('[PayOS Webhook] Searching for order with:', [
                'orderReference' => $payload['orderReference'] ?? 'not provided',
                'paymentLinkId' => $payload['paymentLinkId'] ?? 'not provided'
            ]);

            $order = null;
            
            if (isset($payload['orderReference'])) {
                $order = Order::where('order_number', $payload['orderReference'])->first();
            }
            
            if (!$order && isset($payload['paymentLinkId'])) {
                $order = Order::where('payment_info.payment_id', $payload['paymentLinkId'])->first();
            }

            if (!$order) {
                Log::error('[PayOS Webhook] Order not found:', [
                    'orderReference' => $payload['orderReference'] ?? 'not provided',
                    'paymentLinkId' => $payload['paymentLinkId'] ?? 'not provided'
                ]);
                return response()->json(['success' => false, 'message' => 'Order not found'], 404);
            }

            Log::info('[PayOS Webhook] Found order:', [
                'order_number' => $order->order_number,
                'current_status' => $order->status,
                'current_payment_status' => $order->payment_status
            ]);

            // Cập nhật trạng thái thanh toán nếu status là PAID
            if (isset($payload['status']) && $payload['status'] === 'PAID') {
                Log::info('[PayOS Webhook] Processing PAID status');
                
                try {
                    $previousStatus = $order->payment_status;
                    // Cập nhật trạng thái thanh toán
                    $order->payment_status = 'paid';
                    
                    // Cập nhật thông tin thanh toán
                    $order->payment_info = [
                        'provider' => 'PayOS',
                        'payment_id' => $payload['paymentLinkId'] ?? $order->payment_info['payment_id'] ?? '',
                        'status' => 'paid',
                        'transaction_id' => $payload['transactionId'] ?? '',
                        'paid_at' => isset($payload['orderInfo']['paymentAt']) 
                            ? date('Y-m-d H:i:s', $payload['orderInfo']['paymentAt']) 
                            : now(),
                        'amount' => $payload['amount'] ?? $order->finaltotal ?? 0
                    ];

                    // Cập nhật trạng thái đơn hàng
                    $previousOrderStatus = $order->status;
                    if ($order->shipping_method === 'Nhận tại cửa hàng') {
                        $order->status = 'completed';
                    } else if ($order->status === 'pending') {
                        $order->status = 'confirmed';
                    }

                    // Thêm vào order history
                    $history = $order->order_history ?? [];
                    $history[] = [
                        'status' => 'payment_success',
                        'message' => 'Thanh toán thành công qua PayOS',
                        'time' => now()->toISOString()
                    ];
                    $order->order_history = $history;

                    $order->save();
                    
                    Log::info('[PayOS Webhook] Order updated successfully:', [
                        'order_number' => $order->order_number,
                        'previous_payment_status' => $previousStatus,
                        'new_payment_status' => $order->payment_status,
                        'previous_order_status' => $previousOrderStatus,
                        'new_order_status' => $order->status
                    ]);
                } catch (Exception $saveError) {
                    Log::error('[PayOS Webhook] Error saving order:', [
                        'message' => $saveError->getMessage(),
                        'trace' => $saveError->getTraceAsString()
                    ]);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Lỗi khi lưu đơn hàng: ' . $saveError->getMessage()
                    ], 500);
                }
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

    public function updateByOrderNumber(Request $request, $orderNumber)
    {
        DB::beginTransaction();

        try {
            $order = Order::where('order_number', $orderNumber)->first();
            if (!$order) {
                throw new Exception('Không tìm thấy đơn hàng');
            }

            // Lấy các trường cần update từ request
            $updateData = [];
            
            // Các trường cơ bản
            if ($request->has('customer_info')) $updateData['customer_info'] = $request->customer_info;
            if ($request->has('items')) $updateData['items'] = $request->items;
            if ($request->has('total_amount')) $updateData['total_amount'] = $request->total_amount;
            if ($request->has('finaltotal')) $updateData['finaltotal'] = $request->finaltotal;
            
            // Các trường trạng thái
            if ($request->has('status')) $updateData['status'] = $request->status;
            if ($request->has('payment_status')) $updateData['payment_status'] = $request->payment_status;
            if ($request->has('shipping_status')) $updateData['shipping_status'] = $request->shipping_status;
            
            // Các trường thời gian
            if ($request->has('confirmed_at')) $updateData['confirmed_at'] = $request->confirmed_at;
            if ($request->has('shipping_updated_at')) $updateData['shipping_updated_at'] = $request->shipping_updated_at;
            if ($request->has('delivered_at')) $updateData['delivered_at'] = $request->delivered_at;
            if ($request->has('cancelled_at')) $updateData['cancelled_at'] = $request->cancelled_at;
            
            // Thông tin thanh toán
            if ($request->has('payment_info')) {
                $updateData['payment_info'] = $request->payment_info;
            }

            Log::info('Updating order by number:', [
                'order_number' => $orderNumber,
                'update_data' => $updateData
            ]);

            $order->update($updateData);
            
            // Convert MongoDB ObjectId to string
            $orderData = $order->fresh()->toArray();
            $orderData['_id'] = (string)$order->_id;

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật đơn hàng thành công',
                'order' => $orderData
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('Order update error:', [
                'order_number' => $orderNumber,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật đơn hàng: ' . $e->getMessage()
            ], 400);
        }
    }
}
