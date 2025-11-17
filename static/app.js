// Game State
const gameState = {
    partner1: '',
    partner2: '',
    apiKey: '',
    provider: 'google', // 'google', 'anthropic', or 'openai'
    intensityPreference: 'romantic', // 'random', 'sweet', 'romantic', 'passionate', 'explicit'
    intensityLevel: 'romantic', // Current actual intensity (resolved from preference)
    currentPlayer: null,
    scores: {
        partner1: { truths: 0, dares: 0 },
        partner2: { truths: 0, dares: 0 }
    },
    lastPlayer: null
};

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const selectionScreen = document.getElementById('selection-screen');
const choiceScreen = document.getElementById('choice-screen');
const promptScreen = document.getElementById('prompt-screen');

const partner1Input = document.getElementById('partner1-name');
const partner2Input = document.getElementById('partner2-name');
const apiKeyInput = document.getElementById('api-key');
const startGameBtn = document.getElementById('start-game-btn');

const nameSpinner = document.getElementById('name-spinner');
const selectedPlayerDiv = document.getElementById('selected-player');
const currentPlayerDiv = document.getElementById('current-player');

const truthBtn = document.getElementById('truth-btn');
const dareBtn = document.getElementById('dare-btn');
const scoresDiv = document.getElementById('scores');

const promptPlayer = document.getElementById('prompt-player');
const promptLoading = document.getElementById('prompt-loading');
const promptDisplay = document.getElementById('prompt-display');
const nextRoundBtn = document.getElementById('next-round-btn');
const skipDareBtn = document.getElementById('skip-dare-btn');
const endGameBtn = document.getElementById('end-game-btn');

// Event Listeners
partner1Input.addEventListener('input', updateStartButton);
partner2Input.addEventListener('input', updateStartButton);
apiKeyInput.addEventListener('input', () => {
    gameState.apiKey = apiKeyInput.value.trim();
    updateStartButton();
});

// Provider selection listeners
document.querySelectorAll('input[name="ai-provider"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        gameState.provider = e.target.value;
        updateAPILink();
    });
});

// Intensity level listeners (setup screen)
document.querySelectorAll('input[name="intensity"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        gameState.intensityPreference = e.target.value;
        // If random is selected, default to romantic until first resolution
        if (e.target.value === 'random') {
            gameState.intensityLevel = 'romantic';
        } else {
            gameState.intensityLevel = e.target.value;
        }
    });
});

// Intensity switcher listeners (during gameplay)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.intensity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const intensity = btn.getAttribute('data-intensity');
            gameState.intensityPreference = intensity;
            // If random is selected, keep current level until next resolution
            if (intensity !== 'random') {
                gameState.intensityLevel = intensity;
            }
            updateIntensitySwitcher();
        });
    });
});

function updateAPILink() {
    const apiLink = document.getElementById('api-link');
    if (gameState.provider === 'google') {
        apiLink.innerHTML = 'Get your free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>';
        apiKeyInput.placeholder = 'Enter your Google AI API Key';
    } else if (gameState.provider === 'openai') {
        apiLink.innerHTML = 'Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>';
        apiKeyInput.placeholder = 'Enter your OpenAI API Key';
    } else {
        apiLink.innerHTML = 'Get your API key from <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a>';
        apiKeyInput.placeholder = 'Enter your Anthropic API Key';
    }
}

startGameBtn.addEventListener('click', startGame);
truthBtn.addEventListener('click', () => handleChoice('truth'));
dareBtn.addEventListener('click', () => handleChoice('dare'));
nextRoundBtn.addEventListener('click', startNewRound);
skipDareBtn.addEventListener('click', skipDare);
endGameBtn.addEventListener('click', endGame);

// Functions
function updateStartButton() {
    gameState.partner1 = partner1Input.value.trim();
    gameState.partner2 = partner2Input.value.trim();
    startGameBtn.disabled = !gameState.partner1 || !gameState.partner2 || !gameState.apiKey;
}

function switchScreen(hideScreen, showScreen) {
    hideScreen.classList.remove('active');
    showScreen.classList.add('active');
}

function startGame() {
    switchScreen(setupScreen, selectionScreen);
    selectRandomPlayer();
}

