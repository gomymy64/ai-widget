(function() {
  const script = document.currentScript;
  const clientId = new URL(script.src).searchParams.get('id');

  if (!clientId) {
    console.error('AI Manager Widget: No client ID provided.');
    return;
  }

  // Create Button
  const button = document.createElement('div');
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.width = '60px';
  button.style.height = '60px';
  button.style.borderRadius = '30px';
  button.style.backgroundColor = '#2563eb'; // Electric Blue
  button.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)';
  button.style.cursor = 'pointer';
  button.style.zIndex = '9999';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.transition = 'transform 0.2s';
  
  // Icon (SVG)
  button.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  button.onmouseenter = () => button.style.transform = 'scale(1.05)';
  button.onmouseleave = () => button.style.transform = 'scale(1)';
  
  button.onclick = () => {
    alert('Это демо-виджет. В реальной версии здесь откроется чат с агентом ' + clientId);
  };

  document.body.appendChild(button);
})();