# 💕 Couples Game - Truth or Dare

An AI-powered Truth or Dare game designed exclusively for couples to deepen intimacy, spark connection, and have fun together!

## 🎯 What is This?

A romantic Truth or Dare game that uses AI to generate personalized prompts for couples. Choose your intensity level, take turns between partners, and explore each other through revealing truths and intimate dares.

## ✨ Features

- **🎲 Truth or Dare Gameplay** - Classic game reimagined for couples
- **🌡️ 4 Intensity Levels** - From sweet to explicit, choose your comfort level
- **📊 Score Tracking** - See who's braver and who's more open
- **🔄 Skip Dares** - Don't like a dare? Get a new one!
- **🤖 AI-Powered** - Every prompt is unique and personalized
- **🔐 Private & Secure** - Everything runs locally on your computer
- **💕 Romantic Design** - Beautiful pink/red gradient aesthetic

## 🌡️ Intensity Levels

### 🌸 Sweet
- **Vibe:** Innocent & PG-13
- **Best For:** New couples, building emotional connection
- **Examples:** "When did you first know you were falling for me?", "Give your partner a 30-second kiss"

### ❤️ Romantic (Default)
- **Vibe:** Affectionate & Tender
- **Best For:** Most couples, romantic date nights
- **Examples:** "What do you find most attractive about me?", "Give your partner a sensual neck massage"

### 🔥 Passionate
- **Vibe:** Steamy & Sensual (R-rated)
- **Best For:** Established couples, private settings
- **Examples:** "Tell me about a sexual fantasy you've had about me", "Undress your partner down to their underwear"

### 💋 Explicit
- **Vibe:** Unrestricted & Bold (X-rated)
- **Best For:** Very comfortable couples, maximum intimacy
- **Examples:** "Describe in detail what you want me to do to you right now", "Give your partner a lap dance for 2 minutes"

## 🚀 Quick Start