function selectRandomPlayer() {
    // Alternate between players, but with randomization for first pick
    if (gameState.lastPlayer === null) {
        // First round - random selection
        gameState.currentPlayer = Math.random() < 0.5 ? gameState.partner1 : gameState.partner2;
    } else {
        // Alternate players
        gameState.currentPlayer = gameState.lastPlayer === gameState.partner1 ? gameState.partner2 : gameState.partner1;
    }

    // Spinning animation
    let spinCount = 0;
    const spinInterval = setInterval(() => {
        const randomName = Math.random() < 0.5 ? gameState.partner1 : gameState.partner2;
        nameSpinner.textContent = randomName;
        spinCount++;

        if (spinCount > 20) {
            clearInterval(spinInterval);

            nameSpinner.style.display = 'none';
            selectedPlayerDiv.textContent = gameState.currentPlayer;

            // Move to choice screen after delay
            setTimeout(() => {
                switchScreen(selectionScreen, choiceScreen);

                // Resolve intensity for this round if random mode
                if (gameState.intensityPreference === 'random') {
                    resolveIntensity();
                }

                // Update player display with intensity info if random
                updateCurrentPlayerDisplay();
                updateScoreDisplay();
            }, 2000);
        }
    }, 100);
}

function updateCurrentPlayerDisplay() {
    // Show current player with intensity info if in random mode
    if (gameState.intensityPreference === 'random') {
        const intensityEmojis = {
            'sweet': '🌸',
            'romantic': '❤️',
            'passionate': '🔥',
            'explicit': '💋'
        };
        const emoji = intensityEmojis[gameState.intensityLevel] || '🎲';
        const intensityName = gameState.intensityLevel.charAt(0).toUpperCase() + gameState.intensityLevel.slice(1);
        currentPlayerDiv.innerHTML = `${gameState.currentPlayer}'s Turn <span class="intensity-badge">${emoji} ${intensityName}</span>`;
    } else {
        currentPlayerDiv.textContent = `${gameState.currentPlayer}'s Turn`;
    }
}

function updateScoreDisplay() {
    const p1Scores = gameState.scores.partner1;
    const p2Scores = gameState.scores.partner2;

    scoresDiv.innerHTML = `
        <div class="score-item">
            <div class="score-name">${gameState.partner1}</div>
            <div class="score-stats">Truths: ${p1Scores.truths} | Dares: ${p1Scores.dares}</div>
        </div>
        <div class="score-item">
            <div class="score-name">${gameState.partner2}</div>
            <div class="score-stats">Truths: ${p2Scores.truths} | Dares: ${p2Scores.dares}</div>
        </div>
    `;

    // Update intensity switcher to show current setting
    updateIntensitySwitcher();
}

