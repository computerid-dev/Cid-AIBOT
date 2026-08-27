/**
 * matcher.js
 * ----------
 * Mesin pencocokan teks murni JavaScript. Tidak ada model bahasa, tidak ada
 * API — hanya matematika sederhana untuk mengukur seberapa "mirip" dua
 * kalimat, lalu memilih jawaban dari knowledgeBase.js yang paling cocok
 * dengan yang diketik user.
 */

/** Bersihkan teks: lowercase, buang tanda baca, rapikan spasi. */
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // buang aksen
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalizeText(text).split(" ").filter(Boolean);
}

/** Jarak Levenshtein klasik (jumlah edit minimal antar string). */
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

/** Ubah jarak Levenshtein jadi skor kemiripan 0..1 (1 = identik). */
function levenshteinSimilarity(a, b) {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - levenshteinDistance(a, b) / longest;
}

/** Kemiripan berbasis kata yang sama-sama muncul (Jaccard similarity). */
function tokenOverlapSimilarity(tokensA, tokensB) {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  setA.forEach((tok) => {
    if (setB.has(tok)) intersection += 1;
  });
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

/**
 * Skor gabungan antara dua kalimat: campuran kemiripan karakter (Levenshtein)
 * dan kemiripan kata (token overlap). Token overlap dibobot lebih besar
 * karena lebih tahan terhadap susunan kata yang berbeda-beda.
 */
function similarityScore(inputText, patternText) {
  const normInput = normalizeText(inputText);
  const normPattern = normalizeText(patternText);

  const charScore = levenshteinSimilarity(normInput, normPattern);
  const tokenScore = tokenOverlapSimilarity(
    tokenize(inputText),
    tokenize(patternText)
  );

  return charScore * 0.4 + tokenScore * 0.6;
}

/**
 * Cari intent (topik) di knowledgeBase yang paling mirip dengan teks user.
 * Mengembalikan { intent, score } — intent bernilai null kalau tidak ada
 * yang melewati MATCH_THRESHOLD.
 */
function findBestIntent(userText, knowledgeBase, threshold) {
  let bestIntent = null;
  let bestScore = 0;

  knowledgeBase.forEach((entry) => {
    entry.patterns.forEach((pattern) => {
      const score = similarityScore(userText, pattern);
      if (score > bestScore) {
        bestScore = score;
        bestIntent = entry;
      }
    });
  });

  if (bestScore >= threshold) {
    return { intent: bestIntent, score: bestScore };
  }
  return { intent: null, score: bestScore };
}
