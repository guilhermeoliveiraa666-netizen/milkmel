let tipoQuentinha="";
let carneExtra=0;
let sacola=[];

const carnesLista=[
"Filé de Frango Empanado","Frango Assado","Carré Acebolado",
"Lasanha à Bolonhesa","Estrogonofe de Frango",
"Linguiça Toscana","Escondidinho de Frango",
"Carne Assada","Rocambole"
];

const saladasLista=[
"Alface","Tomate","Pepino","Agrião",
"Macarronese","Cenoura","Beterraba",
"Repolho","Feijão Fradinho"
];

function trocarTela(id){
document.querySelectorAll(".tela")
.forEach(t=>t.classList.remove("ativa"));

document.getElementById(id).classList.add("ativa");
window.scrollTo(0,0);
}

// ---------- MONTAGEM ----------
function abrirMontagem(tipo){
tipoQuentinha=tipo;
carneExtra=0;
trocarTela("telaMontagem");
carregarOpcoes();
}

function carregarOpcoes(){

const carnes=document.getElementById("carnes");
carnes.innerHTML="<h3>Carnes</h3>";

carnesLista.forEach(c=>{
carnes.innerHTML+=`
<label class="check">
<input type="checkbox" value="${c}">
<span>${c}</span>
</label>`;
});

const saladas=document.getElementById("saladas");
saladas.innerHTML="";

saladasLista.forEach(s=>{
saladas.innerHTML+=`
<label class="check">
<input type="checkbox" value="${s}">
<span>${s}</span>
</label>`;
});
}

function addCarneExtra(){
carneExtra++;
alert("Carne extra adicionada");
}

// ---------- SACOLA ----------
function adicionarSacola(){

let preco= tipoQuentinha==="P"?18:22;

if(document.getElementById("ovo").checked)
preco+=3;

preco+=carneExtra*8;

sacola.push({tipo:tipoQuentinha,valor:preco});

renderSacola();
trocarTela("telaSacola");
}

function renderSacola(){

const lista=document.getElementById("itensSacola");
lista.innerHTML="";
let total=0;

sacola.forEach((item,i)=>{

lista.innerHTML+=`
<div class="card sacolaCard">
<div>
<b>Quentinha ${item.tipo}</b>
<p>R$ ${item.valor.toFixed(2)}</p>
</div>
<button class="remover" onclick="removerItem(${i})">Remover</button>
</div>`;

total+=item.valor;
});

document.getElementById("total").innerText=
"Total: R$ "+total.toFixed(2);
}

function removerItem(i){
sacola.splice(i,1);
renderSacola();
}

function voltarMenu(){
trocarTela("telaInicial");
}

// ---------- CLIENTE ----------
function abrirCadastro(){
trocarTela("telaCadastro");
}

function salvarCliente(){

const nome=nomeInput("nome");
const tel=nomeInput("telefone");

if(!nome||!tel){
alert("Preencha seus dados");
return;
}

localStorage.setItem("cliente",
JSON.stringify({nome,tel}));

trocarTela("telaEndereco");
}

// ---------- ENDEREÇO ----------
function salvarEndereco(){

const endereco={
rua:nomeInput("rua"),
numero:nomeInput("numero"),
bairro:nomeInput("bairro"),
referencia:nomeInput("referencia")
};

if(!endereco.rua||!endereco.numero){
alert("Preencha o endereço");
return;
}

localStorage.setItem("endereco",JSON.stringify(endereco));

trocarTela("telaPagamento");
}

// ---------- PAGAMENTO ----------
function mostrarTroco(){
const dinheiro=document.getElementById("pgDinheiro");
document.getElementById("trocoArea").style.display=
dinheiro.checked?"block":"none";
}

// ---------- FINALIZAR ----------
function finalizarPedido(){

const pagamento=
document.querySelector('input[name="pg"]:checked');

if(!pagamento){
alert("Escolha o pagamento");
return;
}

const pedido={
cliente:JSON.parse(localStorage.getItem("cliente")),
endereco:JSON.parse(localStorage.getItem("endereco")),
itens:sacola,
pagamento:pagamento.value
};

console.log("PEDIDO:",pedido);

alert("Pedido enviado com sucesso!");

localStorage.clear();
location.reload();
}

// helper
function nomeInput(id){
return document.getElementById(id).value.trim();
}