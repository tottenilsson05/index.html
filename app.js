const { createApp, ref, onMounted, nextTick } = Vue;

createApp({
  setup() {
    const isLoading = ref(true);
    const room = new WebsimSocket();
    const startMenuActive = ref(false);
    const selectedIcon = ref(null);
    const windows = ref([]);
    const uoMessages = ref([]);
    const tcgMessages = ref([]);
    const dndMessages = ref([]);
    const tavernMessages = ref([]);
    const newMessage = ref('');
    const peers = ref({});
    const messagesContainer = ref(null);
    const activeTab = ref('all');
    const selectedCategory = ref('general');
    const selectedGame = ref('mtg');
    const selectedRoom = ref('general');
    const selectedDndRoom = ref('general');
    const selectedDndCategory = ref('general');
    const selectedTavernRoom = ref('general');
    const currentTime = ref('');
    const showCalendar = ref(false);
    const currentDate = ref(new Date());
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const diceResult = ref(null);
    const characterStats = ref([
      { name: 'STR', value: 10 },
      { name: 'DEX', value: 10 },
      { name: 'CON', value: 10 },
      { name: 'INT', value: 10 },
      { name: 'WIS', value: 10 },
      { name: 'CHA', value: 10 }
    ]);
    const upcomingSessions = ref([
      { 
        id: 1, 
        date: 'Saturday, 7:00 PM EST',
        campaign: 'Curse of Strahd',
        dm: 'DungeonMaster123'
      },
      { 
        id: 2, 
        date: 'Sunday, 2:00 PM EST',
        campaign: 'Lost Mine of Phandelver',
        dm: 'DragonQueen'
      },
      { 
        id: 3, 
        date: 'Wednesday, 8:00 PM EST',
        campaign: 'Homebrew Campaign',
        dm: 'CriticalRole99'
      }
    ]);
    const meetups = ref([
      {
        id: 1,
        title: 'Weekly Board Game Night',
        host: 'TavernKeeper',
        time: 'Every Thursday @ 7PM EST',
        attendees: 12,
        description: 'Join us for classic board games and good company!'
      },
      {
        id: 2,
        title: 'Monthly Trivia Night',
        host: 'QuizMaster',
        time: 'First Friday @ 8PM EST',
        attendees: 24,
        description: 'Test your knowledge across various topics!'
      },
      {
        id: 3,
        title: 'Storytelling Evening',
        host: 'BardMaster',
        time: 'Every Sunday @ 6PM EST',
        attendees: 8,
        description: 'Share your tales of adventure and mystery!'
      }
    ]);

    const desktopIcons = [
      {
        id: 'chat',
        title: 'UO Shard Navigator',
        icon: "https://cdn.glitch.global/fcf50ddf-49c3-45b3-8f99-27e65336a963/UO.webp?v=1737481907808"
      },
      {
        id: 'tcg',
        title: 'TCG Navigator',
        icon: "https://cdn.glitch.global/fcf50ddf-49c3-45b3-8f99-27e65336a963/die.webp?v=1737481234716"
      },
      {
        id: 'missile',
        title: 'Missile Command',
        icon: "https://cdn.glitch.global/fcf50ddf-49c3-45b3-8f99-27e65336a963/MissleArcher.webp?v=1720799634709"
      },
      {
        id: 'about',
        title: 'About',
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%23c0c0c0' stroke='%23000' stroke-width='2'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-size='20' fill='%23000080'%3E?%3C/text%3E%3C/svg%3E"
      },
      {
        id: 'dnd',
        title: 'D&D Navigator',
        icon: "https://cdn.glitch.global/fcf50ddf-49c3-45b3-8f99-27e65336a963/war%20room.webp?v=1724151742895"
      },
      {
        id: 'tavern',
        title: 'The Tavern',
        icon: "https://cdn.glitch.global/fcf50ddf-49c3-45b3-8f99-27e65336a963/guild%20background%202.webp?v=1737483713216"
      },
      {
        id: 'feedback',
        title: 'Feedback',
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect x='4' y='4' width='24' height='24' fill='%23fff' stroke='%23000' stroke-width='2'/%3E%3Cpath d='M8 8h16v2H8zM8 12h16v2H8zM8 16h16v2H8zM8 20h12v2H8z' fill='%23000'/%3E%3C/svg%3E"
      }
    ];

    const startMenuItems = [
      {
        id: 'chat',
        title: 'UO Shard Navigator',
        icon: "https://cdn.glitch.global/fcf50ddf-49c3-45b3-8f99-27e65336a963/UO.webp?v=1737481907808"
      },
      {
        id: 'tcg',
        title: 'TCG Navigator',
        icon: "https://cdn.glitch.global/fcf50ddf-49c3-45b3-8f99-27e65336a963/die.webp?v=1737481234716"
      },
      {
        id: 'missile',
        title: 'Missile Command',
        icon: "https://cdn.glitch.global/fcf50ddf-49c3-45b3-8f99-27e65336a963/MissleArcher.webp?v=1720799634709"
      },
      {
        id: 'about',
        title: 'About',
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%23c0c0c0' stroke='%23000' stroke-width='2'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-size='20' fill='%23000080'%3E?%3C/text%3E%3C/svg%3E"
      },
      {
        id: 'dnd',
        title: 'D&D Navigator',
        icon: "https://cdn.glitch.global/fcf50ddf-49c3-45b3-8f99-27e65336a963/war%20room.webp?v=1724151742895"
      },
      {
        id: 'tavern',
        title: 'The Tavern',
        icon: "https://cdn.glitch.global/fcf50ddf-49c3-45b3-8f99-27e65336a963/guild%20background%202.webp?v=1737483713216"
      },
      {
        id: 'feedback',
        title: 'Feedback',
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect x='4' y='4' width='24' height='24' fill='%23fff' stroke='%23000' stroke-width='2'/%3E%3Cpath d='M8 8h16v2H8zM8 12h16v2H8zM8 16h16v2H8zM8 20h12v2H8z' fill='%23000'/%3E%3C/svg%3E"
      },
      { type: 'divider' },
      {
        id: 'shutdown',
        title: 'Shut Down...',
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%23c0c0c0' stroke='%23000' stroke-width='2'/%3E%3Cpath d='M16 8v16M10 16h12' stroke='%23ff0000' stroke-width='4'/%3E%3C/svg%3E"
      }
    ];

    const tabs = [
      { id: 'all', name: 'All' },
      { id: 'trade', name: 'Trading' },
      { id: 'shard', name: 'Shards' }
    ];

    const categories = [
      { id: 'general', name: 'General' },
      { id: 'trade', name: 'Trading' },
      { id: 'shard', name: 'Shard Info' }
    ];

    const dndCategories = [
      { id: 'general', name: 'General Chat' },
      { id: 'character', name: 'Character Discussion' },
      { id: 'mechanics', name: 'Game Mechanics' },
      { id: 'roleplay', name: 'Roleplay' },
      { id: 'combat', name: 'Combat' }
    ];

    const games = [
      { id: 'mtg', name: 'Magic: The Gathering', icon: '🎴' },
      { id: 'pokemon', name: 'Pokémon TCG', icon: '⚡' },
      { id: 'yugioh', name: 'Yu-Gi-Oh!', icon: '🎯' },
      { id: 'other', name: 'Other TCGs', icon: '🃏' }
    ];

    const rooms = {
      mtg: [
        { id: 'general', name: 'General Discussion', count: 42 },
        { id: 'trading', name: 'Trading Hub', count: 28 },
        { id: 'tournament', name: 'Tournament Scene', count: 15 },
        { id: 'modern', name: 'Modern Format', count: 23 },
        { id: 'commander', name: 'Commander/EDH', count: 35 }
      ],
      pokemon: [
        { id: 'general', name: 'General Discussion', count: 31 },
        { id: 'trading', name: 'Card Exchange', count: 24 },
        { id: 'collecting', name: 'Collectors Corner', count: 19 },
        { id: 'tournament', name: 'Tournament Center', count: 12 }
      ],
      yugioh: [
        { id: 'general', name: 'General Discussion', count: 27 },
        { id: 'trading', name: 'Trading Floor', count: 21 },
        { id: 'tournament', name: 'Tournament Arena', count: 14 },
        { id: 'meta', name: 'Meta Discussion', count: 18 }
      ],
      other: [
        { id: 'general', name: 'General Discussion', count: 15 },
        { id: 'trading', name: 'Trading Post', count: 12 },
        { id: 'news', name: 'TCG News', count: 8 }
      ]
    };

    const dndRooms = [
      { id: 'general', name: 'Tavern Talk', icon: '🍺' },
      { id: 'character-creation', name: 'Character Workshop', icon: '📝' },
      { id: 'weekly-meetups', name: 'Adventure Board', icon: '📅' },
      { id: 'dm-resources', name: 'DM\'s Quarter', icon: '🎭' },
      { id: 'marketplace', name: 'Equipment Shop', icon: '⚔️' },
      { id: 'lore-discussion', name: 'Library of Lore', icon: '📚' },
      { id: 'quest-board', name: 'Quest Board', icon: '📜' }
    ];

    const tavernRooms = [
      { id: 'general', name: 'Main Hall', icon: '🍺' },
      { id: 'bards', name: 'Bard\'s Corner', icon: '🎵' },
      { id: 'quests', name: 'Quest Board', icon: '⚔️' },
      { id: 'meetups', name: 'Meetup Planning', icon: '📅' },
      { id: 'marketplace', name: 'Merchant Square', icon: '💰' },
      { id: 'stories', name: 'Story Circle', icon: '📚' }
    ];

    const feedbackText = ref('');
    const feedbackType = ref('new_server');

    function formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    }

    function dragWindow(event, window) {
      const startX = event.clientX - window.x;
      const startY = event.clientY - window.y;
      
      function onMouseMove(e) {
        window.x = e.clientX - startX;
        window.y = e.clientY - startY;
      }
      
      function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    function minimizeWindow(window) {
      window.minimized = !window.minimized;
    }

    function closeWindow(windowId) {
      windows.value = windows.value.filter(w => w.id !== windowId);
    }

    function activateWindow(window) {
      windows.value.forEach(w => w.active = false);
      window.active = true;
    }

    function openWindow(windowId) {
      const window = windows.value.find(w => w.id === windowId);
      if (window) {
        window.minimized = false;
        activateWindow(window);
      }
    }

    async function sendMessage(appType) {
      if (!newMessage.value.trim()) return;
      
      await room.collection(appType + '_message').create({
        message: newMessage.value,
        category: selectedCategory.value,
        timestamp: new Date().toISOString(),
        appType: appType
      });
      
      newMessage.value = '';
    }

    function getMessagesForApp(appType) {
      const messages = appType === 'uo' ? uoMessages.value : appType === 'tcg' ? tcgMessages.value : appType === 'dnd' ? dndMessages.value : tavernMessages.value;
      if (activeTab.value === 'all') return messages;
      return messages.filter(msg => msg.category === activeTab.value);
    }

    function setActiveTab(tabId) {
      activeTab.value = tabId;
      scrollToBottom();
    }

    function getMessageClass(message) {
      switch (message.category) {
        case 'trade': return 'trade-message';
        case 'shard': return 'shard-message';
        case 'character': return 'character-message';
        case 'mechanics': return 'mechanics-message';
        case 'roleplay': return 'roleplay-message';
        case 'combat': return 'combat-message';
        default: return '';
      }
    }

    function getDndMessageClass(message) {
      return 'dnd-message';
    }

    function scrollToBottom() {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    }

    function toggleStartMenu() {
      startMenuActive.value = !startMenuActive.value;
    }

    function handleStartMenuItem(item) {
      startMenuActive.value = false;
      if (item.id === 'shutdown') {
        if (confirm('Are you sure you want to exit?')) {
          window.close();
        }
        return;
      }
      createWindow(item.id);
    }

    function selectIcon(iconId) {
      selectedIcon.value = iconId;
    }

    function createWindow(windowId) {
      const existingWindow = windows.value.find(w => w.id === windowId);
      if (existingWindow) {
        existingWindow.minimized = false;
        activateWindow(existingWindow);
        return;
      }

      const windowConfig = {
        chat: {
          title: 'UO Shard Navigator',
          width: 800,
          height: 600,
          template: 'chat'
        },
        tcg: {
          title: 'TCG Navigator',
          width: 800,
          height: 600,
          template: 'tcg'
        },
        missile: {
          title: 'Missile Command',
          width: 800,
          height: 600,
          template: 'missile'
        },
        about: {
          title: 'About',
          width: 400,
          height: 300,
          template: 'about'
        },
        dnd: {
          title: 'D&D Navigator',
          width: 900,
          height: 600,
          template: 'dnd'
        },
        tavern: {
          title: 'The Tavern',
          width: 800,
          height: 600,
          template: 'tavern'
        },
        feedback: {
          title: 'Feedback',
          width: 500,
          height: 400,
          template: 'feedback'
        }
      };

      const config = windowConfig[windowId];
      if (!config) return;

      const newWindow = {
        id: windowId,
        title: config.title,
        x: 50 + (windows.value.length * 20),
        y: 50 + (windows.value.length * 20),
        width: config.width,
        height: config.height,
        minimized: false,
        active: true,
        template: config.template
      };

      windows.value.forEach(w => w.active = false);
      windows.value.push(newWindow);
    }

    function getCurrentRooms() {
      return rooms[selectedGame.value] || [];
    }

    function getCurrentDndRoom() {
      return dndRooms.find(room => room.id === selectedDndRoom.value);
    }

    function getCurrentTavernRoom() {
      return tavernRooms.find(room => room.id === selectedTavernRoom.value);
    }

    function setGame(gameId) {
      selectedGame.value = gameId;
      selectedRoom.value = 'general';
    }

    function setRoom(roomId) {
      selectedRoom.value = roomId;
    }

    function setDndRoom(roomId) {
      selectedDndRoom.value = roomId;
    }

    function setDndCategory(categoryId) {
      selectedDndCategory.value = categoryId;
    }

    function setTavernRoom(roomId) {
      selectedTavernRoom.value = roomId;
    }

    function rollDice(notation) {
      const [count, sides] = notation.split('d');
      let total = 0;
      const rolls = [];
      
      for (let i = 0; i < (count || 1); i++) {
        const roll = Math.floor(Math.random() * parseInt(sides)) + 1;
        rolls.push(roll);
        total += roll;
      }
      
      diceResult.value = `${total} (${rolls.join(' + ')})`;
    }

    function handleGlobalClick(event) {
      // Close start menu if clicking outside
      if (!event.target.closest('.start-button') && !event.target.closest('.start-menu')) {
        startMenuActive.value = false;
      }
      // Clear selected icon if clicking on desktop
      if (!event.target.closest('.desktop-icon') && !event.target.closest('.window')) {
        selectedIcon.value = null;
      }
    }

    function updateClock() {
      const now = new Date();
      currentTime.value = now.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    }

    function toggleCalendar() {
      showCalendar.value = !showCalendar.value;
    }

    function getDaysInMonth(date) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      
      const daysArray = [];
      for (let i = 0; i < firstDay; i++) {
        daysArray.push('');
      }
      
      for (let i = 1; i <= days; i++) {
        daysArray.push(i);
      }
      
      return daysArray;
    }

    function prevMonth() {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
      );
    }

    function nextMonth() {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
      );
    }

    function formatMonth() {
      return currentDate.value.toLocaleString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }

    function isCurrentDay(day) {
      const today = new Date();
      return currentDate.value.getMonth() === today.getMonth() &&
             currentDate.value.getFullYear() === today.getFullYear() &&
             day === today.getDate();
    }

    async function submitFeedback() {
      if (!feedbackText.value.trim()) return;
      
      await room.collection('feedback').create({
        text: feedbackText.value,
        type: feedbackType.value,
        timestamp: new Date().toISOString()
      });
      
      feedbackText.value = '';
      alert('Thank you for your feedback!');
    }

    onMounted(() => {
      // Show loading screen for 4 seconds
      setTimeout(() => {
        isLoading.value = false;
        document.getElementById('app').classList.add('loaded');
        const loadingScreen = document.querySelector('.loading-screen');
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 1000);
      }, 4000);

      document.addEventListener('click', handleGlobalClick);
      // Subscribe to peers
      room.party.subscribe((newPeers) => {
        peers.value = newPeers;
      });

      // Subscribe to UO messages
      room.collection('uo_message').subscribe((newMessages) => {
        uoMessages.value = newMessages;
        scrollToBottom();
      });

      // Subscribe to TCG messages
      room.collection('tcg_message').subscribe((newMessages) => {
        tcgMessages.value = newMessages;
        scrollToBottom();
      });

      // Subscribe to DND messages
      room.collection('dnd_message').subscribe((newMessages) => {
        dndMessages.value = newMessages;
        scrollToBottom();
      });

      // Subscribe to Tavern messages
      room.collection('tavern_message').subscribe((newMessages) => {
        tavernMessages.value = newMessages;
        scrollToBottom();
      });

      // Create initial chat window
      createWindow('chat');
      updateClock();
      setInterval(updateClock, 1000);
    });

    return {
      isLoading,
      startMenuActive,
      startMenuItems,
      desktopIcons,
      selectedIcon,
      windows,
      uoMessages,
      tcgMessages,
      dndMessages,
      tavernMessages,
      newMessage,
      peers,
      messagesContainer,
      activeTab,
      tabs,
      categories,
      selectedCategory,
      toggleStartMenu,
      handleStartMenuItem,
      selectIcon,
      createWindow,
      dragWindow,
      minimizeWindow,
      closeWindow,
      activateWindow,
      openWindow,
      getMessagesForApp,
      sendMessage,
      formatTime,
      setActiveTab,
      getMessageClass,
      getDndMessageClass,
      scrollToBottom,
      games,
      selectedGame,
      selectedRoom,
      selectedDndRoom,
      selectedDndCategory,
      selectedTavernRoom,
      diceResult,
      characterStats,
      upcomingSessions,
      meetups,
      rollDice,
      getCurrentDndRoom,
      getCurrentTavernRoom,
      getCurrentRooms,
      setGame,
      setRoom,
      setDndRoom,
      setDndCategory,
      setTavernRoom,
      currentTime,
      showCalendar,
      currentDate,
      weekDays,
      toggleCalendar,
      getDaysInMonth,
      prevMonth,
      nextMonth,
      formatMonth,
      isCurrentDay,
      feedbackText,
      feedbackType,
      submitFeedback
    };
  }
}).mount('#app');