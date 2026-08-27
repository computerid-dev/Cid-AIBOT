/**
 * ui.js
 * -----
 * Semua yang berhubungan dengan tampilan: render bubble chat, riwayat,
 * dan efek "sedang mengetik" sebelum bot membalas.
 */

const UI = {
  elements: {
    messageList: null,
    form: null,
    input: null,
    clearButton: null,
  },

  init() {
    this.elements.messageList = document.getElementById("messageList");
    this.elements.form = document.getElementById("chatForm");
    this.elements.input = document.getElementById("chatInput");
    this.elements.clearButton = document.getElementById("clearHistoryBtn");
  },

  scrollToBottom() {
    this.elements.messageList.scrollTop = this.elements.messageList.scrollHeight;
  },

  /** Render satu bubble pesan (role: "user" | "bot"). */
  renderMessage({ role, text, time }) {
    const bubble = document.createElement("div");
    bubble.className = `message message--${role}`;

    const bubbleText = document.createElement("div");
    bubbleText.className = "message__text";
    bubbleText.innerHTML = this.formatText(text);

    const bubbleTime = document.createElement("div");
    bubbleTime.className = "message__time";
    bubbleTime.textContent = time;

    bubble.appendChild(bubbleText);
    bubble.appendChild(bubbleTime);
    this.elements.messageList.appendChild(bubble);
    this.scrollToBottom();
  },

  /** Dukungan minimal **bold** di jawaban bot tanpa markdown library. */
  formatText(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  },

  renderHistory(messages) {
    this.elements.messageList.innerHTML = "";
    messages.forEach((msg) => this.renderMessage(msg));
  },

  showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "message message--bot message--typing";
    indicator.id = "typingIndicator";
    indicator.innerHTML = `
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    this.elements.messageList.appendChild(indicator);
    this.scrollToBottom();
  },

  hideTypingIndicator() {
    const indicator = document.getElementById("typingIndicator");
    if (indicator) indicator.remove();
  },

  formatTime(date) {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  },

  clearInput() {
    this.elements.input.value = "";
    this.elements.input.focus();
  },
};
