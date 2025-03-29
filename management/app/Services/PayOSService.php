<?php

namespace App\Services;

use Exception;

class PayOSService {
    private $clientId;
    private $apiKey;
    private $checksumKey;
    private $apiBaseUrl;
    private $returnUrl;
    private $cancelUrl;
    private $webhookUrl;

    public function __construct() {
        $this->clientId    = getenv('PAYOS_CLIENT_ID');
        $this->apiKey      = getenv('PAYOS_API_KEY');
        $this->checksumKey = getenv('PAYOS_CHECKSUM_KEY');
        $this->returnUrl   = getenv('PAYOS_RETURN_URL') ?: 'http://localhost:5173/payment/success';
        $this->cancelUrl   = getenv('PAYOS_CANCEL_URL') ?: 'http://localhost:5173/payment/cancel';
        $this->apiBaseUrl  = 'https://api-merchant.payos.vn/v2';
        $this->webhookUrl  = getenv('BACKEND_URL') . '/api/orders/webhook';

        if (!$this->clientId || !$this->apiKey || !$this->checksumKey) {
            throw new Exception('Missing PayOS configuration');
        }
    }

    private function createSignature(array $data): string {
        $requiredFields = [
            'amount'      => $data['amount'],
            'cancelUrl'   => $data['cancelUrl'],
            'description' => $data['description'],
            'orderCode'   => $data['orderCode'],
            'returnUrl'   => $data['returnUrl']
        ];

        ksort($requiredFields);
        $signData = http_build_query($requiredFields, '', '&', PHP_QUERY_RFC3986);

        return hash_hmac('sha256', $signData, $this->checksumKey);
    }

    public function createPayment(array $order): array {
        $payosOrderCode = time(); // You can use a better unique ID

        $baseData = [
            'orderCode'   => $payosOrderCode,
            'amount'      => round($order['finalTotal']),
            'description' => 'TT ' . $order['order_number'],
            'cancelUrl'   => $this->cancelUrl,
            'returnUrl'   => $this->returnUrl
        ];

        $signature = $this->createSignature($baseData);

        $paymentData = array_merge($baseData, [
            'signature'       => $signature,
            'webHookUrl'      => $this->webhookUrl,
            'customerEmail'   => $order['customerInfo']['email'] ?? '',
            'customerPhone'   => $order['customerInfo']['phone'] ?? '',
            'customerName'    => $order['customerInfo']['name'] ?? '',
            'orderReference'  => $order['order_number']
        ]);

        $response = $this->sendPostRequest('/payment-requests', $paymentData);

        if ($response['code'] === '00') {
            return [
                'success'        => true,
                'checkoutUrl'    => $response['data']['checkoutUrl'],
                'paymentLinkId'  => $response['data']['paymentLinkId']
            ];
        } else {
            throw new Exception($response['desc'] ?? 'PayOS API error');
        }
    }

    public function checkPaymentStatus($orderCode): array {
        return $this->sendGetRequest("/payment-requests/{$orderCode}");
    }

    public function verifyWebhookSignature(array $payload, string $signature): bool {
        $calculated = $this->createSignature($payload);
        return $calculated === $signature;
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
