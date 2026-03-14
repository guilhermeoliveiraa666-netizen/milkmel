let tipoQuentinha = "";
let sacola = [];

const PRECO_P = 18;
const PRECO_G = 22;
const PRECO_CARNE_EXTRA = 8;

const carnesLista = [
  "Filé de Frango Empanado",
  "Frango ao Molho c/Quiabo",
  "Carré Acebolado",
  "Lasanha à Bolonhesa",
  "Estrogonofe de Frango",
  "Linguiça Toscana Acebolada",
  "Carne Moída c/cenoura",
  "Escondidinho de batata c/frango",
  "Carne Picadinha ao Molho c/batata",
  "Isca de Fígado Refogado",
  "Moela ao Molho"
];

const saladasLista = [
  "Alface",
  "Tomate",
  "Pepino",
  "Agrião",
  "Macarronese",
  "Cenoura c/chuchu",
  "Beterraba Cozida",
  "Repolho Refogado",
  "Feijão Fradinho"
];

const acompanhamentosLista = [
  "Arroz Branco ou Integral",
  "Macarrão c/Molho de Tomate",
  "Macarrão alho e Óleo",
  "Batata Frita",
  "Farofa",
  "Angu"
];


// ===============================
// TROCAR TELA
// ===============================
function trocarTela(id){

  const tela = document.getElementById(id);
  if(!tela){
    console.error("Tela não encontrada:",id);
    return;
  }

  document.querySelectorAll(".tela").forEach(t=>{
    t.classList.remove("ativa");
  });

  tela.classList.add("ativa");

  const topo = document.querySelector(".topo-inicial");
  if(topo){
    topo.style.display = id === "telaInicial" ? "flex" : "none";
  }

  window.scrollTo(0,0);
}


// ===============================
// ABRIR MONTAGEM
// ===============================
function abrirMontagem(tipo){

  tipoQuentinha = tipo;

  carregarOpcoes();

  trocarTela("telaMontagem");

  console.log("Montagem aberta:",tipo);

}


// ===============================
// CARREGAR OPÇÕES
// ===============================
function carregarOpcoes(){

  // CARNES
  const carnes = document.getElementById("carnes");
  carnes.innerHTML = "";

  carnesLista.forEach((c)=>{

    carnes.innerHTML += `

<label class="opcao-cardapio">

<div class="opcao-info">
<span class="opcao-titulo">${c}</span>
</div>

<input type="checkbox" class="carne" value="${c}">
<span class="radio-custom"></span>

</label>

`;

  });


  // SALADAS
  const saladas = document.getElementById("saladas");
  saladas.innerHTML = "";

  saladasLista.forEach((s)=>{

    saladas.innerHTML += `

<label class="opcao-cardapio">

<div class="opcao-info">
<span class="opcao-titulo">${s}</span>
</div>

<input type="checkbox" class="salada" value="${s}">
<span class="radio-custom"></span>

</label>

`;

  });


  // ACOMPANHAMENTOS EXTRAS
  const acompExtra = document.getElementById("acompExtra");
  acompExtra.innerHTML = "";

  acompanhamentosLista.forEach((a)=>{

    if([
      "Feijão Preto ou Mulatinho",
      "Arroz Branco ou Integral",
      "Macarrão c/Molho de Tomate",
      "Macarrão alho e Óleo",
      "Farofa"
    ].includes(a)) return;

    acompExtra.innerHTML += `

<label class="opcao-cardapio">

<div class="opcao-info">
<span class="opcao-titulo">${a}</span>
</div>

<input type="checkbox" class="acompExtra" value="${a}">
<span class="radio-custom"></span>

</label>

`;

  });

}



// ===============================
// ADICIONAR À SACOLA
// ===============================
function adicionarSacola(){

  let preco = tipoQuentinha === "P" ? PRECO_P : PRECO_G;


  // CARNES
  const carnesSelecionadas = [];

  document.querySelectorAll(".carne:checked").forEach((c,idx)=>{

    const limite = tipoQuentinha === "P" ? 1 : 2;

    if(idx >= limite){
      preco += PRECO_CARNE_EXTRA;
    }

    carnesSelecionadas.push(c.value);

  });


  // SALADAS
  const saladasSelecionadas = [];

  document.querySelectorAll(".salada:checked").forEach(s=>{
    saladasSelecionadas.push(s.value);
  });


  // ACOMPANHAMENTOS INCLUSOS
  const acompInclusos = [];

  const arroz = document.querySelector('input[name="arroz"]:checked');
  if(arroz) acompInclusos.push(arroz.value);

  const feijao = document.querySelector('input[name="feijao"]:checked');
  if(feijao) acompInclusos.push(feijao.value);

  const macarrao = document.querySelector('input[name="macarrao"]:checked');
  if(macarrao) acompInclusos.push(macarrao.value);

  const farofa = document.querySelector('input[name="farofa"]:checked');
  if(farofa) acompInclusos.push(farofa.value);


  // ACOMPANHAMENTOS EXTRAS
  const acompSelecionados = [];

  const limiteAcomp = tipoQuentinha === "P" ? 1 : 2;

  let count = 0;

  document.querySelectorAll(".acompExtra:checked").forEach(a=>{

    if(count < limiteAcomp){

      acompSelecionados.push(a.value);

      count++;

    }

  });


  // OBSERVAÇÃO
  const obs = document.getElementById("obs").value.trim();


  sacola.push({

    tipo: tipoQuentinha,

    carnes: carnesSelecionadas,

    saladas: saladasSelecionadas,

    acompanhamentos: [...acompInclusos,...acompSelecionados],

    observacao: obs,

    valor: preco

  });


  renderSacola();

  trocarTela("telaSacola");

}



