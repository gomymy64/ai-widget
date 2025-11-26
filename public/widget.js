(function() {
  const script = document.currentScript;
  // Fallback to searching for the script tag if currentScript is null (async load)
  const scriptTag = script || document.querySelector('script[src*="widget.js"]');
  const clientId = scriptTag ? new URL(scriptTag.src).searchParams.get('id') : 'UNKNOWN';
  const isDemo = clientId === 'DEMO';

  // --- Styles ---
  const style = document.createElement('style');
  style.innerHTML = `
    .ai-widget-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background-color: #2563eb;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      cursor: pointer;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, background-color 0.2s;
    }
    .ai-widget-btn:hover {
      transform: scale(1.05);
      background-color: #1d4ed8;
    }
    .ai-widget-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      height: 600px;
      max-height: 80vh;
      max-width: 90vw;
      background-color: #09090b; /* zinc-950 */
      border: 1px solid #27272a; /* zinc-800 */
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      z-index: 99999;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .ai-widget-window.open {
      display: flex;
      opacity: 1;
      transform: translateY(0);
    }
    .ai-header {
      padding: 16px;
      background-color: #18181b;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ai-avatar {
      width: 32px;
      height: 32px;
      background-color: #2563eb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
    .ai-info h3 {
      margin: 0;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
    }
    .ai-info p {
      margin: 0;
      color: #a1a1aa;
      font-size: 11px;
    }
    .ai-close {
      margin-left: auto;
      background: none;
      border: none;
      color: #71717a;
      cursor: pointer;
      font-size: 20px;
    }
    .ai-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background-color: #09090b;
    }
    .ai-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
    }
    .ai-msg-bot {
      align-self: flex-start;
      background-color: #27272a;
      color: #e4e4e7;
      border-top-left-radius: 2px;
    }
    .ai-msg-warning {
      align-self: center;
      background-color: #451a03;
      color: #fbbf24;
      border: 1px solid #78350f;
      font-size: 12px;
      text-align: center;
      max-width: 90%;
    }
    .ai-msg-user {
      align-self: flex-end;
      background-color: #2563eb;
      color: white;
      border-top-right-radius: 2px;
    }
    .ai-input-area {
      padding: 12px;
      border-top: 1px solid #27272a;
      background-color: #18181b;
      display: flex;
      gap: 8px;
    }
    .ai-input {
      flex: 1;
      background-color: #27272a;
      border: 1px solid #3f3f46;
      border-radius: 20px;
      padding: 8px 16px;
      color: white;
      font-size: 14px;
      outline: none;
    }
    .ai-input:focus {
      border-color: #2563eb;
    }
    .ai-send {
      background-color: #2563eb;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ai-send:hover {
      background-color: #1d4ed8;
    }
  `;
  document.head.appendChild(style);

  // --- Button ---
  const button = document.createElement('div');
  button.className = 'ai-widget-btn';
  button.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  // --- Chat Window ---
  const windowDiv = document.createElement('div');
  windowDiv.className = 'ai-widget-window';
  
  // Conditionally render warning if in demo mode
  const warningHTML = isDemo 
    ? `<div class="ai-msg ai-msg-warning">Это демо-версия. Пожалуйста, зарегистрируйтесь, чтобы настроить виджет под свои нужды.</div>` 
    : '';

  windowDiv.innerHTML = `
    <div class="ai-header">
      <div class="ai-avatar">AI</div>
      <div class="ai-info">
        <h3>Ассистент</h3>
        <p>${isDemo ? 'Demo Mode' : clientId}</p>
      </div>
      <button class="ai-close">&times;</button>
    </div>
    <div class="ai-messages" id="ai-messages">
      ${warningHTML}
      <div class="ai-msg ai-msg-bot">Здравствуйте! Чем я могу вам помочь сегодня?</div>
    </div>
    <div class="ai-input-area">
      <input type="text" class="ai-input" placeholder="Введите сообщение..." id="ai-input">
      <button class="ai-send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </button>
    </div>
  `;

  // --- Logic ---
  let isOpen = false;

  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      windowDiv.style.display = 'flex';
      setTimeout(() => windowDiv.classList.add('open'), 10);
    } else {
      windowDiv.classList.remove('open');
      setTimeout(() => windowDiv.style.display = 'none', 300);
    }
  }

  function sendMessage() {
    const input = windowDiv.querySelector('#ai-input');
    const messages = windowDiv.querySelector('#ai-messages');
    const text = input.value.trim();
    
    if (!text) return;

    // User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-msg ai-msg-user';
    userMsg.textContent = text;
    messages.appendChild(userMsg);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Fake Bot Reply (Demo)
    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'ai-msg ai-msg-bot';
      botMsg.textContent = isDemo 
        ? "В демо-режиме я могу только приветствовать вас. Зарегистрируйтесь, чтобы подключить меня к вашей базе знаний." 
        : "Спасибо за сообщение! Это демо-режим виджета. В полной версии здесь будет подключен ваш настроенный AI-агент.";
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
    }, 1000);
  }

  button.onclick = toggleChat;
  windowDiv.querySelector('.ai-close').onclick = toggleChat;
  windowDiv.querySelector('.ai-send').onclick = sendMessage;
  windowDiv.querySelector('#ai-input').onkeydown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  document.body.appendChild(button);
  document.body.appendChild(windowDiv);
})();