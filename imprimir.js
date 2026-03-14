const { exec } = require("child_process");
const fs = require("fs");

const conteudo = `
      MILK & MEL
-------------------------
Cliente: Olivia

Pedido:
P - 2 carnes

Total: R$ 34
Pagamento: PIX
-------------------------
Obrigado!
`;

fs.writeFileSync("cupom.txt", conteudo);

exec('copy /b cupom.txt "\\\\localhost\\POS-80"', (err) => {
  if (err) {
    console.log("Erro ao imprimir:", err);
  } else {
    console.log("Cupom enviado para impressora!");
  }
});