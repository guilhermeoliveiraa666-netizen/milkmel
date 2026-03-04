// mercadopago.js

import mercadopago from "mercadopago";

// =============================
// CONFIGURAÇÃO MERCADO PAGO
// =============================

// COLE SEU ACCESS TOKEN AQUI (AMANHÃ VOCÊ TROCA)
mercadopago.configure({
  access_token: "TEST-SEU-TOKEN-AQUI"
});

// =============================
// CRIAR PIX
// =============================

export async function criarPagamentoPix(valor, descricao) {
  try {

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: descricao,
      payment_method_id: "pix",
      payer: {
        email: "cliente@email.com"
      }
    });

    return {
      id: pagamento.body.id,
      qr_code: pagamento.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64:
        pagamento.body.point_of_interaction.transaction_data.qr_code_base64
    };

  } catch (erro) {
    console.log("Erro Mercado Pago:", erro);
    throw erro;
  }
}