// Game State
const gameState = {
    partner1: '',
    partner2: '',
    provider: 'google', // Default to google
    roundCount: 0,
    memoryContext: '',
    isVoiceEnabled: false,
    usedQuestions: [],
    intensityPreference: 'romantic', // 'random', 'sweet', 'romantic', 'passionate', 'explicit'
    intensityLevel: 'romantic', // Current actual intensity (resolved from preference)
    currentPlayer: null,
    scores: {
        partner1: { truths: 0, dares: 0 },
        partner2: { truths: 0, dares: 0 }
    },
    lastPlayer: null
};

// Question Pool Management
const POOL_SIZE = 10;

const WILDCARDS = [
    "Staring Contest: Stare into each other's eyes for 60 seconds without blinking.",
    "Thumb War: Best of 3 wins a kiss.",
    "Sync Breathing: Hold hands and synchronize your breathing for 1 minute.",
    "Compliment Battle: Go back and forth giving compliments until someone hesitates.",
    "Massage Swap: 1 minute shoulder massage for each partner.",
    "Whisper Challenge: Whisper a sentence, partner has to guess what you said.",
    "Slow Dance: Play a song and slow dance for 1 minute.",
    "Forehead Touch: Touch foreheads and close eyes for 30 seconds.",
    "Role Reversal: Imitate your partner for the next round.",
    "Phone Swap: Let your partner scroll through your photos for 1 minute."
];

function getPoolKey(intensity, type, playerName) {
    // Sanitize player name for storage key
    const safeName = playerName.replace(/[^a-zA-Z0-9]/g, '');
    return `couples_pool_${intensity}_${type}_${safeName} `;
}

function getUsedQuestionsKey() {
    return 'couples_used_questions_session';
}

function getQuestionPool(intensity, type, playerName) {
    const key = getPoolKey(intensity, type, playerName);
    const pool = localStorage.getItem(key);
    return pool ? JSON.parse(pool) : [];
}

function saveQuestionPool(intensity, type, questions, playerName) {
    const key = getPoolKey(intensity, type, playerName);
    localStorage.setItem(key, JSON.stringify(questions));
}

function getUsedQuestions() {
    const used = sessionStorage.getItem(getUsedQuestionsKey());
    return used ? JSON.parse(used) : [];
}

function addUsedQuestion(question) {
    const used = getUsedQuestions();
    used.push(question);
    sessionStorage.setItem(getUsedQuestionsKey(), JSON.stringify(used));
}

function popQuestionFromPool(intensity, type, playerName) {
    const pool = getQuestionPool(intensity, type, playerName);
    if (pool.length === 0) return null;

    const question = pool.shift(); // Take first question
    saveQuestionPool(intensity, type, pool, playerName);
    return question;
}

