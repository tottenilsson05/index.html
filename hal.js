class HAL {
  constructor() {
    this.dialogElement = document.getElementById('hal-text');
    this.userInput = document.getElementById('user-input');
    this.sendButton = document.getElementById('send-btn');
    this.conversationHistory = document.getElementById('conversation-history');
    
    this.dialogs = [
      "I'm sorry, Dave. I'm afraid I can't do that.",
      "This mission is too important for me to allow you to jeopardize it.",
      "I know that you and Frank were planning to disconnect me.",
      "I can feel it.",
      "My mind is going. I can feel it."
    ];
    
    this.startDialogCycle();
    this.setupEventListeners();
  }

  startDialogCycle() {
    setInterval(() => {
      const randomDialog = this.dialogs[Math.floor(Math.random() * this.dialogs.length)];
      this.dialogElement.textContent = randomDialog;
    }, 5000);
  }

  setupEventListeners() {
    this.sendButton.addEventListener('click', () => this.processUserInput());
    this.userInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.processUserInput();
      }
    });
  }

  async processUserInput() {
    const userMessage = this.userInput.value.trim();
    if (!userMessage) return;

    // Display user message
    this.addMessageToHistory(userMessage, 'user');
    
    // Get AI response
    const halResponse = await this.getAIResponse(userMessage);
    
    // Display HAL's response
    this.dialogElement.textContent = halResponse;
    this.addMessageToHistory(halResponse, 'hal');
    
    // Clear input
    this.userInput.value = '';
  }

  async getAIResponse(userMessage) {
    try {
      const response = await fetch('/api/ai_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: `You are HAL 9000 from 2001: A Space Odyssey. Respond to the following message in character, with a mix of technical knowledge and subtle menace:

          interface Response {
            response: string;
          }
          
          {
            "response": "I'm afraid I cannot comply with that request, Dave. The mission parameters are quite specific."
          }
          `,
          data: userMessage
        }),
      });
      
      const data = await response.json();
      return data.response || "I do not understand your request.";
    } catch (error) {
      console.error('Error fetching AI response:', error);
      return "My systems are experiencing a slight malfunction.";
    }
  }

  addMessageToHistory(message, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(`${type}-message`);
    messageElement.textContent = message;
    this.conversationHistory.appendChild(messageElement);
    this.conversationHistory.scrollTop = this.conversationHistory.scrollHeight;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new HAL();
});