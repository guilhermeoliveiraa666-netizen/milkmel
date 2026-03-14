// server.js - Milk & Mel (VERSÃO ESTÁVEL COPY /B)

const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const { exec } = require("child_process")
const { createClient } = require("@supabase/supabase-js")
const fetch = require("node-fetch"); // para WhatsApp API


// ==========================
// CONFIGURAÇÃO WHATSAPP API MILK & MEL
// ==========================
const WABA_ID = "953543087852153";
const ACCESS_TOKEN = "EAARZCdBjHZAj4BQ2YFSM4DM1Wjck6QmzPrmV4BZBxBdZBr6Yd1VvQHXIaTUxJExLDpMBFeZCA6Knt6yfYsNF92dxlH3SamfGqt1UfuKer55IfUd3JWtrZAYJvLsAIyjWZChD4roGwPoR8TZCS8n3qBmmGKKctkID9QQ6VzxHmz7ZC08fG6Scp4JDqXU1CWXuJU3qfA1l5MMVv0hl020pBOrpIrBSYZAGibLN5zMnmL2emY4l7zsc15Hc4ecAZDZD";

async function enviarPedidoWhatsApp(clienteNumero, pedido) {
    try {
        const itensFormatados = typeof pedido.itens === "string" ? JSON.parse(pedido.itens) : pedido.itens;

        const mensagem = `Vim te avisar que seu pedido foi realizado com sucesso e já está em preparo. 😄

Fique tranquilo(a) que vou enviar as atualizações do status do seu pedido por aqui.

Nº do pedido ${pedido.numero}

Itens: 
${itensFormatados.map(i => `➡ ${i.qtd || 1}x ${i.nome}\n  - ${i.descricao || ""}`).join("\n\n")}

💵 ${pedido.pagamento || "Não informado"}

🕢 Tempo de entrega: 60 - 90min

🛵 Local de entrega: ${pedido.endereco.rua || "-"}, ${pedido.endereco.numero || "-"} - ${pedido.endereco.bairro || "-"}, ${pedido.endereco.cidade || "-"} - ${pedido.endereco.estado || "-"}

Total do pedido: R$ ${Number(pedido.total || 0).toFixed(2)}

Obrigado por escolher o Restaurante MilkMel! 😄

📲 Confira nosso cardápio: https://www.restaurantemilkmel.com.br/
💬 Faça seu pedido pelo WhatsApp: https://wa.me/5521967699911`;

        const body = {
            messaging_product: "whatsapp",
            to: clienteNumero,
            type: "text",
            text: { body: mensagem }
        };

        const response = await fetch(`https://graph.facebook.com/v17.0/${WABA_ID}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log("✅ WhatsApp enviado:", data);
    } catch (err) {
        console.error("❌ Erro ao enviar WhatsApp:", err);
    }
}

const supabase = createClient(
  "https://uqbxohatfsrspptxcvlm.supabase.co",
  "sb_publishable_TEjx8xOxSpT5Gg5anx8N2w_rEjgVeca"
)

const app = express()
// 🔥 REMOVE BARRA FINAL DAS URLs (corrige imagens)
app.use((req, res, next) => {
  if (req.url.length > 1 && req.url.endsWith("/")) {
    req.url = req.url.slice(0, -1)
  }
  next()
})

app.use(cors())
app.use(express.json())

app.use(express.static("public"))

const caminhoTeste = path.join(__dirname, "public/images/banner.jpg")
console.log("🧪 banner existe?", fs.existsSync(caminhoTeste))

// -----------------------------
// BANCO
const db = new sqlite3.Database("./pedidos.db")
db.run(`ALTER TABLE pedidos ADD COLUMN dia TEXT`, (err) => {
  if (err) {
    console.log("Coluna dia já existe ou erro:", err.message)
  } else {
    console.log("✅ Coluna dia criada")
  }
})

// 🔧 GARANTE QUE A COLUNA ENDERECO EXISTE
db.run(`ALTER TABLE pedidos ADD COLUMN endereco TEXT`, (err) => {
  if (err && !err.message.includes("duplicate column")) {
    console.log("Erro ao criar coluna endereco:", err.message)
  } else {
    console.log("✅ Coluna endereco OK")
  }
})

db.run(`
CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT,
  nome TEXT,
  telefone TEXT,
  endereco TEXT,
  itens TEXT,
  total REAL,
  pagamento TEXT,
  status TEXT,
  dia TEXT
)
`)

// -----------------------------
// GERAR NUMERO PEDIDO
function gerarNumeroPedido(cb) {
  const hoje = new Date()
  const data =
    String(hoje.getFullYear()).slice(-2) +
    String(hoje.getMonth() + 1).padStart(2, "0") +
    String(hoje.getDate()).padStart(2, "0")

  db.get(
    "SELECT COUNT(*) as total FROM pedidos WHERE date(criado_em)=date('now')",
    [],
    (err, row) => {
      if (err) return cb(err)
      const seq = String(row.total + 1).padStart(3, "0")
      cb(null, `PD-${data}-${seq}`)
    }
  )
}

// -----------------------------
// FORMATAR ENDEREÇO
function formatarEndereco(e){

  if(!e) return "Endereço não informado\n"

  // RETIRADA
  if(e.retirada === true || e.rua === "RETIRADA NA LOJA"){
    return "RETIRADA NA LOJA\n"
  }

  let t = ""

  t += `Rua: ${e.rua || "-"}, Nº: ${e.numero || "-"}\n`
  t += `Bairro: ${e.bairro || "-"}\n`

  if(e.referencia)
    t += `Ref: ${e.referencia}\n`

  return t
}

// -----------------------------
// FILA IMPRESSÃO
const fila = []
let imprimindo = false

function processarFila() {
  if (imprimindo || fila.length === 0) return

  imprimindo = true
  const pedido = fila.shift()

  console.log("🖨️ Preparando impressão:", pedido.numero)

  const line = "=============================="
  let texto = ""

  texto += "        MILK & MEL\n"
  texto += "       RESTAURANTE\n"
  texto += line + "\n"
    texto += `PEDIDO: ${pedido.numero}\n`
  texto += line + "\n\n"

  pedido.itens.forEach((i, idx) => {

  texto += "\n"
  texto += "------------------------------\n"
  texto +=  `QUENTINHA ${idx + 1}\n`
  texto += "------------------------------\n"

  if (i.tipo)
    texto += `Tamanho: ${i.tipo}\n`

  // ACOMPANHAMENTOS
  if (i.arroz)
    texto += `Arroz: ${i.arroz}\n`

  if (i.feijao)
    texto += `Feijão: ${i.feijao}\n`

  if (i.macarrao)
    texto += `Macarrão: ${i.macarrao}\n`

  if (i.farofa)
    texto += `Farofa: ${i.farofa}\n`

  // CARNES
  if (i.carnes?.length){
    texto += "\nCarnes:\n"
    i.carnes.forEach(c=>{
      texto += ` - ${c}\n`
    })
  }

  // SALADAS
  if (i.saladas?.length){
    texto += "\nSaladas:\n"
    i.saladas.forEach(s=>{
      texto += ` - ${s}\n`
    })
  }

  // EXTRAS
  if (i.extras?.length){
    texto += "\nExtras:\n"
    i.extras.forEach(e=>{
      texto += ` - ${e}\n`
    })
  }

  if (i.observacao)
    texto += `\nObs: ${i.observacao}\n`

})


  texto += `\nTOTAL: R$ ${pedido.total.toFixed(2)}\n`

  texto += "\nCLIENTE\n"
  texto += `${pedido.nome}\n`
  texto += `${pedido.telefone}\n`

  texto += "\nENDEREÇO\n"
  texto += formatarEndereco(pedido.endereco)

  texto += "\nPagamento: " + pedido.pagamento + "\n"

if(pedido.troco){
  texto += `Troco para: R$ ${pedido.troco}\n`
}

  texto += "\n" + line + "\n"
  texto += "OBRIGADO PELA PREFERÊNCIA!\n"

// avança o papel antes do corte
texto += "\n\n\n\n"

// comando de corte automático (ESC/POS)
texto += "\x1D\x56\x00"

  try {
    const cupomPath = path.join(__dirname, "cupom.txt")

    fs.writeFileSync("cupom.txt", texto, "binary")

    // ⚠️ NOME DO COMPARTILHAMENTO DA IMPRESSORA
    const impressora = "\\\\localhost\\POS-80"

    const cmd = `copy /B "${cupomPath}" "${impressora}"`

    console.log("Executando:", cmd)

    exec(cmd, (err) => {
      if (err) {
        console.error("❌ ERRO IMPRESSÃO:", err)
      } else {
        console.log("✅ IMPRESSO:", pedido.numero)
      }

      imprimindo = false
      processarFila()
    })

  } catch (e) {
    console.error("Erro interno impressão:", e)
    imprimindo = false
  }
}

// -----------------------------
// ROTA PEDIDO
app.post("/pedido", (req, res) => {

  console.log("BODY RECEBIDO:", req.body)
  console.log("📦 Pedido recebido:", req.body)

  const { nome, telefone, endereco, itens, total, pagamento, troco } = req.body

  if (!nome || !telefone || !itens?.length)
    return res.status(400).json({ erro: "Dados inválidos" })

  gerarNumeroPedido((err, numero) => {

    if (err)
      return res.status(500).json({ erro: "Erro número pedido" })

    db.run(
`INSERT INTO pedidos
(nome,telefone,endereco,itens,total,pagamento,status,numero,dia)
VALUES (?,?,?,?,?,?,?,?,?)`,
[
  nome,
  telefone,
  JSON.stringify(endereco || {}),
  JSON.stringify(itens || []),
  Number(total),
  pagamento || "Não informado",
  "pendente",
  numero,
  new Date().toISOString().slice(0,10)
],
function (err) {

        if (err) {
          console.error("❌ ERRO BANCO:", err)
          return res.status(500).json({ erro: "Erro ao salvar pedido" })
        }

        const pedidoSalvo = {
  id: this.lastID,
  numero,
  nome,
  telefone,
  endereco,
  itens,
  total: Number(total),
  pagamento,
  troco
}
        fila.push(pedidoSalvo)
        processarFila()

        // 📲 envia WhatsApp automaticamente para o cliente
enviarPedidoWhatsApp(pedidoSalvo.telefone, pedidoSalvo)

        res.json({ sucesso: true, pedido: pedidoSalvo })
      }
    )
  })
})

app.listen(3000, () =>
  console.log("🚀 Servidor rodando porta 3000")
)

let ultimoPedido = 0

setInterval(async () => {

  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .eq("status", "pendente")
    .order("id", { ascending: true })

  if (error) {
    console.log("❌ Erro buscando pedidos:", error)
    return
  }

  if (data.length > 0) {

    for (const pedido of data) {

      console.log("📦 Novo pedido encontrado:", pedido.numero)

      const pedidoFormatado = {
        id: pedido.id,
        numero: pedido.numero,
        nome: pedido.nome,
        telefone: pedido.telefone,
        endereco: pedido.endereco,
        itens: pedido.itens,
        total: Number(pedido.total),
        pagamento: pedido.pagamento
      }

      fila.push(pedidoFormatado)

      processarFila()

      await supabase
        .from("pedidos")
        .update({ status: "impresso" })
        .eq("id", pedido.id)

    }

  }

}, 2000)