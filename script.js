/* ===================================================
CONFIGURAÇÃO GLOBAL
=================================================== */
let tipoQuentinha = "";
let sacola = [];

const PRECO_P = 18;
const PRECO_G = 22;
const PRECO_CARNE_EXTRA = 8;
const PRECO_OVO = 3;

/* ===================================================
LISTAS
=================================================== */
const carnesLista = [
"Filé de Frango Empanado","Frango Assado","Carré Acebolado",
"Lasanha à Bolonhesa","Estrogonofe de Frango",
"Linguiça Toscana","Escondidinho de Frango",
"Carne Assada","Rocambole"
];

const saladasLista = [
"Alface","Tomate","Pepino","Agrião",
"Macarronese","Cenoura","Beterraba",
"Repolho","Feijão Fradinho"
];

/* ===================================================
TROCAR TELAS
=================================================== */
function trocarTela(id){
 document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
 document.getElementById(id).classList.add("ativa");
 window.scrollTo(0,0);
}

/* ===================================================
MONTAGEM
=================================================== */
function abrirMontagem(tipo){
 tipoQuentinha = tipo;
 trocarTela("telaMontagem");
 carregarOpcoes();
}

function carregarOpcoes(){
 const carnes = document.getElementById("carnes");
 carnes.innerHTML = "<h3>Carnes</h3>";
 carnesLista.forEach(c=>{
   carnes.innerHTML += `
   <label class="check">
     <input type="checkbox" class="carne" value="${c}">
     <span>${c}</span>
   </label>`;
 });

 const saladas = document.getElementById("saladas");
 saladas.innerHTML="";
 saladasLista.forEach(s=>{
   saladas.innerHTML += `
   <label class="check">
     <input type="checkbox" value="${s}">
     <span>${s}</span>
   </label>`;
 });
}

/* ===================================================
SACOLA
=================================================== */
function adicionarSacola(){
 let preco = tipoQuentinha === "P" ? PRECO_P : PRECO_G;
 if(document.getElementById("ovo").checked) preco += PRECO_OVO;
 const carnesSelecionadas = document.querySelectorAll('.carne:checked').length;
 preco += carnesSelecionadas * PRECO_CARNE_EXTRA;

 sacola.push({ tipo: tipoQuentinha, carnes: carnesSelecionadas, valor: preco });
 renderSacola();
 trocarTela("telaSacola");
}

function renderSacola(){
 const lista = document.getElementById("itensSacola");
 lista.innerHTML="";
 let total = 0;
 sacola.forEach((item,i)=>{
   lista.innerHTML += `
   <div class="card sacolaCard">
     <div>
       <b>Quentinha ${item.tipo}</b>
       <p>R$ ${item.valor.toFixed(2)}</p>
     </div>
     <button class="remover" onclick="removerItem(${i})">Remover</button>
   </div>`;
   total += item.valor;
 });
 document.getElementById("total").innerText = "Total: R$ " + total.toFixed(2);
}

function removerItem(i){ sacola.splice(i,1); renderSacola(); }
function voltarMenu(){ trocarTela("telaInicial"); }

/* ===================================================
CLIENTE
=================================================== */
function abrirCadastro(){ trocarTela("telaCadastro"); }

function salvarCliente(){
 const nome = nomeInput("nome");
 const tel = nomeInput("telefone");
 if(!nome || !tel){ alert("Preencha seus dados"); return; }
 localStorage.setItem("cliente", JSON.stringify({nome,tel}));
 trocarTela("telaEndereco");
}

/* ===================================================
ENDEREÇO
=================================================== */
function salvarEndereco(){
 const endereco = {
   rua:nomeInput("rua"),
   numero:nomeInput("numero"),
   bairro:nomeInput("bairro"),
   referencia:nomeInput("referencia")
 };
 if(!endereco.rua || !endereco.numero){ alert("Preencha o endereço"); return; }
 localStorage.setItem("endereco", JSON.stringify(endereco));
 trocarTela("telaPagamento");
}

/* ===================================================
TROCO
=================================================== */
function mostrarTroco(){
 const selecionado = document.querySelector('input[name="pg"]:checked');
 const area = document.getElementById("trocoArea");
 if(selecionado && selecionado.value === "Dinheiro"){
   area.style.display="block";
 } else {
   area.style.display="none";
   esconderCampoTroco();
 }
}

function precisaTroco(sim){
 const campo = document.getElementById("troco");
 if(sim){ campo.style.display="block"; }else{ campo.style.display="none"; campo.value=""; }
}

function esconderCampoTroco(){
 const campo = document.getElementById("troco");
 campo.style.display="none";
 campo.value="";
}

/* ===================================================
FINALIZAR PEDIDO
=================================================== */
function finalizarPedido(){
 const pagamento = document.querySelector('input[name="pg"]:checked');
 if(!pagamento){ alert("Escolha o pagamento"); return; }

 let total=0;
 sacola.forEach(i=>{ total+=i.valor; });

 const cliente = JSON.parse(localStorage.getItem("cliente"));
 const endereco = JSON.parse(localStorage.getItem("endereco"));

 if(pagamento.value==="Pix"){
   fetch("/pedido",{
     method:"POST",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({nome:cliente.nome,telefone:cliente.tel,itens:sacola,total:total,pagamento:"Pix"})
   }).then(res=>res.json())
   .then(data=>{ gerarPix(data.pedidoId,total); });
   return;
 }

 fetch("/pedido",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({nome:cliente.nome,telefone:cliente.tel,itens:sacola,total:total,pagamento:pagamento.value})
 })
 alert("Pedido enviado!");
 localStorage.clear();
 location.reload();
}

/* ===================================================
GERAR PIX
=================================================== */
function gerarPix(pedidoId,total){
 fetch("/criar-pix",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({pedidoId:pedidoId,total:total})
 }).then(res=>res.json())
 .then(data=>{
   document.getElementById("qrcode").src = "data:image/png;base64," + data.qr_code_base64;
   document.getElementById("pixCopia").value = data.pix_copia_cola;
 });
}

/* ===================================================
COPIAR PIX
=================================================== */
function copiarPix(){
 const campo = document.getElementById("pixCopia");
 campo.select();
 document.execCommand("copy");
 alert("Pix copiado!");
}

/* ===================================================
HELPER
=================================================== */
function nomeInput(id){
 const el = document.getElementById(id);
 return el ? el.value.trim() : "";
}