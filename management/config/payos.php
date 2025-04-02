<?php

$PAYOS_CONFIG = [
    'CLIENT_ID'    => getenv('PAYOS_CLIENT_ID'),
    'API_KEY'      => getenv('PAYOS_API_KEY'),
    'CHECKSUM_KEY' => getenv('PAYOS_CHECKSUM_KEY'),
    'API_BASE_URL' => 'https://api-merchant.payos.vn/v2',
    'RETURN_URL'   => getenv('PAYOS_RETURN_URL') ?: 'http://localhost:5173/payment/success',
    'CANCEL_URL'   => getenv('PAYOS_CANCEL_URL') ?: 'http://localhost:5173/payment/cancel',
];