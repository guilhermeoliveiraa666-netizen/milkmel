const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const cors = require("cors")
const path = require("path")
const mercadopago = require("mercadopago")
const { ThermalPrinter, PrinterTypes } = require("node-thermal-printer")

// ============================
// CONFIG MERCADO PAGO
// ============================

mercadopago.configure({
  access_token: "APP_USR-6265123252505565-030507-ebdb6e1b198a279ca67a7feae9d506fd-2704546523"
})

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(__dirname))

// ============================
// BANCO SQLITE
// ============================

const db = new sqlite3.Database("./pedidos.db")

db.serialize(() => {

db.run(`
CREATE TABLE IF NOT EXISTS pedidos (
id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT,
telefone TEXT,
itens TEXT,
total REAL,
pagamento TEXT,
status TEXT,
criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
)
`)

})

// ============================
// HORARIO RESTAURANTE
// ============================

function restauranteAberto(){

const agora = new Date()

const totalMin = agora.getHours() * 60 + agora.getMinutes()

const abertura = 10 * 60 + 30
const fechamento = 15 * 60 + 20

return totalMin >= abertura && totalMin <= fechamento

}

// ============================
// CONFIG IMPRESSORA
// ============================

const printer = new ThermalPrinter({

type: PrinterTypes.EPSON,

interface: "printer:Generic / Text Only",

options: { timeout: 5000 }

})

async function imprimirPedido(pedido){

try{

printer.clear()

printer.println("RESTAURANTE MILK & MEL");
printer.println("---------------------");

printer.println("Pedido: " + (pedido.id || "N/A"));
printer.println("Cliente: " + pedido.nome);
printer.println("Telefone: " + pedido.telefone);


printer.println("---------------------")

const itens = typeof pedido.itens === "string"
? JSON.parse(pedido.itens)
: pedido.itens

itens.forEach(item => {

printer.println("Quentinha " + item.tipo + " - R$ " + item.valor)

})

printer.println("---------------------")

printer.println("Pagamento: " + pedido.pagamento)

printer.println("---------------------")

printer.println("Obrigado pela preferencia!")

printer.cut()

await printer.execute()

console.log("Pedido impresso")

}catch(err){

console.error("Erro impressora:",err)

}

}

// ============================
// HOME
// ============================

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"index.html"))
})

// ============================
// CRIAR PEDIDO
// ============================

app.post("/pedido",(req,res)=>{

if(!restauranteAberto()){

return res.json({
erro:"Restaurante fechado agora."
})

}

const { nome, telefone, itens, total, pagamento } = req.body

db.run(

"INSERT INTO pedidos (nome,telefone,itens,total,pagamento,status) VALUES (?,?,?,?,?,?)",

[nome,telefone,JSON.stringify(itens),total,pagamento,"pendente"],

function(err){

if(err){

return res.status(500).json({erro:err.message})

}

const pedidoId = this.lastID

console.log("Pedido criado:",pedidoId)

// DINHEIRO OU CARTAO
if(pagamento === "Dinheiro" || pagamento === "Cartão"){

const pedido = {

id:pedidoId,
nome,
telefone,
itens,
pagamento

}

imprimirPedido(pedido)

db.run(
"UPDATE pedidos SET status=? WHERE id=?",
["Pago",pedidoId]
)

}

// PIX
if(pagamento === "Pix"){

return res.json({
pedidoId:pedidoId
})

}

res.json({
sucesso:true,
pedidoId
})

}

)

})

// ============================
// GERAR PIX
// ============================

app.post("/criar-pix",async(req,res)=>{

try{

const { pedidoId,total } = req.body

const pagamento = await mercadopago.payment.create({

transaction_amount:Number(total),

description:"Pedido #" + pedidoId + " Restaurante",

payment_method_id:"pix",

payer:{
email:"cliente@email.com"
},

external_reference:String(pedidoId)

})

const dados = pagamento.body.point_of_interaction.transaction_data

res.json({

qr_code_base64:dados.qr_code_base64,

pix_copia_cola:dados.qr_code

})

}catch(err){

console.error(err)

res.status(500).json({
erro:"Erro gerar pix"
})

}

})

// ============================
// WEBHOOK PIX
// ============================

app.post("/webhook-pix",async(req,res)=>{

try{

const paymentId = req.body.data.id

const pagamento = await mercadopago.payment.findById(paymentId)

if(pagamento.body.status === "approved"){

const pedidoId = pagamento.body.external_reference

db.get(

"SELECT * FROM pedidos WHERE id=?",

[pedidoId],

(err,pedido)=>{

if(pedido){

console.log("PIX aprovado pedido",pedidoId)

db.run(

"UPDATE pedidos SET status=? WHERE id=?",

["Pago",pedidoId]

)

imprimirPedido(pedido)

}

}

)

}

res.sendStatus(200)

}catch(err){

console.log("Erro webhook",err)

res.sendStatus(500)

}

})

// ============================
// TESTE IMPRESSORA
// ============================

app.get("/teste-impressora",async(req,res)=>{

await imprimirPedido({

id:999,

nome:"TESTE",

telefone:"0000",

itens:[
{tipo:"P",valor:18}
],

pagamento:"TESTE"

})

res.send("Impresso")

})

// ============================
// INICIAR SERVER
// ============================

app.listen(3000,()=>{

console.log("Servidor rodando porta 3000")

})