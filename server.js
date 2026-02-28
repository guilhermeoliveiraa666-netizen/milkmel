const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let pedidos = [];

app.post("/pedido", (req, res) => {
  const pedido = req.body;
  pedidos.push(pedido);

  console.log("NOVO PEDIDO:");
  console.log(JSON.stringify(pedido, null, 2));

  res.json({ sucesso: true });
});

app.get("/admin/pedidos", (req, res) => {
  res.json(pedidos);
});

app.listen(3000, () => {
  console.log("🔥 Servidor rodando na porta 3000");
});