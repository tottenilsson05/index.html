document.addEventListener('DOMContentLoaded', () => {
  const terminal = document.getElementById('terminal');
  const ipAddress = document.getElementById('ip-address');
  const location = document.getElementById('location');
  let retryCount = 0;

  // Generate random IP address
  const generateIP = () => {
    return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.');
  };

  // Random locations
  const locations = [
    'NEW YORK, USA',
    'LONDON, UK',
    'TOKYO, JAPAN',
    'SYDNEY, AUSTRALIA',
    'BERLIN, GERMANY'
  ];

  const messages = [
    'SCANNING SYSTEM...',
    'BYPASSING SECURITY PROTOCOLS...',
    'ACCESSING RESTRICTED FILES...',
    'DOWNLOADING GTA VI DATA...',
    'ERROR: ACCESS DENIED - RETRY REQUIRED',
  ];

  const successMessages = [
    'CONNECTION ESTABLISHED',
    'SECURITY BYPASSED',
    'ACCESSING MAINFRAME...',
    'DOWNLOADING GTA VI SOURCE CODE...',
    'REDIRECTING TO EMPLOYEE PORTAL...'
  ];

  // Display messages with typewriter effect
  const typeWriter = (text, element) => {
    let i = 0;
    const speed = 50;
    
    const type = () => {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    };
    
    type();
  };

  // Display messages sequentially
  const displayMessages = async (isSuccess = false) => {
    const messagesToShow = isSuccess ? successMessages : messages;
    for (const message of messagesToShow) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      terminal.innerHTML += `\n> ${message}`;
      terminal.scrollTop = terminal.scrollHeight;
    }
    
    if (!isSuccess) {
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1500));
      terminal.innerHTML += `\n> RETRY ATTEMPT ${retryCount}/5...`;
      
      if (retryCount >= 5) {
        document.querySelector('.glitch').textContent = 'CONNECTED';
        document.querySelector('.glitch').setAttribute('data-text', 'CONNECTED');
        await new Promise(resolve => setTimeout(resolve, 1000));
        displayMessages(true);
      } else {
        displayMessages();
      }
    } else {
      // After showing all success messages, redirect to login page
      await new Promise(resolve => setTimeout(resolve, 2000));
      document.body.classList.add('fade-out');
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.href = 'login.html';
    }
  };

  // Initialize
  const init = () => {
    ipAddress.textContent = generateIP();
    location.textContent = locations[Math.floor(Math.random() * locations.length)];
    displayMessages();
  };

  // Add some interactivity
  document.addEventListener('keydown', (e) => {
    if (retryCount < 5) {
      terminal.innerHTML += '\n> ACCESS DENIED: KEYLOGGER ACTIVE';
      terminal.scrollTop = terminal.scrollHeight;
    }
  });

  // Start the sequence
  init();
});