### Prerequisites
- Python 3.x installed
- Modern web browser (Chrome, Firefox, Safari, Edge)
- API key from one of the supported providers:
  - [Google AI Studio](https://aistudio.google.com/app/apikey) (Free)
  - [OpenAI Platform](https://platform.openai.com/api-keys) (Paid)
  - [Anthropic Console](https://console.anthropic.com/) (Paid)

### Installation

1. **Navigate to the couples directory:**
   ```bash
   cd /Users/ashwin/Documents/Code/Game/couples/
   ```

2. **Start the server:**
   ```bash
   python3 proxy-server.py
   ```

3. **Open your browser:**
   - Go to: `http://localhost:3003`

4. **Start playing:**
   - Enter both partner names
   - Choose your intensity level
   - Select AI provider and enter API key
   - Click "Start Game!"

## 🎮 How to Play

### Setup Phase
1. Enter Partner 1's name
2. Enter Partner 2's name
3. Choose intensity level (🌸 Sweet, ❤️ Romantic, 🔥 Passionate, 💋 Explicit)
4. Select AI provider (Google Gemini, Anthropic Claude, or OpenAI GPT)
5. Enter your API key
6. Click "Start Game!"

### Gameplay Loop
1. **Player Selection** - Random spinner selects who goes first
2. **Choose Truth or Dare** - Selected player makes their choice
3. **Complete the Prompt** - Answer the truth or do the dare
4. **Skip Option** - For dares only, click "Skip & Get New Dare"
5. **Next Round** - Click "Done" to move to the next player
6. **Repeat** - Continue playing as long as you want!

### Scoring
- Each truth answered adds +1 to your Truth score
- Each dare completed adds +1 to your Dare score
- See who's braver (more dares) vs. more revealing (more truths)
- View final scores when you end the game

## 🔧 Configuration

### Environment Variables

Create a `.env` file to customize AI models:

```env
# AI Model Configuration
GOOGLE_MODEL=gemini-2.0-flash
ANTHROPIC_MODEL=claude-sonnet-4-20250514
OPENAI_MODEL=gpt-4o-mini
```

### Supported Models

**Google Gemini:**
- `gemini-2.0-flash` (default, recommended)
- `gemini-1.5-pro`
- `gemini-1.5-flash`

**Anthropic Claude:**
- `claude-sonnet-4-20250514` (default, recommended)
- `claude-3-5-sonnet-20241022`
- `claude-3-opus-20240229`

**OpenAI:**
- `gpt-4o-mini` (default, recommended)
- `gpt-4o`
- `gpt-4-turbo`

## 🔐 Privacy & Security

- **Local Processing:** All game data stays on your computer
- **No Storage:** Nothing is saved or logged
- **API Keys:** Stored only in browser memory, cleared on refresh
- **Private:** Your truths and dares are never sent anywhere except to the AI provider for generation

## 💡 Tips for Best Experience

### Setting the Mood
- 🕯️ **Ambiance:** Dim lights, candles, comfortable setting
- 🎵 **Music:** Soft romantic music in the background
- 🍷 **Refreshments:** Wine, champagne, or your favorite drinks
- 📵 **Privacy:** Put phones away, close the door

### Gameplay Tips
- **Start Lower:** Begin with Sweet or Romantic, work your way up
- **Be Honest:** Truths work best with vulnerability
- **Have Fun:** Don't take it too seriously
- **Consent:** Both partners should agree on intensity level
- **Skip Freely:** Not comfortable? Skip and get a new dare
- **Take Your Time:** No rush, enjoy the moment

### Intensity Recommendations
- **🌸 Sweet:** First time playing, building emotional bond, semi-public settings
- **❤️ Romantic:** Regular couples, date night, home setting
- **🔥 Passionate:** Established couples, private bedroom, ready to heat up
- **💋 Explicit:** Very comfortable, completely private, no limits

## 🛠️ Troubleshooting

### Server won't start
- Check if port 3003 is already in use
- Try a different port by editing `PORT = 3003` in `proxy-server.py`

### API errors
- Verify your API key is correct
- Check you have credits/quota remaining
- Ensure you selected the right provider
- Try a different AI provider

### Prompts not loading
- Check internet connection
- Verify proxy server is running
- Check browser console for errors
- Try refreshing the page

## 🎨 Customization

### Change Port
Edit `proxy-server.py`:
```python
PORT = 3003  # Change to your preferred port
```

### Change Default Intensity
Edit `app.js`:
```javascript
intensityLevel: 'romantic', // Change to: 'sweet', 'passionate', or 'explicit'
```

### Change Colors
Edit `styles.css` - modify the gradient:
```css
background: linear-gradient(135deg, #f5576c 0%, #ff6ec4 100%);
```

## 📝 Game Rules

### For Truths
- Answer honestly and completely
- No partial answers
- Take your time to think
- Be vulnerable and open

### For Dares
- Complete the dare fully
- Follow the time limits specified
- Can skip unlimited times (no penalty)
- Must complete before moving to next round

### Scoring
- Truth answered = +1 Truth point
- Dare completed = +1 Dare point
- Skipped dares don't count
- Scores shown in real-time

## ⚠️ Important Notes

- **Age Restriction:** Passionate and Explicit levels are for adults only (18+)
- **Consent:** Both partners must agree to the intensity level chosen
- **Privacy:** Play in a private setting, especially at higher intensity levels
- **Comfort:** Either partner can end the game or skip at any time
- **Respect:** Honor boundaries and comfort levels

## 🤝 Support

### Need Help?
- Check the troubleshooting section above
- Verify your API key is working
- Try a different AI provider
- Restart the server

### Want Different Prompts?
- Skip and regenerate (for dares)
- Try a different intensity level
- Switch AI providers for variety

## 📖 Example Round

```
1. Sarah is selected (random spinner)
2. Sarah chooses: TRUTH
3. AI generates: "What part of Alex's body do you find most attractive and why?"
4. Sarah answers honestly
5. Score updated: Sarah: 💭1 | ⚡0
6. Click "Done - Next Round"
7. Alex is selected
8. Alex chooses: DARE
9. AI generates: "Give Sarah a sensual neck massage for 2 minutes"
10. Alex completes the dare
11. Score updated: Sarah: 💭1 | ⚡0, Alex: 💭0 | ⚡1
12. Continue playing...
```

## 🎯 Game Strategies

### Truth Seekers
Focus on truths to learn deep insights about your partner
- Build emotional intimacy
- Discover hidden thoughts
- Share vulnerabilities

### Dare Devils
Focus on dares for physical connection
- Build physical intimacy
- Create exciting moments
- Push boundaries (safely)

### Balanced Approach
Mix truths and dares for complete intimacy
- Emotional + physical connection
- Varied gameplay
- Best overall experience

## 🌟 What Makes This Special

Unlike generic truth or dare games:
- ✅ **Personalized** - Uses your actual names
- ✅ **AI-Powered** - Unlimited unique prompts
- ✅ **Couple-Focused** - Designed specifically for romantic partners
- ✅ **Intensity Control** - Perfect difficulty for your relationship
- ✅ **Score Tracking** - Adds friendly competition
- ✅ **Skip Feature** - No pressure, just fun
- ✅ **Beautiful Design** - Romantic pink/red aesthetic

## 🎊 Have Fun!

This game is designed to help couples:
- 💑 Deepen emotional intimacy
- 🔥 Spark physical connection
- 😂 Have fun together
- 💬 Communicate openly
- ❤️ Feel closer

**Enjoy your time together!** 💕

---

**Server:** `http://localhost:3003`
**Port:** 3003
**Version:** 1.0.0
**For:** Couples Only 💕
