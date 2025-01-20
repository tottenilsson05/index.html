const pirateDict = {
  'hello': 'ahoy',
  'hi': 'yarr',
  'my': 'me',
  'yes': 'aye',
  'no': 'nay',
  'is': 'be',
  'are': 'be',
  'the': "th'",
  'you': 'ye',
  'your': 'yer',
  'for': 'fer',
  'stop': 'avast',
  'what': "wha'",
  'where': "whar",
  'money': 'doubloons',
  'treasure': 'booty',
  'drink': 'grog',
  'sir': 'cap\'n',
  'food': 'grub',
  'ocean': 'briny deep',
  'water': 'brine',
  'ship': 'vessel',
  'boat': 'ship',
  'hey': 'ahoy',
  'everyone': 'all hands',
  'wow': 'blimey',
  'look': "feast yer eyes on",
  'quickly': 'smartly',
  'bathroom': 'head',
  'restaurant': 'galley',
  'friends': 'crew',
  'cool': 'shipshape',
  'amazing': 'mighty fine',
  'food': 'grub',
  'stop': 'avast',
  'very': 'mighty',
  'goodbye': 'fare thee well',
  // Adding more pirate vocabulary
  'home': 'port',
  'house': 'quarters',
  'bed': 'bunk',
  'sleep': 'catch some shuteye',
  'stealing': 'plunderin\'',
  'steal': 'plunder',
  'stolen': 'plundered',
  'thief': 'buccaneer',
  'map': 'chart',
  'happy': 'jolly',
  'sad': 'down in the dumps',
  'angry': 'mad as a hornets nest',
  'drunk': 'three sheets to the wind',
  'beer': 'grog',
  'wine': 'port',
  'rum': 'devils drink',
  'sword': 'cutlass',
  'gun': 'flintlock',
  'rope': 'line',
  'toilet': 'head',
  'kitchen': 'galley',
  'door': 'hatch',
  'window': 'porthole',
  'floor': 'deck',
  'upstairs': 'above deck',
  'downstairs': 'below deck',
  'father': 'old salt',
  'mother': 'sea mistress',
  'child': 'cabin boy',
  'children': 'powder monkeys',
  'boss': 'admiral',
  'manager': 'first mate',
  'excellent': 'seaworthy',
  'bad': 'cursed',
  'good': 'fair winds',
  'broken': 'scuttled',
  'fix': 'patch up',
  'fixed': 'ship-shape',
  'hello': 'ahoy',
  'please': 'if ye please',
  'thank you': 'thankee',
  'thanks': 'thankee',
  'morning': 'mornin\' watch',
  'evening': 'evenin\' watch',
  'night': 'graveyard watch',
  'understand': 'savvy',
  'understood': 'aye aye'
};

function translateToPirate(text) {
  // Convert to lowercase for matching
  let words = text.toLowerCase().split(/\b/);
  
  // Translate each word
  let translatedWords = words.map(word => {
    const trimmedWord = word.trim();
    if (pirateDict[trimmedWord]) {
      // Preserve original capitalization
      if (word[0] === word[0].toUpperCase()) {
        return pirateDict[trimmedWord].charAt(0).toUpperCase() + 
               pirateDict[trimmedWord].slice(1);
      }
      return pirateDict[trimmedWord];
    }
    return word;
  });
  
  // Add some pirate flair
  let result = translatedWords.join('');
  
  // Random pirate suffixes
  const suffixes = [
    ' Arr!',
    ' Yarr!',
    ' Yo ho ho!',
    ' Shiver me timbers!',
    ' Avast ye!',
    ' Splice the mainbrace!'
  ];
  
  // Add a random suffix to sentences
  result = result.replace(/[.!?]+/g, match => {
    return match + (Math.random() < 0.3 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '');
  });
  
  // Add occasional pirate interjections
  result = result.replace(/[,;]+/g, match => {
    return match + (Math.random() < 0.2 ? ' ye scurvy dog,' : '');
  });
  
  return result;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('regular-text');
  const output = document.getElementById('pirate-text');
  const translateBtn = document.getElementById('translate-btn');
  
  translateBtn.addEventListener('click', () => {
    const text = input.value;
    const translatedText = translateToPirate(text);
    output.textContent = translatedText;
    
    // Add animation effect
    output.style.animation = 'none';
    output.offsetHeight; // Trigger reflow
    output.style.animation = 'fadeIn 0.5s';
  });
  
  // Enable translation on Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      translateBtn.click();
    }
  });
});

// Update the document title
document.title = 'MorphGPT';