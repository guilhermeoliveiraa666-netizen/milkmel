const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path"); // ✅ ADICIONADO

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ SERVIR HTML, CSS e JS
app.use(express.static(__dirname));

// ✅ ROTA PRINCIPAL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const db = new sqlite3.Database("./pedidos.db");

// Criar tabela se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      telefone TEXT,
      itens TEXT,
      pagamento TEXT,
      status TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});


// 📌 Horário de funcionamento
function restauranteAberto() {
  const agora = new Date();
  const hora = agora.getHours();
  const minuto = agora.getMinutes();
  const totalMin = hora * 60 + minuto;

  const abertura = 11 * 60;        // 11:00
  const fechamento = 15 * 60 + 30; // 15:30

  return totalMin >= abertura && totalMin <= fechamento;
}


// 🚀 Criar pedido
app.post("/pedido", (req, res) => {
  if (!restauranteAberto()) {
    return res.json({ erro: "Restaurante fechado no momento." });
  }

  const { nome, telefone, itens, pagamento } = req.body;

  db.run(
    "INSERT INTO pedidos (nome, telefone, itens, pagamento, status) VALUES (?, ?, ?, ?, ?)",
    [nome, telefone, JSON.stringify(itens), pagamento, "Confirmado"],
    function (err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }

      res.json({ sucesso: true, pedidoId: this.lastID });
    }
  );
});


// 📌 Listar pedidos (admin)
app.get("/admin/pedidos", (req, res) => {
  db.all("SELECT * FROM pedidos ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});


// 📌 Atualizar status
app.post("/admin/status", (req, res) => {
  const { id, status } = req.body;

  db.run(
    "UPDATE pedidos SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ erro: err.message });

      res.json({ sucesso: true });
    }
  );
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000 🚀");
})