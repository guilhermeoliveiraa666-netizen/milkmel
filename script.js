// ===== CONFIGURAÇÃO =====

// COLOCA TRUE PRA FORÇAR ABERTO
const admin = true;

// Horário normal
const horaAbertura = 11;
const minutoAbertura = 0;

const horaFechamento = 15;
const minutoFechamento = 30;


// ===== FUNÇÃO HORÁRIO =====

function verificarHorario() {

    const statusDiv = document.querySelector(".status");
    const botao = document.querySelector(".btn");

    // SE FOR ADMIN → SEMPRE ABERTO
    if (admin === true) {
        statusDiv.textContent = "Modo ADMIN - Sempre Aberto";
        statusDiv.style.background = "#e8fff5";
        statusDiv.style.color = "#00a86b";
        botao.disabled = false;
        botao.style.opacity = "1";
        return;
    }

    const agora = new Date();
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();

    const aberto =
        (horaAtual > horaAbertura || 
        (horaAtual === horaAbertura && minutoAtual >= minutoAbertura)) &&
        (horaAtual < horaFechamento || 
        (horaAtual === horaFechamento && minutoAtual <= minutoFechamento));

    if (aberto) {
        statusDiv.textContent = "Estamos Abertos";
        statusDiv.style.background = "#e8fff5";
        statusDiv.style.color = "#00a86b";
        botao.disabled = false;
        botao.style.opacity = "1";
    } else {
        statusDiv.textContent = "Estamos Fechados";
        statusDiv.style.background = "#ffe6e6";
        statusDiv.style.color = "#c0392b";
        botao.disabled = true;
        botao.style.opacity = "0.6";
    }
}


// ===== INICIAR =====

document.addEventListener("DOMContentLoaded", function () {

    verificarHorario();
    setInterval(verificarHorario, 60000);

    const botao = document.querySelector(".btn");

    botao.addEventListener("click", function () {

        if (botao.disabled) {
            alert("Estamos fechados! Funcionamos das 11:00 às 15:30.");
        } else {
            alert("Pedido adicionado com sucesso!");
        }

    });

});