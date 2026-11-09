// Configuração fixa do estudante (Turma 8B, Chamada 18)
const CONFIG_ALUNO = {
  turma: "8B",
  numeroChamada: 18,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Variável em memória para guardar o PIN durante a sessão (nunca salva no localStorage/sessionStorage)
let pinSessao = "";

// Dados fictícios padronizados do 8º Ano (Dados Brutos Locais)
let dadosBoletim = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

/**
 * Função para normalizar notas antigas/locais na escala de 0 a 10
 */
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  if (typeof valor === 'string') {
    valor = valor.replace(',', '.');
  }
  const numero = parseFloat(valor);
  if (isNaN(numero)) {
    return null;
  }
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }
  return null;
}

/**
 * Função para formatar o texto da nota na tabela
 */
function formatarNotaExibicao(nota) {
  if (nota === null || nota === undefined) {
    return "—";
  }
  const n = typeof nota === "number" ? nota : parseFloat(String(nota).replace(',', '.'));
  if (isNaN(n)) return "—";
  return n.toFixed(1).replace('.', ',');
}

/**
 * Normaliza os dados vindos da API para a estrutura interna
 */
function normalizarDadosAPI(dadosAPI) {
  if (!dadosAPI || !Array.isArray(dadosAPI.disciplinas)) {
    return;
  }
  dadosBoletim = dadosAPI.disciplinas.map(item => {
    const f1 = (item.faltas && typeof item.faltas[0] === 'number') ? item.faltas[0] : 0;
    const f2 = (item.faltas && typeof item.faltas[1] === 'number') ? item.faltas[1] : 0;
    const f3 = (item.faltas && typeof item.faltas[2] === 'number') ? item.faltas[2] : 0;

    return {
      disciplina: item.disciplina,
      tri1: item.tri1 !== undefined ? item.tri1 : null,
      tri2: item.tri2 !== undefined ? item.tri2 : null,
      tri3: item.tri3 !== undefined ? item.tri3 : null,
      faltas: [f1, f2, f3]
    };
  });
}

/**
 * Função principal que calcula os dados e preenche a página
 */
