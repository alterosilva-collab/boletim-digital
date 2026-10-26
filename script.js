// Dados fictícios padronizados do 8º Ano (Dados Brutos)
const dadosBoletim = [
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

// Nota: A frequência geral de 92% exibida no card do HTML é APENAS FICTÍCIA e DEMONSTRATIVA.
// Ela não é calculada a partir das faltas e será tratada de outra forma no futuro.

/**
 * Função para normalizar notas na escala de 0 a 10
 */
function normalizarNota(valor) {
  // Trata notas ausentes, nulas ou indefinidas
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se o valor for texto (ex: "7,8"), substitui a vírgula por ponto
  if (typeof valor === 'string') {
    valor = valor.replace(',', '.');
  }

  // Converte para número
  const numero = parseFloat(valor);

  // Se não for um número válido, descarta
  if (isNaN(numero)) {
    return null;
  }

  // Regra: valores entre 0 e 10
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  // Regra: valores maiores que 10 e menores ou iguais a 100
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Qualquer outro valor é inválido
  return null;
}

/**
 * Função para formatar o texto da nota na tabela
 */
function formatarNotaExibicao(nota) {
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace('.', ',');
}

/**
 * Função principal que calcula os dados e preenche a página
 */
function renderizarBoletim() {
  const tabelaCorpo = document.getElementById("tabela-corpo");
  tabelaCorpo.innerHTML = ""; // Limpa a tabela

  let somaMediasValidas = 0;
  let totalDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let contBomDesempenho = 0;
  let contAtencao = 0;

  // Passa por cada disciplina da lista
  dadosBoletim.forEach(item => {
    // Normaliza as 3 notas
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Calcula a soma e a quantidade de notas disponíveis
    let somaNotas = 0;
    let qtdNotas = 0;

    if (n1 !== null) { somaNotas += n1; qtdNotas++; }
    if (n2 !== null) { somaNotas += n2; qtdNotas++; }
    if (n3 !== null) { somaNotas += n3; qtdNotas++; }

    // Calcula a média da disciplina (somente com notas disponíveis)
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

    // Soma o total de faltas da disciplina
    const totalFaltasDisc = item.faltas.reduce((acc, f) => acc + f, 0);
    totalFaltasGeral += totalFaltasDisc;

    // Cria a linha da tabela (DOM)
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${formatarNotaExibicao(n1)}</td>
      <td>${formatarNotaExibicao(n2)}</td>
      <td>${formatarNotaExibicao(n3)}</td>
      <td><strong>${media !== null ? media.toFixed(1).replace('.', ',') : "—"}</strong></td>
      <td>${totalFaltasDisc}</td>
      <td class="${classeSituacao}">${situacao}</td>
    `;

    tabelaCorpo.appendChild(tr);
  });

  // Atualiza os Cards de Resumo no topo
  const mediaGeralFinal = totalDisciplinasComMedia > 0 ? (somaMediasValidas / totalDisciplinasComMedia).toFixed(1).replace('.', ',') : "—";
  
  document.getElementById("card-media-geral").textContent = mediaGeralFinal;
  document.getElementById("card-total-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = contBomDesempenho;
  document.getElementById("card-atencao").textContent = contAtencao;
}

// Executa a função assim que a página carregar
document.addEventListener("DOMContentLoaded", renderizarBoletim);