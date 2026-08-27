/**
 * app.js
 * ------
 * Entry point. Menyambungkan storage (riwayat), chatEngine (otak), dan UI
 * (tampilan) jadi satu alur chat yang utuh — semua berjalan di sisi client,
 * auth guest only, tanpa server maupun API key.
 */

(function bootstrap() {
  UI.init();

  let history = ChatStorage.loadHistory();

  if (history.length === 0) {
    const welcome = {
      role: "bot",
      text: "Hai! Aku **CID AI BOT** 🤖 Yuk ngobrol, atau tanya siapa yang bikin aku juga boleh 😄",
      time: UI.formatTime(new Date()),
    };
    history = [welcome];
    ChatStorage.saveHistory(history);
  }

  UI.renderHistory(history);

  function appendAndPersist(message) {
    history.push(message);
    ChatStorage.saveHistory(history);
    UI.renderMessage(message);
  }

  UI.elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const rawText = UI.elements.input.value.trim();
    if (!rawText) return;

    const userMessage = {
      role: "user",
      text: rawText,
      time: UI.formatTime(new Date()),
    };
    appendAndPersist(userMessage);
    UI.clearInput();

    UI.showTypingIndicator();

    // Delay singkat & acak biar kerasa natural, bukan instan seperti robot.
    const thinkingDelay = 500 + Math.random() * 700;
    setTimeout(() => {
      const reply = ChatEngine.generateReply(rawText);
      UI.hideTypingIndicator();

      const botMessage = {
        role: "bot",
        text: reply.text,
        time: UI.formatTime(new Date()),
      };
      appendAndPersist(botMessage);
    }, thinkingDelay);
  });

  UI.elements.clearButton.addEventListener("click", () => {
    const confirmed = window.confirm("Yakin mau hapus semua riwayat chat?");
    if (!confirmed) return;

    ChatStorage.clearHistory();
    history = [];
    UI.elements.messageList.innerHTML = "";

    const welcome = {
      role: "bot",
      text: "Riwayat sudah dibersihkan 🧹 Yuk mulai obrolan baru!",
      time: UI.formatTime(new Date()),
    };
    appendAndPersist(welcome);
  });
})();
