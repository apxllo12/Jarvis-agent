require('dotenv').config();
const fs = require('fs');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * JARVIS-1: An agent that persists memory to a file to "learn" over time.
 */
class Jarvis {
  constructor() {
    this.memoryPath = './jarvis_memory.json';
    this.history = this.loadMemory();
  }

  loadMemory() {
    if (fs.existsSync(this.memoryPath)) {
      return JSON.parse(fs.readFileSync(this.memoryPath, 'utf8'));
    }
    return {
      facts: [],       // Things it has learned
      interactions: [], // Past conversations
      userPreferences: {} 
    };
  }

  saveMemory() {
    fs.writeFileSync(this.memoryPath, JSON.stringify(this.history, null, 2));
  }

  async learn(observation) {
    console.log("   [Learning] Internalizing new information...");
    // We ask the LLM to extract "permanent facts" from an observation
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Extract key facts or user preferences from this observation to remember forever. Return as a short list." },
        { role: "user", content: observation }
      ]
    });
    const fact = response.choices[0].message.content;
    this.history.facts.push({ date: new Date(), fact });
    this.saveMemory();
  }

  async think(userInput) {
    const context = JSON.stringify(this.history.facts.slice(-10)); // Provide recent facts
    
    console.log(`\nUser: ${userInput}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `You are JARVIS. Use your learned facts to help: ${context}` },
        { role: "user", content: userInput }
      ]
    });

    const reply = response.choices[0].message.content;
    console.log(`JARVIS: ${reply}`);

    // Automatically try to learn from the interaction
    await this.learn(`User said: ${userInput}. I replied: ${reply}`);
  }
}

// To use this, you would run:
// const jarvis = new Jarvis();
// jarvis.think("Remember that my favorite coffee is a flat white.");
