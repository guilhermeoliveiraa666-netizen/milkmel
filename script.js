const app = document.getElementById("app");

let etapa = 1;
let carrinho = [];
let pedidoAtual = null;
let cliente = {};
let endereco = {};

const carnes = [
"Filé de Frango Empanado",
"Frango Assado",
"Carré Acebolado",
"Lasanha à Bolonhesa",
"Estrogonofe de Frango",
"Linguiça Toscana"
];

const acompanhamentos = [
"Feijão Preto",
"Feijão Mulatinho",
"Arroz Branco",
"Arroz Integral",
"Macarrão",
"Batata Frita",
"Farofa"
];

function render(){
  if(etapa===1) telaInicial();
  if(etapa===2) telaMontagem();
  if(etapa===3) telaSacola();
  if(etapa===4) telaCliente();
  if(etapa===5) telaEndereco();
  if(etapa===6) telaPagamento();
  if(etapa===7) telaConfirmacao();
}

function telaInicial(){
  app.innerHTML = `
    <div class="card">
      <h2>Quentinha P</h2>
      <div class="price">R$ 18,00</div>
      <button class="btn" onclick="iniciarPedido('P',18)">Escolher</button>
    </div>

    <div class="card">
      <h2>Quentinha G</h2>
      <div class="price">R$ 22,00</div>
      <button class="btn" onclick="iniciarPedido('G',22)">Escolher</button>
    </div>
  `;
}

function iniciarPedido(tipo,preco){
  pedidoAtual = {
    tipo,
    precoBase:preco,
    carnes:[],
    saladas:[],
    obs:"",
    total:preco
  };
  etapa = 2;
  render();
}

function telaMontagem(){

  let limiteCarnes = pedidoAtual.tipo==="P"?1:2;
  let total = calcularTotal();

  app.innerHTML = `
    <div class="card">
      <h2>Monte sua Quentinha ${pedidoAtual.tipo}</h2>
      <small>Inclui ${limiteCarnes} carne(s) grátis • Extra +R$8</small>

      <h3 style="margin-top:15px">Carnes</h3>
      ${carnes.map(c=>`
        <div class="option-item" onclick="toggleCarne('${c}')">
          <span>${c}</span>
          <div class="check-box ${pedidoAtual.carnes.includes(c)?"active":""}"></div>
        </div>
      `).join("")}
    </div>

    <div class="card">
      <h3>Escolha até 3 acompanhamentos</h3>
      ${acompanhamentos.map(a=>{
        let bloqueado = !pedidoAtual.saladas.includes(a) && pedidoAtual.saladas.length>=3;
        return `
          <div class="option-item"
               style="${bloqueado?'opacity:0.4;pointer-events:none;':''}"
               onclick="toggleSalada('${a}')">
            <span>${a}</span>
            <div class="check-box ${pedidoAtual.saladas.includes(a)?"active":""}"></div>
          </div>
        `;
      }).join("")}
    </div>

    <div class="card">
      <h3>Observação</h3>
      <textarea id="obs" placeholder="Ex: sem cebola, bem passado..."
        style="width:100%;padding:10px;border-radius:10px;border:1px solid #ccc;"></textarea>
    </div>

    <div class="total-box">
      <strong>Total: R$ ${total}</strong>
      <button class="btn" onclick="adicionarCarrinho()">Adicionar à Sacola</button>
    </div>
  `;
}

function toggleCarne(c){
  if(pedidoAtual.carnes.includes(c)){
    pedidoAtual.carnes = pedidoAtual.carnes.filter(x=>x!==c);
  }else{
    pedidoAtual.carnes.push(c);
  }
  render();
}

function toggleSalada(a){
  if(pedidoAtual.saladas.includes(a)){
    pedidoAtual.saladas = pedidoAtual.saladas.filter(x=>x!==a);
  }else if(pedidoAtual.saladas.length<3){
    pedidoAtual.saladas.push(a);
  }
  render();
}

function calcularTotal(){
  let limite = pedidoAtual.tipo==="P"?1:2;
  let total = pedidoAtual.precoBase;
  if(pedidoAtual.carnes.length>limite){
    total += (pedidoAtual.carnes.length-limite)*8;
  }
  pedidoAtual.total = total;
  return total;
}

function adicionarCarrinho(){
  pedidoAtual.obs = document.getElementById("obs").value;
  carrinho.push({...pedidoAtual});
  etapa=3;
  render();
}

function telaSacola(){
  let totalGeral = carrinho.reduce((acc,i)=>acc+i.total,0);

  app.innerHTML = `
    <div class="card">
      <h2>Sacola</h2>
      ${carrinho.map((i,index)=>`
        <div style="margin-bottom:20px">
          <strong>Quentinha ${i.tipo}</strong>
          <p><b>Carnes:</b> ${i.carnes.join(", ")}</p>
          <p><b>Acompanhamentos:</b> ${i.saladas.join(", ")}</p>
          ${i.obs?`<p><b>Obs:</b> ${i.obs}</p>`:""}
          <p><b>Total:</b> R$ ${i.total}</p>
          <button class="btn" onclick="removerItem(${index})">Remover</button>
        </div>
      `).join("")}

      <h3>Total Geral: R$ ${totalGeral}</h3>
      <button class="btn" onclick="etapa=1;render()">Adicionar mais itens</button>
      <button class="btn" onclick="etapa=4;render()">Continuar</button>
    </div>
  `;
}

function removerItem(i){
  carrinho.splice(i,1);
  render();
}

function telaCliente(){
  app.innerHTML=`
    <div class="card">
      <h2>Seus dados</h2>
      <input id="nome" placeholder="Nome">
      <input id="tel" placeholder="Telefone">
      <button class="btn" onclick="salvarCliente()">Avançar</button>
    </div>
  `;
}

function salvarCliente(){
  cliente.nome=nome.value;
  cliente.tel=tel.value;
  etapa=5;
  render();
}

function telaEndereco(){
  app.innerHTML=`
    <div class="card">
      <h2>Endereço</h2>
      <input id="rua" placeholder="Rua">
      <input id="numero" placeholder="Número">
      <input id="bairro" placeholder="Bairro">
      <input id="complemento" placeholder="Complemento">
      <button class="btn" onclick="salvarEndereco()">Avançar</button>
    </div>
  `;
}

function salvarEndereco(){
  endereco.rua=rua.value;
  endereco.numero=numero.value;
  endereco.bairro=bairro.value;
  endereco.complemento=complemento.value;
  etapa=6;
  render();
}

function telaPagamento(){
  app.innerHTML=`
    <div class="card">
      <h2>Pagamento</h2>
      <select id="pag" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ccc;">
        <option>Dinheiro</option>
        <option>Crédito</option>
        <option>Débito</option>
        <option>Pix</option>
      </select>
      <button class="btn" onclick="finalizar()">Finalizar Pedido</button>
    </div>
  `;
}

function finalizar(){
  etapa=7;
  render();
}

function telaConfirmacao(){
  app.innerHTML=`
    <div class="card">
      <h2>Pedido Confirmado 🎉</h2>
      <p>Obrigado ${cliente.nome}</p>
      <p>Entraremos em contato pelo WhatsApp.</p>
    </div>
  `;
}

render();