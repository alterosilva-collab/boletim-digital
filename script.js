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

// Instâncias dos gráficos (camada somente leitura)
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

/**
- Função para normalizar notas antigas/locais na escala de 0 a 10
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
- Função para formatar o texto da nota na tabela
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
- Normaliza os dados vindos da API para a estrutura interna
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
- Função principal que calcula os dados e preenche a página
 */
function renderizarBo
