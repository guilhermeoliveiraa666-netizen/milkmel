const { ThermalPrinter, PrinterTypes } = require("node-thermal-printer");

async function imprimirPedido(pedido) {

  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: "printer:KP-IM602", // Nome exato confirmado
    options: { timeout: 5000 }
  });

  // Fallback automático se o nome exato não for reconhecido
  let conectado = await printer.isPrinterConnected();
  if (!conectado) {
    console.log("Não achou a KP-IM602, tentando printer:auto...");
    printer.interface = "printer:auto";
    conectado = await printer.isPrinterConnected();
    if (!conectado) {
      console.log("Impressora realmente não encontrada");
      return;
    }
  }

  try {
    printer.alignCenter();
    printer.println("BRENDI LANCHES");
    printer.println("--------------------------------");

    printer.alignLeft();
    printer.println("Pedido: " + pedido.codigo);
    printer.println("Cliente: " + pedido.nome);
    printer.println("Telefone: " + pedido.telefone);

    printer.println("--------------------------------");
    printer.println("PRODUTOS:");

    for (const p of pedido.produtos) {
      printer.println(p.qtd + "x " + p.nome);
    }

    printer.println("--------------------------------");
    printer.println("Entrega: R$ " + pedido.taxa);
    printer.println("TOTAL: R$ " + pedido.total);

    printer.println("--------------------------------");
    printer.println("Endereco:");
    printer.println(pedido.rua + ", " + pedido.numero);
    printer.println("Bairro: " + pedido.bairro);
    printer.println("Ref: " + pedido.referencia);

    printer.println("--------------------------------");
    printer.alignCenter();
    printer.println("Pedido confirmado");
    printer.println(new Date().toLocaleString());

    printer.cut();

    await printer.execute();

    console.log("Impresso com sucesso");

  } catch (erro) {
    console.log("Erro ao imprimir:", erro);
  }
}

module.exports = imprimirPedido; 