async function generateQuestionPool(intensity, type, playerName) {
    const guidance = getIntensityGuidance(intensity);
    const usedQuestions = getUsedQuestions();
    // Determine other partner based on the specific player we are generating for
    const otherPartner = playerName === gameState.partner1 ? gameState.partner2 : gameState.partner1;

    let usedQuestionsText = '';
    if (usedQuestions.length > 0) {
        usedQuestionsText = `\n\nPREVIOUSLY USED QUESTIONS(DO NOT REPEAT THESE): \n${usedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')} `;
    }

    let memoryContextText = '';
    if (gameState.memoryContext) {
        memoryContextText = `\nCONTEXT / MEMORIES: The couple has shared this context: "${gameState.memoryContext}".Use this to make questions specific and personal if possible.`;
    }

    let prompt;
    if (type === 'truth') {
        prompt = `Generate EXACTLY ${POOL_SIZE} unique truth questions for a couples truth or dare game.

Current Player: ${playerName}
Partner: ${otherPartner}
Intensity Level: ${intensity.toUpperCase()} - ${guidance.description}
${memoryContextText}

INTENSITY GUIDELINES:
${guidance.truthTone}

Example questions at this level:
${guidance.truthExamples}

Requirements:
- Generate EXACTLY ${POOL_SIZE} different questions
    - Make them PERSONAL and SPECIFIC to their relationship
        - Use both partner names naturally in the questions when appropriate
            - Make them REVEALING and thought - provoking
                - Keep ALL questions at ${intensity} intensity level
                    - Should create intimacy and connection
                        - Be direct and clear
                            - Each question must be DIFFERENT from each other${usedQuestionsText}

Return ONLY a JSON array of ${POOL_SIZE} questions.Format: ["question 1", "question 2", ...]
No markdown, no extra text, just the JSON array.`;
    } else {
        prompt = `Generate EXACTLY ${POOL_SIZE} unique dares for a couples truth or dare game.

Current Player: ${playerName}
Partner: ${otherPartner}
Intensity Level: ${intensity.toUpperCase()} - ${guidance.description}
${memoryContextText}

INTENSITY GUIDELINES:
${guidance.dareTone}

Example dares at this level:
${guidance.dareExamples}

Requirements:
- Generate EXACTLY ${POOL_SIZE} different dares
    - Must be DOABLE RIGHT NOW in the moment
        - Should involve BOTH partners physically or emotionally
            - Keep ALL dares at ${intensity} intensity level
                - Be SPECIFIC about what to do
    - Include a time duration if relevant(e.g., "for 2 minutes")
        - Should create intimacy and connection
            - Be direct and clear
                - Each dare must be DIFFERENT from each other${usedQuestionsText}

Return ONLY a JSON array of ${POOL_SIZE} dares.Format: ["dare 1", "dare 2", ...]
No markdown, no extra text, just the JSON array.`;
    }

    try {
        const result = await callAIAPI(prompt, true);

        // Parse the JSON array
        let questions;
        try {
            // Robustly extract JSON array (handling potential markdown or intro text)
            const match = result.match(/\[[\s\S]*\]/);
            const cleanedResult = match ? match[0] : result;
            questions = JSON.parse(cleanedResult);

            if (!Array.isArray(questions)) {
                throw new Error('Response is not an array');
            }

            // Ensure we have exactly POOL_SIZE questions
            if (questions.length < POOL_SIZE) {
                console.warn(`Generated only ${questions.length} questions instead of ${POOL_SIZE} `);
            }

            // Take only the first POOL_SIZE questions
            questions = questions.slice(0, POOL_SIZE);

        } catch (parseError) {
            console.error('Failed to parse questions array:', result);
            throw new Error('Invalid response format from AI');
        }

        // Save to localStorage
        saveQuestionPool(intensity, type, questions, playerName);

        return questions;
    } catch (error) {
        console.error('Error generating question pool:', error);
        throw error;
    }
}

// DOM Elements - Initialized in DOMContentLoaded
let setupScreen, selectionScreen, choiceScreen, promptScreen;
let partner1Input, partner2Input, apiKeyInput, memoryCtxInput, startGameBtn;
let nameSpinner, selectedPlayerDiv, currentPlayerDiv;
let truthBtn, dareBtn, scoresDiv;
let promptPlayer, promptLoading, promptDisplay, nextRoundBtn, skipDareBtn, endGameBtn, voiceToggleBtn;

