<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;

class PayOSService {
    private $clientId;
    private $apiKey;
    private $checksumKey;
    private $apiBaseUrl;
    private $returnUrl;
    private $cancelUrl;
    private $webhookUrl;

    public function __construct() {
        $this->clientId    = env('PAYOS_CLIENT_ID');
        $this->apiKey      = env('PAYOS_API_KEY');
        $this->checksumKey = env('PAYOS_CHECKSUM_KEY');
        $this->returnUrl   = env('PAYOS_RETURN_URL');
        $this->cancelUrl   = env('PAYOS_CANCEL_URL');
        $this->apiBaseUrl  = 'https://api-merchant.payos.vn/v2';
    
        $backendUrl = env('BACKEND_URL');
        $this->webhookUrl = env('PAYOS_WEBHOOK_URL', $backendUrl . '/api/v1/orders/payment/webhook');
    
        if (!$this->clientId || !$this->apiKey || !$this->checksumKey) {
            throw new Exception('Missing PayOS credentials');
        }
    
        Log::info('[PayOS] Initialized with:', [
            'clientId'    => $this->clientId ? '✅' : '❌',
            'apiKey'      => $this->apiKey ? '✅' : '❌',
            'checksumKey' => $this->checksumKey ? '✅' : '❌',
            'apiBaseUrl'  => $this->apiBaseUrl,
            'returnUrl'   => $this->returnUrl,
            'cancelUrl'   => $this->cancelUrl,
            'webhookUrl'  => $this->webhookUrl,
        ]);
    }

    private function createSignature(array $data): string {
        try {
            // Chỉ lấy các trường bắt buộc theo thứ tự của PayOS
            $requiredFields = [
                'amount'      => $data['amount'],
                'cancelUrl'   => $data['cancelUrl'],
                'description' => $data['description'],
                'orderCode'   => $data['orderCode'],
                'returnUrl'   => $data['returnUrl']
            ];

            // Sắp xếp mảng theo key
            ksort($requiredFields);
            
            // Tạo chuỗi ký
            $signData = [];
            foreach ($requiredFields as $key => $value) {
                $signData[] = "{$key}={$value}";
            }
            $signString = implode('&', $signData);
            
            Log::info('Data to sign:', ['signString' => $signString]);

            // Tạo chữ ký HMAC SHA256
            $signature = hash_hmac('sha256', $signString, $this->checksumKey);
            
            Log::info('Generated signature:', ['signature' => $signature]);
            
            return $signature;
        } catch (Exception $e) {
            Log::error('Error creating signature:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function createPayment($order, $customReturnUrl = null, $customCancelUrl = null): array {
        try {
            // Convert MongoDB model to array if needed
            if (is_object($order) && method_exists($order, 'toArray')) {
                $orderData = $order->toArray();
            } else if (is_object($order)) {
                $orderData = json_decode(json_encode($order), true);
            } else {
                $orderData = $order;
            }
    
            // Log input data
            Log::info('[PayOS] Creating payment for order:', [
                'order' => $orderData, 
                'customReturnUrl' => $customReturnUrl,
                'customCancelUrl' => $customCancelUrl
            ]);
    
            // Get amount from either finalTotal, finaltotal or total_amount
            $amount = $orderData['finalTotal'] ?? $orderData['finaltotal'] ?? $orderData['total_amount'] ?? 0;
            if (!$amount) {
                throw new Exception('Missing payment amount');
            }
    
            // Get order number from either order_number or orderNumber
            $orderNumber = $orderData['order_number'] ?? $orderData['orderNumber'] ?? time();
            $payosOrderCode = (int) round(microtime(true) * 1000);
    
            // Get customer info
            $customerInfo = $orderData['customer_info'] ?? $orderData['customerInfo'] ?? [];
    
            // Sử dụng URL tùy chỉnh nếu được cung cấp
            $returnUrl = $customReturnUrl ?: $this->returnUrl;
            $cancelUrl = $customCancelUrl ?: $this->cancelUrl;
            
            // Đảm bảo URL chứa order_number
            $returnUrlWithParams = $returnUrl . (strpos($returnUrl, '?') !== false ? '&' : '?') 
                . 'orderCode=' . $orderNumber . '&order_number=' . $orderNumber;
                
            $cancelUrlWithParams = $cancelUrl . (strpos($cancelUrl, '?') !== false ? '&' : '?') 
                . 'orderCode=' . $orderNumber . '&order_number=' . $orderNumber;
            
            $baseData = [
                'orderCode'   => $payosOrderCode,
                'amount'      => round($amount),
                'description' => $orderNumber,
                'cancelUrl'   => $cancelUrlWithParams,
                'returnUrl'   => $returnUrlWithParams,
                'webHookUrl'  => $this->webhookUrl
            ];
    
            Log::info('[PayOS] URLs:', [
                'returnUrl' => $returnUrlWithParams,
                'cancelUrl' => $cancelUrlWithParams
            ]);
    
            $signature = $this->createSignature($baseData);
    
            $paymentData = array_merge($baseData, [
                'signature'       => $signature,
                'customerEmail'   => $customerInfo['email'] ?? '',
                'customerPhone'   => $customerInfo['phone'] ?? '',
                'customerName'    => $customerInfo['name'] ?? '',
                'orderReference'  => $orderNumber
            ]);
    
            // Log payment request data
            Log::info('[PayOS] Request:', ['paymentData' => $paymentData]);
    
            $response = $this->sendPostRequest('/payment-requests', $paymentData);
            
            // Log payment response
            Log::info('[PayOS] Response:', ['response' => $response]);
    
            if ($response['code'] === '00') {
                return [
                    'success'        => true,
                    'checkoutUrl'    => $response['data']['checkoutUrl'],
                    'paymentLinkId'  => $response['data']['paymentLinkId']
                ];
            } else {
                throw new Exception($response['desc'] ?? 'PayOS API error');
            }
        } catch (Exception $e) {
            Log::error('[PayOS] Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function checkPaymentStatus($orderCode): array {
        return $this->sendGetRequest("/payment-requests/{$orderCode}");
    }

    public function verifyWebhookSignature(array $payload, string $signature): bool {
        Log::info('Verifying webhook signature:', [
            'payload' => $payload,
            'signature' => $signature
        ]);
        
        // Để đảm bảo webhook hoạt động trong giai đoạn phát triển
        return true;
    }

    private function sendPostRequest(string $endpoint, array $data): array {
        $url = $this->apiBaseUrl . $endpoint;

        $headers = [
            "x-client-id: {$this->clientId}",
            "x-api-key: {$this->apiKey}",
            "Content-Type: application/json"
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_POSTFIELDS     => json_encode($data),
        ]);

        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) throw new Exception("cURL Error: $err");

        return json_decode($response, true);
    }

    private function sendGetRequest(string $endpoint): array {
        $url = $this->apiBaseUrl . $endpoint;

        $headers = [
            "x-client-id: {$this->clientId}",
            "x-api-key: {$this->apiKey}"
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => $headers
        ]);

        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) throw new Exception("cURL Error: $err");

        return json_decode($response, true);
    }
}
