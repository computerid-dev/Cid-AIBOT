/**
 * storage.js
 * ----------
 * Semua persistensi CID AI BOT berjalan di localStorage milik browser user
 * (guest only, tanpa akun/server). Ada dua hal yang disimpan:
 *   1. Riwayat percakapan (chatHistory)
 *   2. Profil gaya bicara user yang "dipelajari" bot (styleProfile)
 */

const STORAGE_KEYS = {
  history: "cid_ai_bot_chat_history",
  style: "cid_ai_bot_style_profile",
};

const ChatStorage = {
  loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.history);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Gagal memuat riwayat chat:", err);
      return [];
    }
  },

  saveHistory(messages) {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(messages));
    } catch (err) {
      console.error("Gagal menyimpan riwayat chat:", err);
    }
  },

  clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.history);
  },

  loadStyleProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.style);
      return raw
        ? JSON.parse(raw)
        : { emojiFreq: {}, slangFreq: {}, totalMessages: 0 };
    } catch (err) {
      console.error("Gagal memuat profil gaya bicara:", err);
      return { emojiFreq: {}, slangFreq: {}, totalMessages: 0 };
    }
  },

  saveStyleProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEYS.style, JSON.stringify(profile));
    } catch (err) {
      console.error("Gagal menyimpan profil gaya bicara:", err);
    }
  },
};