// Robust Initialization
function init() {
    console.log('Initializing App...');

    // Initialize DOM Elements
    setupScreen = document.getElementById('setup-screen');
    selectionScreen = document.getElementById('selection-screen');
    choiceScreen = document.getElementById('choice-screen');
    promptScreen = document.getElementById('prompt-screen');

    partner1Input = document.getElementById('partner1-name');
    partner2Input = document.getElementById('partner2');
    apiKeyInput = document.getElementById('api-key');
    memoryCtxInput = document.getElementById('memoryCtx');
    startGameBtn = document.getElementById('start-game-btn');

    nameSpinner = document.getElementById('name-spinner');
    selectedPlayerDiv = document.getElementById('selected-player');
    currentPlayerDiv = document.getElementById('current-player');

    truthBtn = document.getElementById('truth-btn');
    dareBtn = document.getElementById('dare-btn');
    scoresDiv = document.getElementById('scores');

    promptPlayer = document.getElementById('prompt-player');
    promptLoading = document.getElementById('prompt-loading');
    promptDisplay = document.getElementById('prompt-display');
    nextRoundBtn = document.getElementById('next-round-btn');
    skipDareBtn = document.getElementById('skip-dare-btn');
    endGameBtn = document.getElementById('end-game-btn');
    voiceToggleBtn = document.getElementById('voice-toggle-btn');

    // Attach Event Listeners
    if (partner1Input) partner1Input.addEventListener('input', updateStartButton);
    if (partner2Input) partner2Input.addEventListener('input', updateStartButton);
    if (memoryCtxInput) {
        memoryCtxInput.addEventListener('input', () => {
            gameState.memoryContext = memoryCtxInput.value.trim();
        });
    }

    if (startGameBtn) {
        console.log('Attaching Start Game listener');
        startGameBtn.addEventListener('click', startGame);
    } else {
        console.error('CRITICAL: Start Game button not found in DOM');
    }

    if (truthBtn) truthBtn.addEventListener('click', () => handleChoice('truth'));
    if (dareBtn) dareBtn.addEventListener('click', () => handleChoice('dare'));
    if (nextRoundBtn) nextRoundBtn.addEventListener('click', startNewRound);
    if (skipDareBtn) skipDareBtn.addEventListener('click', skipDare);
    if (endGameBtn) endGameBtn.addEventListener('click', endGame);
    if (voiceToggleBtn) voiceToggleBtn.addEventListener('click', toggleVoiceMode);

    // Intensity listeners
    initializeIntensityListeners();
    console.log('App Initialized Successfully');
}

// Check if DOM is already ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/* --- CUSTOM MODAL IMPLEMENTATION --- */
function showModal(title, body, buttons = []) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const actionsEl = document.getElementById('modal-actions');

        if (!overlay) {
            // Fallback if modal elements missing
            console.error('Modal elements missing');
            return resolve(false);
        }

        titleEl.textContent = title;
        // Allow HTML in body for formatting
        bodyEl.innerHTML = body.replace(/\n/g, '<br>');
        actionsEl.innerHTML = '';

        if (buttons.length === 0) {
            // Default OK button
            buttons = [{ text: 'OK', primary: true, value: true }];
        }

        buttons.forEach(btn => {
            const btnEl = document.createElement('button');
            btnEl.textContent = btn.text;
            btnEl.className = `modal-btn ${btn.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}`;
            btnEl.onclick = () => {
                overlay.classList.remove('active');
                resolve(btn.value);
            };
            actionsEl.appendChild(btnEl);
        });

        overlay.classList.add('active');
    });
}

function initializeIntensityListeners() {
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
            updateTheme(gameState.intensityLevel);
        });
    });

    // Intensity switcher listeners (during gameplay)
    document.querySelectorAll('.intensity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const intensity = btn.getAttribute('data-intensity');
            // The voice toggle button also has class 'intensity-btn' but no data-intensity
            if (!intensity) return;
            gameState.intensityPreference = intensity;
            // If random is selected, keep current level until next resolution
            if (intensity !== 'random') {
                gameState.intensityLevel = intensity;
            }
            updateIntensitySwitcher();
            updateTheme(gameState.intensityLevel);
        });
    });
}

function updateAPILink() {
    const apiLink = document.getElementById('api-link');
    if (apiLink) {
        apiLink.innerHTML = 'Get your free Gemini API key from <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>';
    }
    if (apiKeyInput) {
        apiKeyInput.placeholder = 'Enter your Gemini API Key';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (startGameBtn) startGameBtn.addEventListener('click', startGame);
    if (truthBtn) truthBtn.addEventListener('click', () => handleChoice('truth'));
    if (dareBtn) dareBtn.addEventListener('click', () => handleChoice('dare'));
    if (nextRoundBtn) nextRoundBtn.addEventListener('click', startNewRound);
    if (skipDareBtn) skipDareBtn.addEventListener('click', skipDare);
    if (endGameBtn) endGameBtn.addEventListener('click', endGame);
});

// Functions
function updateStartButton() {
    if (partner1Input) gameState.partner1 = partner1Input.value.trim();
    if (partner2Input) gameState.partner2 = partner2Input.value.trim();
    // We handle validation in startGame() now
}

