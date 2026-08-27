/**
 * chatEngine.js
 * -------------
 * Titik temu semua modul otak: menerima teks user, mencari intent yang
 * paling cocok, memilih salah satu variasi jawaban, lalu (untuk balasan
 * santai) menyisipkan gaya bicara user yang sudah dipelajari.
 */

const ChatEngine = {
  styleProfile: ChatStorage.loadStyleProfile(),

  /** Ambil satu jawaban acak dari daftar variasi supaya tidak monoton. */
  pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  },

  /** Proses satu pesan user dan hasilkan balasan bot. */
  generateReply(userText) {
    // Bot "belajar" gaya bicara dari setiap pesan yang masuk.
    this.styleProfile = StyleCloner.learnFromMessage(this.styleProfile, userText);
    ChatStorage.saveStyleProfile(this.styleProfile);

    const { intent, score } = findBestIntent(
      userText,
      KNOWLEDGE_BASE.filter((entry) => entry.id !== "fallback_generic"),
      MATCH_THRESHOLD
    );

    let baseResponse;
    let matchedIntent;

    if (intent) {
      baseResponse = this.pickRandom(intent.responses);
      matchedIntent = intent.id;
    } else {
      const fallbackEntry = KNOWLEDGE_BASE.find((e) => e.id === "fallback_generic");
      baseResponse = this.pickRandom(fallbackEntry.responses);
      matchedIntent = "fallback_generic";
    }

    // Gaya bicara user hanya diterapkan pada obrolan santai (sapaan,
    // basa-basi, fallback) supaya jawaban faktual (misal soal identitas)
    // tetap konsisten dan tidak "diacak" gaya bicaranya.
    const CASUAL_INTENTS = ["greeting", "how_are_you", "goodbye", "thanks", "fallback_generic", "compliment_bot"];
    const finalResponse = CASUAL_INTENTS.includes(matchedIntent)
      ? StyleCloner.applyStyle(this.styleProfile, baseResponse)
      : baseResponse;

    return { text: finalResponse, matchedIntent, score };
  },
};
