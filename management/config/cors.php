<?php

return [
    'paths' => ['api/*', 'v1/auth/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'], // Đổi theo frontend của bạn
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Cho phép gửi cookie
];
