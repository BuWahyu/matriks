function parseMatrix(text) {
  const rows = text
    .trim()
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
  if (!rows.length) return { error: "Matriks belum diisi." };

  const matrix = rows.map((row) =>
    row
      .split(/[ ,]+/)
      .map((v) => v.trim())
      .filter(Boolean)
      .map(Number),
  );

  if (matrix.some((row) => row.some((v) => Number.isNaN(v)))) {
    return { error: "Semua elemen matriks harus berupa angka." };
  }

  const colCount = matrix[0].length;
  if (colCount === 0 || matrix.some((row) => row.length !== colCount)) {
    return { error: "Setiap baris harus memiliki jumlah kolom yang sama." };
  }

  return { matrix };
}

function formatNumber(value) {
  return Number.isInteger(value)
    ? String(value)
    : Number(value.toFixed(2)).toString();
}

function multiplyMatrices(a, b) {
  const result = Array.from({ length: a.length }, () =>
    Array(b[0].length).fill(0),
  );
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      for (let k = 0; k < b.length; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

function matrixToBracketHTML(matrix) {
  const rowsHTML = matrix
    .map((row) => {
      const cells = row
        .map((v) => `<span class="matrix-cell">${formatNumber(v)}</span>`)
        .join("");
      return `<div class="matrix-row">${cells}</div>`;
    })
    .join("");
  return `<div class="matrix-shell"><div class="matrix-inner">${rowsHTML}</div></div>`;
}

function renderStaticMatrices() {
  document.querySelectorAll(".matrix-bracket").forEach((el) => {
    const data = el.getAttribute("data-matrix");
    if (!data) return;
    const matrix = JSON.parse(data);
    el.innerHTML = matrixToBracketHTML(matrix);
  });
}

function renderSarrus() {
  const left = document.getElementById("sarrusLeft");
  const right = document.getElementById("sarrusRight");
  if (!left || !right) return;

  const matrix = [
    [4, 2, 8],
    [2, 1, 5],
    [3, 2, 4],
  ];

  left.innerHTML = matrix
    .flat()
    .map((v) => `<span>${v}</span>`)
    .join("");
  const ext = [
    [4, 2],
    [2, 1],
    [3, 2],
  ];
  right.innerHTML = ext
    .flat()
    .map((v) => `<span>${v}</span>`)
    .join("");
}

function setStep(stepIndex) {
  [1, 2, 3, 4].forEach((i) => {
    const el = document.getElementById("step" + i);
    if (!el) return;
    if (i === stepIndex) el.classList.add("active");
    else el.classList.remove("active");
  });
}

function animateMultiplication(row, col, total) {
  const rowBox = document.getElementById("animatedRow");
  const colBox = document.getElementById("animatedCol");
  const calcBox = document.getElementById("animatedCalc");

  rowBox.textContent = `[ ${row.join(", ")} ]`;
  colBox.textContent = `[ ${col.join(", ")} ]`;
  calcBox.textContent = `c₁₁ = ${row.map((v, i) => `(${v} × ${col[i]})`).join(" + ")} = ${total}`;

  rowBox.classList.remove("vector-highlight");
  colBox.classList.remove("vector-highlight");

  setStep(1);
  setTimeout(() => {
    rowBox.classList.add("vector-highlight");
    setStep(2);
  }, 180);

  setTimeout(() => {
    colBox.classList.add("vector-highlight");
    setStep(3);
  }, 850);

  setTimeout(() => {
    setStep(4);
  }, 1500);
}

function showMultiplyResult(resultMatrix, explanation) {
  document.getElementById("resultMatrix").innerHTML =
    matrixToBracketHTML(resultMatrix);
  document.getElementById("multiplyExplanation").textContent = explanation;
}

function calculateMultiply() {
  const parsedA = parseMatrix(document.getElementById("matrixA").value);
  const parsedB = parseMatrix(document.getElementById("matrixB").value);

  if (parsedA.error) {
    showMultiplyResult([[0]], "Matriks A bermasalah: " + parsedA.error);
    return;
  }
  if (parsedB.error) {
    showMultiplyResult([[0]], "Matriks B bermasalah: " + parsedB.error);
    return;
  }

  const A = parsedA.matrix;
  const B = parsedB.matrix;

  if (A[0].length !== B.length) {
    showMultiplyResult(
      [[0]],
      `Perkalian tidak dapat dilakukan karena jumlah kolom A = ${A[0].length}, sedangkan jumlah baris B = ${B.length}.`,
    );
    return;
  }

  const result = multiplyMatrices(A, B);
  const row = A[0];
  const col = B.map((r) => r[0]);
  const total = row.reduce((sum, v, i) => sum + v * col[i], 0);

  const explanation =
    `A berordo ${A.length} × ${A[0].length} dan B berordo ${B.length} × ${B[0].length}, sehingga A × B dapat dilakukan. ` +
    `Hasilnya berordo ${A.length} × ${B[0].length}. Untuk elemen pertama hasil, kita ambil baris pertama A dan kolom pertama B: ` +
    row.map((v, i) => `${v} × ${col[i]}`).join(" + ") +
    ` = ${total}.`;

  showMultiplyResult(result, explanation);
  animateMultiplication(row, col, total);
}

function loadMultiplySample1() {
  document.getElementById("matrixA").value = "1 2 3\n4 5 6";
  document.getElementById("matrixB").value = "1 2\n3 4\n5 6";
  calculateMultiply();
}

function loadMultiplySample2() {
  document.getElementById("matrixA").value = "2 1\n3 4";
  document.getElementById("matrixB").value = "5 2\n1 3";
  calculateMultiply();
}

function loadMultiplySample3() {
  document.getElementById("matrixA").value = "1 0\n2 1\n3 4";
  document.getElementById("matrixB").value = "2 1 3\n5 0 4";
  calculateMultiply();
}

function checkQuiz() {
  const answers = { q1: "a", q2: "a", q3: "b", q4: "b", q5: "a" };
  let score = 0;
  const feedback = [];

  Object.keys(answers).forEach((q, idx) => {
    const checked = document.querySelector(`input[name="${q}"]:checked`);
    if (!checked) {
      feedback.push(`Soal ${idx + 1}: belum dijawab.`);
      return;
    }
    if (checked.value === answers[q]) {
      score++;
      feedback.push(`Soal ${idx + 1}: benar.`);
    } else {
      feedback.push(`Soal ${idx + 1}: belum tepat.`);
    }
  });

  const percent = Math.round((score / 5) * 100);
  document.getElementById("quizResult").textContent =
    `Skor Anda: ${score} dari 5 (${percent}%). ` +
    feedback.join(" ") +
    ` Kunci konsep: matriks baris memiliki satu baris, transpose diperoleh dengan menukar baris dan kolom, penjumlahan memerlukan ordo yang sama, perkalian memerlukan kolom A = baris B, dan invers tidak ada jika det A = 0.`;
}

function resetQuiz() {
  document
    .querySelectorAll('input[type="radio"]')
    .forEach((input) => (input.checked = false));
  document.getElementById("quizResult").textContent = "Belum diperiksa.";
}

document.addEventListener("DOMContentLoaded", () => {
  renderStaticMatrices();
  renderSarrus();
  calculateMultiply();

  document
    .getElementById("btnMultiply")
    .addEventListener("click", calculateMultiply);
  document
    .getElementById("btnSampleMultiply1")
    .addEventListener("click", loadMultiplySample1);
  document
    .getElementById("btnSampleMultiply2")
    .addEventListener("click", loadMultiplySample2);
  document
    .getElementById("btnSampleMultiply3")
    .addEventListener("click", loadMultiplySample3);
  document.getElementById("btnAnimate").addEventListener("click", () => {
    const parsedA = parseMatrix(document.getElementById("matrixA").value);
    const parsedB = parseMatrix(document.getElementById("matrixB").value);
    if (parsedA.error || parsedB.error) return;
    const A = parsedA.matrix;
    const B = parsedB.matrix;
    if (A[0].length !== B.length) return;
    const row = A[0];
    const col = B.map((r) => r[0]);
    const total = row.reduce((sum, v, i) => sum + v * col[i], 0);
    animateMultiplication(row, col, total);
  });

  document.getElementById("btnCheckQuiz").addEventListener("click", checkQuiz);
  document.getElementById("btnResetQuiz").addEventListener("click", resetQuiz);
});