function renderizarBoletim() {
  const tabelaCorpo = document.getElementById("tabela-corpo");
  if (!tabelaCorpo) return;
  tabelaCorpo.innerHTML = ""; // Limpa a tabela antes de reconstruir

  let somaMediasValidas = 0;
  let totalDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let contBomDesempenho = 0;
  let contAtencao = 0;

  dadosBoletim.forEach(item => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    let somaNotas = 0;
    let qtdNotas = 0;

    if (n1 !== null) { somaNotas += n1; qtdNotas++; }
    if (n2 !== null) { somaNotas += n2; qtdNotas++; }
    if (n3 !== null) { somaNotas += n3; qtdNotas++; }

    let media = null;
    let situacao = "Nota ainda não disponível";
    let classeSituacao = "status-indisponivel";

    if (qtdNotas > 0) {
      media = somaNotas / qtdNotas;
      somaMediasValidas += media;
      totalDisciplinasComMedia++;

      if (media >= 6.0) {
        situacao = "Bom desempenho";
        classeSituacao = "status-bom";
        contBomDesempenho++;
      } else {
        situacao = "Atenção";
        classeSituacao = "status-atencao";
        contAtencao++;
      }
    }

    const arrFaltas = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const totalFaltasDisc = arrFaltas.reduce((acc, f) => acc + (Number(f) || 0), 0);
    totalFaltasGeral += totalFaltasDisc;

    const tr = document.createElement("tr");
    
    const tdNome = document.createElement("td");
    const strongNome = document.createElement("strong");
    strongNome.textContent = item.disciplina;
    tdNome.appendChild(strongNome);
    tr.appendChild(tdNome);

    const td1 = document.createElement("td");
    td1.textContent = formatarNotaExibicao(n1);
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.textContent = formatarNotaExibicao(n2);
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.textContent = formatarNotaExibicao(n3);
    tr.appendChild(td3);

    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = media !== null ? media.toFixed(1).replace('.', ',') : "—";
    tdMedia.appendChild(strongMedia);
    tr.appendChild(tdMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = totalFaltasDisc;
    tr.appendChild(tdFaltas);

    const tdSit = document.createElement("td");
    tdSit.className = classeSituacao;
    tdSit.textContent = situacao;
    tr.appendChild(tdSit);

    tabelaCorpo.appendChild(tr);
  });

  const mediaGeralFinal = totalDisciplinasComMedia > 0 ? (somaMediasValidas / totalDisciplinasComMedia).toFixed(1).replace('.', ',') : "—";
  
  document.getElementById("card-media-geral").textContent = mediaGeralFinal;
  document.getElementById("card-total-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = contBomDesempenho;
  document.getElementById("card-atencao").textContent = contAtencao;
}

/**
 * Função de Login (POST /api/v1/boletins/abrir)
 */
async function realizarLogin() {
  const campoPin = document.getElementById("campo-pin");
  const msgLogin = document.getElementById("mensagem-login");
  const pinDigitado = campoPin.value.trim();

  if (!pinDigitado) {
    msgLogin.className = "mensagem-status erro";
    msgLogin.textContent = "Por favor, digite o seu PIN.";
    return;
  }

  msgLogin.className = "mensagem-status info";
  msgLogin.textContent = "Conectando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.className = "mensagem-status erro";
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.className = "mensagem-status erro";
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      return;
    }

    if (!resposta.ok) {
      msgLogin.className = "mensagem-status erro";
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      return;
    }

    const resultado = await resposta.json();

    // PIN válido: salvar em memória e limpar o campo de input
    pinSessao = pinDigitado;
    campoPin.value = "";

    // Se a API brought dados existentes, usar DADOS DA API > DADOS LOCAIS
    if (resultado.dados !== null && resultado.dados !== undefined) {
      normalizarDadosAPI(resultado.dados);
    }

    // Exibe o boletim e esconde o login
    document.getElementById("secao-login").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";
    renderizarBoletim();

  } catch (erro) {
    msgLogin.className = "mensagem-status erro";
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

/**
 * Validação de nota digitada no editor (0 a 10, ponto/vírgula ou vazio)
 */
function validarNotaDigitada(str) {
  const v = str.trim();
  if (v === "") return { valido: true, valor: null };

  const normalizado = v.replace(',', '.');
  const num = Number(normalizado);

  if (isNaN(num) || num < 0 || num > 10) {
    return { valido: false };
  }
  return { valido: true, valor: num };
}

/**
 * Validação de faltas digitadas (inteiro >= 0)
 */
function validarFaltaDigitada(str) {
  const v = str.trim();
  if (v === "") return { valido: false };

  if (!/^\d+$/.test(v)) {
    return { valido: false };
  }
  const num = parseInt(v, 10);
  if (isNaN(num) || num < 0) {
    return { valido: false };
  }
  return { valido: true, valor: num };
}

/**
 * Abre o formulário de edição de notas e faltas
 */
function abrirEditor() {
  const secaoEditor = document.getElementById("secao-editor");
  const tabelaCorpoEd = document.getElementById("tabela-editor-corpo");
  const msgEditor = document.getElementById("mensagem-editor");
  
  msgEditor.textContent = "";
  msgEditor.className = "mensagem-status";
  tabelaCorpoEd.innerHTML = "";

  dadosBoletim.forEach((item, index) => {
    const tr = document.createElement("tr");

    const formatarInputNota = (val) => {
      if (val === null || val === undefined) return "";
      const n = typeof val === 'number' ? val : normalizarNota(val);
      return n !== null ? String(n).replace('.', ',') : "";
    };

    const f1 = item.faltas && item.faltas[0] !== undefined ? item.faltas[0] : 0;
    const f2 = item.faltas && item.faltas[1] !== undefined ? item.faltas[1] : 0;
    const f3 = item.faltas && item.faltas[2] !== undefined ? item.faltas[2] : 0;

    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td><input type="text" id="n1-${index}" value="${formatarInputNota(item.tri1)}"></td>
      <td><input type="text" id="n2-${index}" value="${formatarInputNota(item.tri2)}"></td>
      <td><input type="text" id="n3-${index}" value="${formatarInputNota(item.tri3)}"></td>
      <td><input type="text" id="f1-${index}" value="${f1}"></td>
      <td><input type="text" id="f2-${index}" value="${f2}"></td>
      <td><input type="text" id="f3-${index}" value="${f3}"></td>
    `;
    tabelaCorpoEd.appendChild(tr);
  });

  secaoEditor.style.display = "block";
}

/**
 * Salva as alterações feitas no editor (PUT /api/v1/boletins/salvar)
 */
async function salvarAlteracoes() {
  const msgEditor = document.getElementById("mensagem-editor");
  msgEditor.textContent = "";
  msgEditor.className = "mensagem-status";

  const todosInputs = document.querySelectorAll("#tabela-editor-corpo input");
  todosInputs.forEach(i => i.classList.remove("campo-invalido"));

  let possuiErro = false;
  const novasDisciplinas = [];

  for (let i = 0; i < dadosBoletim.length; i++) {
    const elN1 = document.getElementById(`n1-${i}`);
    const elN2 = document.getElementById(`n2-${i}`);
    const elN3 = document.getElementById(`n3-${i}`);
    const elF1 = document.getElementById(`f1-${i}`);
    const elF2 = document.getElementById(`f2-${i}`);
    const elF3 = document.getElementById(`f3-${i}`);

    const resN1 = validarNotaDigitada(elN1.value);
    const resN2 = validarNotaDigitada(elN2.value);
    const resN3 = validarNotaDigitada(elN3.value);

    const resF1 = validarFaltaDigitada(elF1.value);
    const resF2 = validarFaltaDigitada(elF2.value);
    const resF3 = validarFaltaDigitada(elF3.value);

    if (!resN1.valido) { elN1.classList.add("campo-invalido"); possuiErro = true; }
    if (!resN2.valido) { elN2.classList.add("campo-invalido"); possuiErro = true; }
    if (!resN3.valido) { elN3.classList.add("campo-invalido"); possuiErro = true; }

    if (!resF1.valido) { elF1.classList.add("campo-invalido"); possuiErro = true; }
    if (!resF2.valido) { elF2.classList.add("campo-invalido"); possuiErro = true; }
    if (!resF3.valido) { elF3.classList.add("campo-invalido"); possuiErro = true; }

    if (!possuiErro) {
      novasDisciplinas.push({
        disciplina: dadosBoletim[i].disciplina,
        tri1: resN1.valor,
        tri2: resN2.valor,
        tri3: resN3.valor,
        faltas: [resF1.valor, resF2.valor, resF3.valor]
      });
    }
  }

  if (possuiErro) {
    msgEditor.className = "mensagem-status erro";
    msgEditor.textContent = "Verifique os campos destacados em vermelho. Notas devem ser entre 0 e 10 (ou em branco) e faltas inteiras (>= 0).";
    return;
  }

  msgEditor.className = "mensagem-status info";
  msgEditor.textContent = "Salvando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      msgEditor.className = "mensagem-status erro";
      msgEditor.textContent = "Erro ao salvar alterações no servidor. Tente novamente.";
      return;
    }

    dadosBoletim = novasDisciplinas;
    renderizarBoletim();

    msgEditor.className = "mensagem-status sucesso";
    msgEditor.textContent = "Dados salvos com sucesso.";

    setTimeout(() => {
      document.getElementById("secao-editor").style.display = "none";
    }, 1500);

  } catch (erro) {
    msgEditor.className = "mensagem-status erro";
    msgEditor.textContent = "Falha de conexão ao salvar os dados. Tente novamente.";
  }
}

// Configuração dos Eventos após carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
  const btnEntrar = document.getElementById("btn-entrar");
  const campoPin = document.getElementById("campo-pin");
  const btnAlterar = document.getElementById("btn-alterar-dados");
  const btnSalvar = document.getElementById("btn-salvar-dados");
  const btnCancelar = document.getElementById("btn-cancelar-edicao");

  if (btnEntrar) {
    btnEntrar.addEventListener("click", realizarLogin);
  }

  if (campoPin) {
    campoPin.addEventListener("keypress", (e) => {
      if (e.key === "Enter") realizarLogin();
    });
  }

  if (btnAlterar) {
    btnAlterar.addEventListener("click", abrirEditor);
  }

  if (btnSalvar) {
    btnSalvar.addEventListener("click", salvarAlteracoes);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      document.getElementById("secao-editor").style.display = "none";
    });
  }
});