// ===============================
// RENDER SACOLA
// ===============================
function renderSacola(){

  const lista = document.getElementById("itensSacola");

  lista.innerHTML = "";

  let total = 0;


  sacola.forEach((item,i)=>{

    lista.innerHTML += `

<div class="card sacolaCard">

<div>

<b>Quentinha ${item.tipo}</b>

<p>R$ ${item.valor.toFixed(2)}</p>

</div>

<p>Carnes: ${item.carnes.join(", ")}</p>

<p>Saladas: ${item.saladas.join(", ")}</p>

<p>Acompanhamentos: ${item.acompanhamentos.join(", ")}</p>

${item.observacao ? `<p>Observação: ${item.observacao}</p>` : ""}

<button onclick="removerItem(${i})">Remover</button>

</div>

`;

    total += item.valor;

  });


  document.getElementById("total").innerText = "Total: R$ " + total.toFixed(2);

}



// ===============================
// REMOVER ITEM
// ===============================
function removerItem(i){

  sacola.splice(i,1);

  renderSacola();

}



// ===============================
// CADASTRO
// ===============================
function abrirCadastro(){

  trocarTela("telaCadastro");

}


function salvarCliente(){

  const nome = document.getElementById("nome").value.trim();

  const tel = document.getElementById("telefone").value.trim();


  if(!nome || !tel){

    alert("Preencha seus dados");

    return;

  }


  localStorage.setItem("cliente",JSON.stringify({nome,tel}));

  trocarTela("telaTipoEntrega")

}

// ===============================
// ENDEREÇO (VERSÃO LIMPA)
// ===============================

// guarda o tipo escolhido
let tipoEntrega = "entrega"


// chamada quando escolhe ENTREGA ou RETIRADA
function escolherEntrega(tipo){

  tipoEntrega = tipo

  // RETIRADA → pula endereço
  if(tipo === "retirada"){

    localStorage.setItem("endereco", JSON.stringify({
      retirada: true,
      rua: "RETIRADA NA LOJA",
      numero: "",
      bairro: "",
      referencia: ""
    }))

    trocarTela("telaPagamento")
    return
  }

  // ENTREGA → abre tela endereço
  trocarTela("telaEndereco")
}



// salvar endereço (somente entrega)
function salvarEndereco(){

  const rua = document.getElementById("rua").value.trim()
  const numero = document.getElementById("numero").value.trim()
  const bairro = document.getElementById("bairro").value.trim()
  const referencia = document.getElementById("referencia").value.trim()

  // validação
  if(!rua || !numero){
    alert("Preencha rua e número")
    return
  }

  const endereco = {
    retirada:false,
    rua,
    numero,
    bairro,
    referencia
  }

  localStorage.setItem("endereco", JSON.stringify(endereco))

  trocarTela("telaPagamento")
}

// ===============================
// TROCO
// ===============================
function mostrarTroco(){

  const pg = document.querySelector('input[name="pg"]:checked');

  const trocoArea = document.getElementById("trocoArea");


  if(pg && pg.value === "Dinheiro"){

    trocoArea.style.display = "block";

  }

  else{

    trocoArea.style.display = "none";

    document.getElementById("troco").style.display = "none";

  }

}


function precisaTroco(sim){

  const trocoInput = document.getElementById("troco");

  if(sim){

    trocoInput.style.display = "block";

  }

  else{

    trocoInput.style.display = "none";

    trocoInput.value = "";

  }

}



// ===============================
// FINALIZAR PEDIDO
// ===============================
function finalizarPedido(){

  const pagamento = document.querySelector('input[name="pg"]:checked');

  const troco = document.getElementById("troco").value.trim();


  if(!pagamento){

    alert("Escolha o pagamento");

    return;

  }

  // ===============================
// ENTREGA OU RETIRADA
// ===============================

let tipoEntrega = "entrega";

function selecionarEntrega(tipo, botao){

  tipoEntrega = tipo;

  // ativa visual botão
  document.querySelectorAll(".btn-acomp").forEach(b=>{
    b.classList.remove("ativo");
  });

  botao.classList.add("ativo");

  const area = document.getElementById("areaEndereco");

  if(tipo === "retirada"){
    area.style.display = "none";
  }else{
    area.style.display = "block";
  }

}

  const cliente = JSON.parse(localStorage.getItem("cliente"));

  const endereco = JSON.parse(localStorage.getItem("endereco"));


  if(!cliente || !endereco){

    alert("Dados do cliente ou endereço não encontrados");

    return;

  }


  let total = sacola.reduce((acc,item)=>acc+item.valor,0);


  const pedido = {

    nome: cliente.nome,

    telefone: cliente.tel,

    endereco: endereco,

    itens: sacola,

    total: total,

    pagamento: pagamento.value,

    troco: troco || null

  };


  fetch("https://nonperceptible-nonpredatory-chaim.ngrok-free.dev/pedido",{

    method:"POST",

    headers:{"Content-Type":"application/json"},

    body: JSON.stringify(pedido)

  })

  .then(res=>res.json())

  .then(data=>{

    if(data.sucesso){

      alert("✅ Pedido enviado com sucesso!\nNúmero: " + data.pedido.numero);

      sacola=[];

      renderSacola();

      localStorage.removeItem("cliente");

      localStorage.removeItem("endereco");

      trocarTela("telaConfirmacao");

    }

    else{

      alert("❌ Erro ao enviar pedido");

    }

  })

  .catch(err=>{

    console.error(err);

    alert("❌ Falha na conexão");

  });

}
