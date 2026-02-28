let cart = [];
let total = 0;
let selectedDelivery = "";
let selectedPayment = "";
let orderNumber = localStorage.getItem("orderNumber")
  ? parseInt(localStorage.getItem("orderNumber"))
  : 1;

// ===== ADICIONAR AO CARRINHO =====
function addToCart(name, price) {
  cart.push({ name, price });
  total += price;

  updateCart();
}

// ===== ATUALIZAR CARRINHO =====
function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const totalSpan = document.getElementById("total");
function fecharCarrinho() {
  document.getElementById("cart").classList.remove("active");
}
  cartItems.innerHTML = "";

  cart.forEach((item, index) => {
    cartItems.innerHTML += `
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span>${item.name}</span>
        <span>R$ ${item.price}</span>
      </div>
    `;
  });

  cartCount.innerText = cart.length;
  totalSpan.innerText = total.toFixed(2);

  if (cart.length > 0) {
    document.getElementById("cart").classList.add("active");
  }
}

// ===== ABRIR CHECKOUT =====
function openCheckout() {
  document.getElementById("checkout").classList.add("active");
}

// ===== ESCOLHER ENTREGA =====
function selectDelivery(type) {
  selectedDelivery = type;

  document
    .querySelectorAll(".delivery-options button")
    .forEach(btn => btn.classList.remove("selected"));

  event.target.classList.add("selected");

  validateForm();
}

// ===== ESCOLHER PAGAMENTO =====
function selectPayment(type) {
  selectedPayment = type;

  document
    .querySelectorAll(".payment-options button")
    .forEach(btn => btn.classList.remove("selected"));

  event.target.classList.add("selected");

  validateForm();
}

// ===== VALIDAÇÃO =====
document.getElementById("name").addEventListener("input", saveUser);
document.getElementById("phone").addEventListener("input", saveUser);
document.getElementById("address").addEventListener("input", validateForm);

function saveUser() {
  localStorage.setItem("userName", document.getElementById("name").value);
  localStorage.setItem("userPhone", document.getElementById("phone").value);
  validateForm();
}

// Carregar dados salvos
window.onload = function () {
  const savedName = localStorage.getItem("userName");
  const savedPhone = localStorage.getItem("userPhone");

  if (savedName) document.getElementById("name").value = savedName;
  if (savedPhone) document.getElementById("phone").value = savedPhone;
};

function validateForm() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const confirmBtn = document.getElementById("confirmButton");

  if (
    name !== "" &&
    phone !== "" &&
    selectedDelivery !== "" &&
    selectedPayment !== "" &&
    (selectedDelivery === "Retirada" || address !== "")
  ) {
    confirmBtn.classList.add("active");
    confirmBtn.disabled = false;
  } else {
    confirmBtn.classList.remove("active");
    confirmBtn.disabled = true;
  }
}

// ===== CONFIRMAR PEDIDO =====
function confirmOrder() {
  orderNumber++;
  localStorage.setItem("orderNumber", orderNumber);

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  let itemsText = "";
  cart.forEach(item => {
    itemsText += `- ${item.name} (R$ ${item.price})\n`;
  });

  const message = `
🧾 Pedido Nº ${orderNumber}
🐝 Milk & Mel

Nome: ${name}
Telefone: ${phone}
Entrega: ${selectedDelivery}
Endereço: ${address || "Retirada no local"}
Pagamento: ${selectedPayment}

Itens:
${itemsText}

Total: R$ ${total.toFixed(2)}
`;

  const encodedMessage = encodeURIComponent(message);

  // ===== WHATSAPP =====
  window.open(`https://wa.me/55SEUNUMEROAQUI?text=${encodedMessage}`);

  // ===== RESETAR CARRINHO =====
  cart = [];
  total = 0;
  updateCart();
  alert("Pedido enviado com sucesso!");
}const carnesLista = [
  "Filé de Frango Empanado",
  "Frango Assado",
  "Carré Acebolado",
  "Lasanha à Bolonhesa",
  "Estrogonofe de Frango",
  "Linguiça"
];

const acompanhamentosLista = [
  "Feijão Preto",
  "Feijão Mulatinho",
  "Arroz Branco",
  "Arroz Integral",
  "Macarrão",
  "Batata Frita",
  "Farofa",
  "Feijoada",
  "Farofa de Cuscuz",
  "Feijão Tropeiro",
  "Couve Mineira"
];

let tipoAtual = "";
let limiteCarnes = 1;

function abrirQuentinha(tipo) {
  tipoAtual = tipo;

  if (tipo === "P") {
    limiteCarnes = 1;
    document.getElementById("tipoQuentinha").innerText =
      "QUENTINHA P - R$ 18,00";
  } else {
    limiteCarnes = 2;
    document.getElementById("tipoQuentinha").innerText =
      "QUENTINHA G - R$ 22,00";
  }

  renderizarOpcoes();
  document.getElementById("modalQuentinha").style.display = "flex";
}

function fecharModal() {
  document.getElementById("modalQuentinha").style.display = "none";
}

function renderizarOpcoes() {
  const carnesDiv = document.getElementById("carnes");
  const acompDiv = document.getElementById("acompanhamentos");

  carnesDiv.innerHTML = "";
  acompDiv.innerHTML = "";

  carnesLista.forEach(item => {
    carnesDiv.innerHTML += `
      <label>
        <input type="checkbox" class="carne" value="${item}">
        ${item}
      </label><br>
    `;
  });

  acompanhamentosLista.forEach(item => {
    acompDiv.innerHTML += `
      <label>
        <input type="checkbox" class="acomp" value="${item}">
        ${item}
      </label><br>
    `;
  });
}

function confirmarQuentinha() {
  const carnesSelecionadas = document.querySelectorAll(".carne:checked");
  const acompanhamentosSelecionados =
    document.querySelectorAll(".acomp:checked");

  if (acompanhamentosSelecionados.length < 3) {
    alert("Escolha pelo menos 3 acompanhamentos");
    return;
  }

  let preco = tipoAtual === "P" ? 18 : 22;

  if (carnesSelecionadas.length > limiteCarnes) {
    const extras = carnesSelecionadas.length - limiteCarnes;
    preco += extras * 8;
  }

  let descricao = `Quentinha ${tipoAtual}\n`;

  carnesSelecionadas.forEach(c => {
    descricao += `Carne: ${c.value}\n`;
  });

  acompanhamentosSelecionados.forEach(a => {
    descricao += `Acomp: ${a.value}\n`;
  });

  cart.push({ name: descricao, price: preco });
  total += preco;

  updateCart();
  fecharModal();
}