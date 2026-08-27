/**
 * styleCloner.js
 * --------------
 * Bot tidak benar-benar "mengerti" kalimat baru di luar knowledgeBase, tapi
 * ia bisa "belajar" gaya bicara user: kata-kata slang dan emoji yang sering
 * dipakai user disimpan, lalu pelan-pelan diselipkan ke jawaban santai bot
 * (terutama fallback & sapaan) supaya obrolan terasa makin nyambung dan
 * personal — bukan mengubah makna jawaban faktual.
 */

const EMOJI_REGEX = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

// Kata gaul umum yang layak "dicatut" gaya bicaranya (whitelist sederhana
// supaya bot tidak ikut-ikutan meniru kata kasar/sensitif).
const SLANG_WHITELIST = [
  "wkwk",
  "wkwkwk",
  "anjay",
  "gokil",
  "santuy",
  "mantul",
  "bro",
  "sis",
  "gengs",
  "cuy",
  "bre",
  "asik",
  "asli",
  "wih",
  "btw",
  "gpp",
  "gaskeun",
  "kuy",
  "receh",
  "gabut",
];

function extractEmojis(text) {
  return text.match(EMOJI_REGEX) || [];
}

function extractSlang(tokens) {
  return tokens.filter((tok) => SLANG_WHITELIST.includes(tok));
}

const StyleCloner = {
  /** Update profil gaya bicara berdasarkan satu pesan baru dari user. */
  learnFromMessage(profile, rawText) {
    const emojis = extractEmojis(rawText);
    const tokens = normalizeText(rawText).split(" ").filter(Boolean);
    const slangWords = extractSlang(tokens);

    emojis.forEach((emo) => {
      profile.emojiFreq[emo] = (profile.emojiFreq[emo] || 0) + 1;
    });
    slangWords.forEach((word) => {
      profile.slangFreq[word] = (profile.slangFreq[word] || 0) + 1;
    });
    profile.totalMessages += 1;

    return profile;
  },

  /** Emoji favorit user (paling sering dipakai), atau null kalau belum ada data cukup. */
  getFavoriteEmoji(profile) {
    const entries = Object.entries(profile.emojiFreq);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  },

  /** Slang favorit user, atau null kalau belum ada data cukup. */
  getFavoriteSlang(profile) {
    const entries = Object.entries(profile.slangFreq);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  },

  /**
   * Sisipkan sedikit "gaya" user ke jawaban bot — hanya dipakai untuk
   * balasan santai (fallback/sapaan), bukan jawaban faktual, supaya
   * informasi tetap akurat.
   */
  applyStyle(profile, baseResponse) {
    // Baru mulai "meniru" gaya kalau sudah cukup banyak data (>= 6 pesan),
    // supaya tidak asal niru dari satu-dua pesan doang.
    if (profile.totalMessages < 6) return baseResponse;

    let response = baseResponse;
    const favSlang = StyleCloner.getFavoriteSlang(profile);
    const favEmoji = StyleCloner.getFavoriteEmoji(profile);

    // 50% kemungkinan menambahkan slang favorit user di akhir kalimat.
    if (favSlang && Math.random() < 0.5 && !response.toLowerCase().includes(favSlang)) {
      response = `${response} ${favSlang}`;
    }

    // 40% kemungkinan menambahkan emoji favorit user kalau belum ada emoji serupa.
    if (favEmoji && Math.random() < 0.4 && !response.includes(favEmoji)) {
      response = `${response} ${favEmoji}`;
    }

    return response;
  },
};
