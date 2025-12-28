# 💕 Couples Game - Truth or Dare

An AI-powered Truth or Dare game designed exclusively for couples to deepen intimacy, spark connection, and have fun together!

## 🎯 What is This?

A romantic Truth or Dare game that uses AI to generate personalized prompts for couples. Choose your intensity level, take turns between partners, and explore each other through revealing truths and intimate dares.

## ✨ Features

- **🎲 Truth or Dare Gameplay** - Classic game reimagined for couples
- **🌡️ 4 Intensity Levels** - From sweet to explicit, choose your comfort level
- **📊 Score Tracking** - See who's braver and who's more open
- **🔄 Skip Dares** - Don't like a dare? Get a new one!
- **🤖 AI-Powered** - Every prompt is unique and personalized via Google Gemini
- **🔐 Secure** - API keys are managed server-side via Google Secret Manager
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
- Python 3.12+ installed
- Modern web browser
- Google Cloud Project with Secret Manager enabled

### Local Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment:**
   Create a `.env` file or set environment variables:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   COUPLES_PASSWORD=your_app_password
   ```
   *Note: In production/GCP, the app will automatically look for a secret named `GOOGLE_AI_STUDIO_API_KEY`.*

3. **Start the server:**
   ```bash
   python3 server.py
   ```

4. **Open your browser:**
   - Go to: `http://localhost:8080` (or `http://localhost:3003` if using `proxy-server.py`)

## 🎮 How to Play

### Setup Phase
1. Log in with your password
2. Enter Partner 1's name
3. Enter Partner 2's name
4. Choose intensity level
5. Click "Start Game!"

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

```env
# AI Model Configuration
GOOGLE_MODEL=gemini-3-flash-preview
GOOGLE_CLOUD_PROJECT=your-project-id
```

### Supported Models

The app is optimized for **Google Gemini**:
- `gemini-3-flash-preview` (default, recommended)
- `gemini-2.0-flash`
- `gemini-1.5-pro`

## 🔐 Privacy & Security

- **Server-Side API Keys:** No more entering API keys in the browser. 
- **Secret Manager:** Integration with Google Cloud Secret Manager for secure key handling.
- **Local Processing:** Prompt generation happens via the official Gemini SDK.
- **No Storage:** Nothing is saved or logged
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
