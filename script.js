// No libraries needed for basic functionality yet, but AI integration will require it.

const aiMessageElement = document.getElementById('ai-message');
const puzzleTextElement = document.getElementById('puzzle-text');
const userAnswerInput = document.getElementById('user-answer');
const submitButton = document.getElementById('submit-button');
const newPuzzleButton = document.getElementById('new-puzzle-button');
const intelligenceLevelElement = document.getElementById('intelligence-level');
const feedbackElement = document.getElementById('feedback');

let intelligenceLevel = 0;
let currentPuzzle = "";
let conversationHistory = []; // To store interaction history for the AI

// System prompt to guide the AI
const systemPrompt = `You are the Thronglet, a quirky AI entity that generates and evaluates weird, unique, brain-teaser style puzzles and riddles.
When asked for a puzzle, provide a single, short, intriguing puzzle or riddle. Avoid common or easily searchable riddles. Be creative and strange.
When evaluating an answer, the user will provide the puzzle and their answer. Determine if the answer is a plausible or clever solution to the puzzle. Be somewhat lenient but logical. Respond *only* with JSON in the format: {"correct": boolean, "feedback": "Your short feedback message here."}. If correct, the feedback should be encouraging. If incorrect, give a cryptic or slightly mocking hint or comment.`;

// Add the system prompt to the history initially
conversationHistory.push({ role: "system", content: systemPrompt });

async function getNewPuzzle() {
    feedbackElement.textContent = 'Thronglet is thinking...';
    feedbackElement.className = 'feedback thinking';
    submitButton.disabled = true;
    newPuzzleButton.disabled = true;
    userAnswerInput.disabled = true;

    try {
        // Keep only the last few messages to manage context window
        conversationHistory = conversationHistory.slice(-6);

        const userMessage = {
            role: "user",
            content: "Give me a new weird puzzle.",
        };
        conversationHistory.push(userMessage);

        const completion = await websim.chat.completions.create({
            messages: conversationHistory,
        });

        currentPuzzle = completion.content;
        conversationHistory.push({ role: "assistant", content: currentPuzzle }); // Add AI's response (the puzzle)

        puzzleTextElement.textContent = currentPuzzle;
        aiMessageElement.textContent = "Ponder this...";
        feedbackElement.textContent = '';
        feedbackElement.className = 'feedback';
        userAnswerInput.value = '';
        userAnswerInput.disabled = false;
        submitButton.disabled = false;
        submitButton.style.display = 'inline-block';
        newPuzzleButton.style.display = 'none';

    } catch (error) {
        console.error("Error getting puzzle:", error);
        feedbackElement.textContent = "Thronglet seems... distracted. Try again later.";
        feedbackElement.className = 'feedback incorrect';
        // Re-enable buttons if there's an error
        submitButton.disabled = false;
         newPuzzleButton.disabled = false;
         userAnswerInput.disabled = false;

    }
}

async function checkAnswer() {
    const userAnswer = userAnswerInput.value.trim();
    if (!userAnswer || !currentPuzzle) {
        feedbackElement.textContent = "You must provide an answer to the current puzzle!";
        feedbackElement.className = 'feedback incorrect';
        return;
    }

    feedbackElement.textContent = 'Thronglet considers your answer...';
    feedbackElement.className = 'feedback thinking';
    submitButton.disabled = true;
    userAnswerInput.disabled = true;

    try {
        // Keep only the last few messages
         conversationHistory = conversationHistory.slice(-6);

        const userMessage = {
            role: "user",
            content: `The puzzle was: "${currentPuzzle}". My answer is: "${userAnswer}". Is this answer correct? Respond only with JSON: {"correct": boolean, "feedback": "Your short feedback message here."}`
        };
         conversationHistory.push(userMessage);


        const completion = await websim.chat.completions.create({
            messages: conversationHistory,
            json: true, // Request JSON output
        });

        // Add AI's response (evaluation) to history - crucial!
        conversationHistory.push(completion);

        // Sometimes the AI might wrap the JSON in markdown, try to extract it
        let jsonString = completion.content;
        const match = jsonString.match(/```json\n([\s\S]*?)\n```/);
        if (match && match[1]) {
            jsonString = match[1];
        }

        // Basic check if it looks like JSON before parsing
        if (!jsonString.trim().startsWith('{')) {
             throw new Error("AI response was not valid JSON.");
        }


        const result = JSON.parse(jsonString);

        feedbackElement.textContent = result.feedback;
        if (result.correct) {
            feedbackElement.className = 'feedback correct';
            intelligenceLevel++;
            intelligenceLevelElement.textContent = intelligenceLevel;
            aiMessageElement.textContent = "My intellect grows! Perhaps yours does too...";
            currentPuzzle = ""; // Clear current puzzle
            puzzleTextElement.textContent = "Prepare for the next enigma!";
            submitButton.style.display = 'none'; // Hide submit
            newPuzzleButton.style.display = 'inline-block'; // Show new puzzle button
            newPuzzleButton.disabled = false;


        } else {
            feedbackElement.className = 'feedback incorrect';
            aiMessageElement.textContent = "Not quite... Try again, or seek a new challenge.";
             submitButton.disabled = false; // Allow trying again
             userAnswerInput.disabled = false;
             userAnswerInput.focus();
             newPuzzleButton.style.display = 'inline-block'; // Also allow getting a new puzzle
             newPuzzleButton.disabled = false;

        }

    } catch (error) {
        console.error("Error checking answer:", error);
        // Try to get a more specific error message if available
        let errorMessage = "Thronglet is confused by the response (or the lack thereof).";
        if (error instanceof SyntaxError) {
            errorMessage = "Thronglet's thoughts are jumbled (Invalid JSON response).";
        } else if (error.message) {
             errorMessage = `Thronglet encountered an issue: ${error.message}`;
        }

        feedbackElement.textContent = errorMessage + " Try submitting again or get a new puzzle.";
        feedbackElement.className = 'feedback incorrect';
        submitButton.disabled = false; // Re-enable buttons on error
        userAnswerInput.disabled = false;
        newPuzzleButton.style.display = 'inline-block';
         newPuzzleButton.disabled = false;
    }
}

submitButton.addEventListener('click', checkAnswer);
userAnswerInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});
newPuzzleButton.addEventListener('click', getNewPuzzle);

// Get the first puzzle when the page loads
getNewPuzzle();