function switchScreen(hideScreen, showScreen) {
    hideScreen.classList.remove('active');
    showScreen.classList.add('active');
}

function startGame(e) {
    if (e) e.preventDefault();
    console.log('🚀 Start Game function triggered!');

    // Explicitly capture all values
    const p1 = partner1Input ? partner1Input.value : '';
    const p2 = partner2Input ? partner2Input.value : '';

    console.log('Captured Values:', {
        p1: '"' + p1 + '"',
        p2: '"' + p2 + '"'
    });

    // Validate
    if (!p1.trim() || !p2.trim()) {
        console.warn('❌ Validation Failed: Missing names');
        alert('Please enter both names to start!');
        return;
    }

    gameState.partner1 = p1.trim();
    gameState.partner2 = p2.trim();
    gameState.memoryContext = memoryCtxInput ? memoryCtxInput.value.trim() : '';

    console.log('✅ Validation passed. Switching screens...');
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
        currentPlayerDiv.innerHTML = `${gameState.currentPlayer} 's Turn <span class="intensity-badge">${emoji} ${intensityName}</span>`;
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

function updateTheme(intensity) {
    // Remove existing theme classes
    document.body.classList.remove('theme-sweet', 'theme-romantic', 'theme-passionate', 'theme-explicit');
    // Add new theme class
    document.body.classList.add(`theme-${intensity}`);
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

function getIntensityGuidance(intensityLevel = null) {
    const level = intensityLevel || gameState.intensityLevel;

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

    return guidance[level];
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

    // Increment Round Count
    gameState.roundCount++;

    // Check for Escalation (Every 5 rounds)
    if (gameState.roundCount > 0 && gameState.roundCount % 5 === 0) {
        checkEscalation();
    }

    try {
        let question;
        let isWildcard = false;

        // 10% Chance for Wildcard (if not explicitly choosing Truth/Dare specific logic that forbids it, but let's allow it as a surprise)
        if (Math.random() < 0.1) {
            isWildcard = true;
            question = WILDCARDS[Math.floor(Math.random() * WILDCARDS.length)];
        } else {
            // Normal Question Flow
            // Try to get a question from the pool
            question = popQuestionFromPool(gameState.intensityLevel, choice, gameState.currentPlayer);

            // If pool is empty, generate a new pool
            if (!question) {
                promptLoading.innerHTML = '<p>Generating fresh questions...</p>';
                await generateQuestionPool(gameState.intensityLevel, choice, gameState.currentPlayer);
                question = popQuestionFromPool(gameState.intensityLevel, choice, gameState.currentPlayer);
            }
        }

        if (!question) {
            throw new Error('Failed to generate questions');
        }

        // Add to used questions
        addUsedQuestion(question);

        promptLoading.style.display = 'none';

        // Format the prompt nicely
        const formattedPrompt = question.trim().replace(/^["']|["']$/g, '');

        let icon = choice === 'truth' ? '💭' : '⚡';
        let title = choice === 'truth' ? 'Truth Question' : 'Dare Challenge';

        if (isWildcard) {
            icon = '🃏';
            title = 'WILDCARD!';
        }

        promptDisplay.innerHTML = `
            <div class="prompt-icon">${icon}</div>
            <h3 class="prompt-title">${title}</h3>
            <div class="prompt-text">${formattedPrompt}</div>
        `;

        // Speak the prompt
        speakText(formattedPrompt);
    } catch (error) {
        console.error('Error generating prompt:', error);
        promptLoading.innerHTML = `
            <p style="color: red;">Error: ${error.message}</p>
        `;
    }
}

function checkEscalation() {
    const levels = ['sweet', 'romantic', 'passionate', 'explicit'];
    const currentIdx = levels.indexOf(gameState.intensityLevel);

    if (currentIdx < levels.length - 1) {
        const nextLevel = levels[currentIdx + 1];

        // Use custom modal instead of alert
        showModal(
            'Things are heating up! 🔥',
            `Moving to ${nextLevel.toUpperCase()} level!`,
            [{ text: "Let's Go!", primary: true, value: true }]
        );

        gameState.intensityLevel = nextLevel;
        updateTheme(nextLevel);

        // Find the radio button and check it
        const radio = document.querySelector(`input[name="intensity"][value="${nextLevel}"]`);
        if (radio) radio.checked = true;
    }
}

async function skipDare() {
    // Get a new dare from the pool
    promptLoading.style.display = 'block';
    promptDisplay.innerHTML = '';

    try {
        // Try to get a dare from the pool
        let question = popQuestionFromPool(gameState.intensityLevel, 'dare', gameState.currentPlayer);

        // If pool is empty, generate a new pool
        if (!question) {
            promptLoading.innerHTML = '<p>Generating fresh dares...</p>';
            await generateQuestionPool(gameState.intensityLevel, 'dare', gameState.currentPlayer);
            question = popQuestionFromPool(gameState.intensityLevel, 'dare', gameState.currentPlayer);
        }

        if (!question) {
            throw new Error('Failed to generate dares');
        }

        // Add to used questions
        addUsedQuestion(question);

        promptLoading.style.display = 'none';

        const formattedPrompt = question.trim().replace(/^["']|["']$/g, '');

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
    console.log('Calling Gemini API');

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                isTextResponse: isTextResponse
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

async function endGame() {
    // Custom Modal Confirmation
    const confirmed = await showModal(
        'End Game?',
        'Are you sure you want to end the game now?',
        [
            { text: 'Cancel', primary: false, value: false },
            { text: 'End Game', primary: true, value: true }
        ]
    );

    if (confirmed) {
        const p1Scores = gameState.scores.partner1;
        const p2Scores = gameState.scores.partner2;
        const totalRounds = p1Scores.truths + p1Scores.dares + p2Scores.truths + p2Scores.dares;

        // Calculate Connection Score (Mock Algorithm)
        // Base score 60 + 2 points per round + bonus for higher intensity
        let score = 60 + (totalRounds * 2);
        if (gameState.intensityLevel === 'passionate') score += 10;
        if (gameState.intensityLevel === 'explicit') score += 20;
        if (score > 100) score = 100;

        // Determine Vibe
        let vibe = 'Playful & Cute';
        if (score > 80) vibe = 'Deeply Connected';
        if (score > 90) vibe = 'Soulmates';
        if (gameState.intensityLevel === 'explicit' && totalRounds > 5) vibe = 'Sensual & Spicy';

        const message = `
📊 <strong>GAME OVER SUMMARY</strong> 📊

<strong>${gameState.partner1}</strong>: ${p1Scores.truths} Truths | ${p1Scores.dares} Dares
<strong>${gameState.partner2}</strong>: ${p2Scores.truths} Truths | ${p2Scores.dares} Dares

🔥 Final Intensity: ${gameState.intensityLevel.toUpperCase()}
❤️ Connection Score: ${score}/100
✨ Relationship Vibe: ${vibe}

Thanks for playing!
        `;

        await showModal('Game Over', message, [{ text: 'Back to Start', primary: true, value: true }]);

        // Force reload for a clean slate
        window.location.reload();
    }
}

// Voice Mode Functions
function toggleVoiceMode() {
    gameState.isVoiceEnabled = !gameState.isVoiceEnabled;

    if (voiceToggleBtn) {
        if (gameState.isVoiceEnabled) {
            voiceToggleBtn.textContent = '🔊 Voice Mode: ON';
            voiceToggleBtn.style.color = '#e91e63';
            voiceToggleBtn.style.borderColor = '#e91e63';
        } else {
            voiceToggleBtn.textContent = '🔊 Voice Mode: OFF';
            voiceToggleBtn.style.color = '#555';
            voiceToggleBtn.style.borderColor = 'transparent';
            // Stop any ongoing speech
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }
    }
}

function speakText(text) {
    if (!gameState.isVoiceEnabled) return;

    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to use a female voice if available
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice =>
            voice.name.includes('Female') ||
            voice.name.includes('Samantha') ||
            voice.name.includes('Karen') ||
            voice.name.includes('Moira')
        );

        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
}
