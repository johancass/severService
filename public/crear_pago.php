<?php
// Recibe datos del ESP
$id_pago = isset($_POST['id_pago']) ? $_POST['id_pago'] : '';
$valor = isset($_POST['valor']) ? $_POST['valor'] : '';

if (empty($id_pago) || empty($valor)) {
    echo "Faltan datos";
    exit;
}

// Construir datos para enviar al servidor FreeHosting
$data = http_build_query([
    'id_pago' => $id_pago,
    'valor' => $valor
]);

$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => $data,
        'timeout' => 10
    ]
];

$context  = stream_context_create($options);

// Cambia esta URL a tu dominio real en FreeHosting
$url = "https://jcmanosenresina.unaux.com/guardar_pago.php";
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "error al reenviar";
} else {
    echo $result; // Devuelve el ID recibido para que el ESP lo use
}
?>