function updateIntensitySwitcher() {
    // Update the visual state of intensity buttons
    document.querySelectorAll('.intensity-btn').forEach(btn => {
        if (btn.getAttribute('data-intensity') === gameState.intensityPreference) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function resolveIntensity() {
    // If random mode, pick a random intensity for this round
    if (gameState.intensityPreference === 'random') {
        const intensities = ['sweet', 'romantic', 'passionate', 'explicit'];
        // Weighted random: 25% sweet, 30% romantic, 30% passionate, 15% explicit
        const rand = Math.random();
        if (rand < 0.25) gameState.intensityLevel = 'sweet';
        else if (rand < 0.55) gameState.intensityLevel = 'romantic';
        else if (rand < 0.85) gameState.intensityLevel = 'passionate';
        else gameState.intensityLevel = 'explicit';
    } else {
        gameState.intensityLevel = gameState.intensityPreference;
    }
}

function getIntensityGuidance() {
    const guidance = {
        'sweet': {
            description: 'Sweet and innocent - romantic but PG-13',
            truthTone: 'Sweet, emotional, and heartfelt. Focus on feelings, appreciation, and romantic moments. Keep it PG-13.',
            truthExamples: 'When did you first know you were falling for me? What is your favorite memory of us together?',
            dareTone: 'Sweet and romantic. Physical affection that is tender and loving. Keep it PG-13.',
            dareExamples: 'Give your partner a 30-second kiss. Slow dance together for one song. Tell your partner 3 things you love about them while holding hands.'
        },
        'romantic': {
            description: 'Romantic and affectionate - moderate intimacy',
            truthTone: 'Romantic and revealing. Focus on attraction, desires, and deeper feelings. PG-13 to light R-rated.',
            truthExamples: 'What do you find most attractive about me? When do you feel most connected to me? What is your favorite thing I do for you?',
            dareTone: 'Romantic and moderately physical. Affectionate touching, kissing, intimate but not explicit. Light R-rated.',
            dareExamples: 'Give your partner a sensual massage for 2 minutes. Kiss your partner on the neck. Tell your partner what you want to do with them tonight.'
        },
        'passionate': {
            description: 'Passionate and steamy - high intimacy',
            truthTone: 'Passionate and revealing. Focus on attraction, sexual desires, and intimate fantasies. R-rated.',
            truthExamples: 'What is the sexiest thing I have ever done? Tell me about a sexual fantasy you have had about me. What turns you on most about my body?',
            dareTone: 'Passionate and sensual. Significant physical intimacy, sensual touching, steamy actions. R-rated.',
            dareExamples: 'Give your partner a sensual body massage wherever they want. Undress your partner down to their underwear. Whisper exactly what you want to do to them.'
        },
        'explicit': {
            description: 'Explicit and unrestricted - maximum intimacy',
            truthTone: 'Explicit and completely unrestricted. Focus on sexual desires, detailed fantasies, and intimate confessions. X-rated.',
            truthExamples: 'Describe in detail what you want me to do to you right now. What is your dirtiest fantasy about me? Tell me exactly how you like to be touched.',
            dareTone: 'Explicit and very physical. Maximum intimacy, sexual actions, no restrictions. X-rated.',
            dareExamples: 'Give your partner a lap dance for 2 minutes. Touch and kiss your partner anywhere they want for 3 minutes. Demonstrate exactly how you like to be pleased.'
        }
    };

    return guidance[gameState.intensityLevel];
}

async function handleChoice(choice) {
    switchScreen(choiceScreen, promptScreen);

    // Intensity is already resolved when showing the choice screen
    // Just display it
    promptPlayer.textContent = `${gameState.currentPlayer}'s ${choice === 'truth' ? 'Truth' : 'Dare'}`;
    promptLoading.style.display = 'block';
    promptDisplay.innerHTML = '';

    // Show/hide skip button based on choice
    skipDareBtn.style.display = choice === 'dare' ? 'block' : 'none';

    // Update scores
    const playerKey = gameState.currentPlayer === gameState.partner1 ? 'partner1' : 'partner2';
    if (choice === 'truth') {
        gameState.scores[playerKey].truths++;
    } else {
        gameState.scores[playerKey].dares++;
    }

    try {
        const guidance = getIntensityGuidance();
        const otherPartner = gameState.currentPlayer === gameState.partner1 ? gameState.partner2 : gameState.partner1;

        let prompt;
        if (choice === 'truth') {
            prompt = `Generate ONE truth question for a couples truth or dare game.

Current Player: ${gameState.currentPlayer}
Partner: ${otherPartner}
Intensity Level: ${gameState.intensityLevel.toUpperCase()} - ${guidance.description}

INTENSITY GUIDELINES:
${guidance.truthTone}

Example questions at this level:
${guidance.truthExamples}

Requirements:
- Make it PERSONAL and SPECIFIC to their relationship
- Use both partner names naturally in the question when appropriate
- Make it REVEALING and thought-provoking
- Keep it at ${gameState.intensityLevel} intensity level
- Should create intimacy and connection
- Be direct and clear

Return ONLY the question. No quotes, no extra words.`;
        } else {
            prompt = `Generate ONE dare for a couples truth or dare game.

Current Player: ${gameState.currentPlayer}
Partner: ${otherPartner}
Intensity Level: ${gameState.intensityLevel.toUpperCase()} - ${guidance.description}

INTENSITY GUIDELINES:
${guidance.dareTone}

Example dares at this level:
${guidance.dareExamples}

Requirements:
- Must be DOABLE RIGHT NOW in the moment
- Should involve BOTH partners physically or emotionally
- Keep it at ${gameState.intensityLevel} intensity level
- Be SPECIFIC about what to do
- Include a time duration if relevant (e.g., "for 2 minutes")
- Should create intimacy and connection
- Be direct and clear

Return ONLY the dare instruction. No quotes, no extra words.`;
        }

        const result = await callAIAPI(prompt, true);

        promptLoading.style.display = 'none';

        // Format the prompt nicely
        const formattedPrompt = result.trim().replace(/^["']|["']$/g, '');

        const icon = choice === 'truth' ? '💭' : '⚡';
        const title = choice === 'truth' ? 'Truth Question' : 'Dare Challenge';

        promptDisplay.innerHTML = `
            <div class="prompt-icon">${icon}</div>
            <h3 class="prompt-title">${title}</h3>
            <div class="prompt-text">${formattedPrompt}</div>
        `;
    } catch (error) {
        console.error('Error generating prompt:', error);
        promptLoading.innerHTML = `
            <p style="color: red;">Error: ${error.message}</p>
        `;
    }
}

async function skipDare() {
    // Regenerate a new dare
    promptLoading.style.display = 'block';
    promptDisplay.innerHTML = '';

    try {
        const guidance = getIntensityGuidance();
        const otherPartner = gameState.currentPlayer === gameState.partner1 ? gameState.partner2 : gameState.partner1;

        const prompt = `Generate ONE dare for a couples truth or dare game.

Current Player: ${gameState.currentPlayer}
Partner: ${otherPartner}
Intensity Level: ${gameState.intensityLevel.toUpperCase()} - ${guidance.description}

INTENSITY GUIDELINES:
${guidance.dareTone}

Example dares at this level:
${guidance.dareExamples}

Requirements:
- Must be DOABLE RIGHT NOW in the moment
- Should involve BOTH partners physically or emotionally
- Keep it at ${gameState.intensityLevel} intensity level
- Be SPECIFIC about what to do
- Include a time duration if relevant (e.g., "for 2 minutes")
- Should create intimacy and connection
- Be direct and clear
- Make it DIFFERENT from typical dares - be creative!

Return ONLY the dare instruction. No quotes, no extra words.`;

        const result = await callAIAPI(prompt, true);

        promptLoading.style.display = 'none';

        const formattedPrompt = result.trim().replace(/^["']|["']$/g, '');

        promptDisplay.innerHTML = `
            <div class="prompt-icon">⚡</div>
            <h3 class="prompt-title">New Dare Challenge</h3>
            <div class="prompt-text">${formattedPrompt}</div>
        `;
    } catch (error) {
        console.error('Error generating new dare:', error);
        promptLoading.innerHTML = `
            <p style="color: red;">Error: ${error.message}</p>
        `;
    }
}

async function callAIAPI(prompt, isTextResponse = false) {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiKey: gameState.apiKey,
                prompt: prompt,
                isTextResponse: isTextResponse,
                provider: gameState.provider
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }

        const content = data.content;

        if (isTextResponse) {
            return content.trim();
        }

        // Parse JSON response
        try {
            const jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(jsonText);
        } catch (e) {
            console.error('Failed to parse JSON:', content);
            throw new Error('Invalid response format from API');
        }
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Make sure you are running the proxy server on port 3003. Run: python3 proxy-server.py');
        }
        throw error;
    }
}

function startNewRound() {
    // Reset selection screen
    nameSpinner.style.display = 'block';
    nameSpinner.textContent = '';
    selectedPlayerDiv.textContent = '';

    gameState.lastPlayer = gameState.currentPlayer;

    switchScreen(promptScreen, selectionScreen);
    selectRandomPlayer();
}

function endGame() {
    if (confirm('Are you sure you want to end the game?')) {
        const p1Scores = gameState.scores.partner1;
        const p2Scores = gameState.scores.partner2;

        alert(`Final Scores:\n\n${gameState.partner1}:\nTruths: ${p1Scores.truths} | Dares: ${p1Scores.dares}\n\n${gameState.partner2}:\nTruths: ${p2Scores.truths} | Dares: ${p2Scores.dares}\n\nThanks for playing!`);

        // Reset game state
        gameState.currentPlayer = null;
        gameState.lastPlayer = null;
        gameState.scores = {
            partner1: { truths: 0, dares: 0 },
            partner2: { truths: 0, dares: 0 }
        };

        // Reset screens
        nameSpinner.style.display = 'block';
        nameSpinner.textContent = '';
        selectedPlayerDiv.textContent = '';

        switchScreen(promptScreen, setupScreen);
    }
}
