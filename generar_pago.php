<?php
header('Content-Type: application/json');

// Parámetros de PayU
$apiKey = "TU_API_KEY";
$merchantId = "TU_MERCHANT_ID";
$accountId = "TU_ACCOUNT_ID";

// Recibir el ID del pedido
$referenceCode = isset($_GET['id']) ? $_GET['id'] : '';
if ($referenceCode == '') {
    echo json_encode(["status" => "error", "message" => "ID no proporcionado"]);
    exit;
}

$amount = "10000";
$currency = "COP";
$description = "Pago generado desde ESP";

// Generar firma
$signature = md5($apiKey . "~" . $merchantId . "~" . $referenceCode . "~" . $amount . "~" . $currency);

// Construir URL de PayU con parámetros
$link_pago = "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu?merchantId={$merchantId}&accountId={$accountId}&description={$description}&referenceCode={$referenceCode}&amount={$amount}&currency={$currency}&signature={$signature}&test=1&buyerEmail=cliente@email.com&responseUrl=https://tuweb.com/response&confirmationUrl=https://tuweb.com/confirmacion";

// Responder con el link en JSON
echo json_encode([
    "status" => "ok",
    "id" => $referenceCode,
    "link" => $link_pago
]);
?>
