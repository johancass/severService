<?php
// public/generar_pago.php

header('Content-Type: application/json');

// Datos del comercio
$apiKey = 'I29W9AhcDED95Gzg80k87YzinF';
$merchantId = 'G8xjCg8EkTIc37s';
$accountId = '1027555';
$refVenta = 'ORD_' . time();  // Referencia única
$valor = "5000"; // Monto en COP
$descripcion = "Servicio automático";

$responseUrl = "https://tuweb.com/respuesta"; // o página de agradecimiento
$confirmUrl = "https://tuweb.com/confirmacion"; // para validar desde PayU

$link = "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu";

// Generar firma
$firma = md5("$apiKey~$merchantId~$refVenta~$valor~COP");

// Construir formulario como string
$formulario = <<<HTML
<form id="form_pago" method="post" action="$link">
  <input name="merchantId"    type="hidden"  value="$merchantId">
  <input name="accountId"     type="hidden"  value="$accountId">
  <input name="description"   type="hidden"  value="$descripcion">
  <input name="referenceCode" type="hidden"  value="$refVenta">
  <input name="amount"        type="hidden"  value="$valor">
  <input name="tax"           type="hidden"  value="0">
  <input name="taxReturnBase" type="hidden"  value="0">
  <input name="currency"      type="hidden"  value="COP">
  <input name="signature"     type="hidden"  value="$firma">
  <input name="test"          type="hidden"  value="1">
  <input name="buyerEmail"    type="hidden"  value="comprador@prueba.com">
  <input name="responseUrl"   type="hidden"  value="$responseUrl">
  <input name="confirmationUrl" type="hidden" value="$confirmUrl">
</form>
<script>
  document.getElementById("form_pago").submit();
</script>
HTML;

// Para ESP, devolver solo el link con ID
echo json_encode([
  'estado' => 'ok',
  'pago_id' => $refVenta,
  'firma' => $firma,
  'monto' => $valor,
  'descripcion' => $descripcion,
  'link_pago' => "https://tuweb.com/pagar.php?id=$refVenta"
]);
