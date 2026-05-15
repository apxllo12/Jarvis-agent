require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Define the tools the agent can use.
 * Each tool is a function that takes arguments and returns a string.
 */
const tools = {
  get_weather: async ({ location }) => {
    console.log(`   [Tool] Fetching weather for ${location}...`);
    // In a real app, call a weather API here
    return `The weather in ${location} is 72°F and partly cloudy.`;
  },
  search_wikipedia: async ({ query }) => {
    console.log(`   [Tool] Searching Wikipedia for "${query}"...`);
    // Simulated search result
    return `Wikipedia entry for ${query}: An autonomous agent is a system situated within and a part of an environment that senses that environment and acts on it over time.`;
  }
};

const SYSTEM_PROMPT = `
You are an autonomous research agent. You solve tasks by thinking step-by-step and using tools.

Your response MUST be a valid JSON object with the following structure:
{
  "thought": "Your reasoning about what to do next",
  "action": "The name of the tool to use (optional)",
  "actionInput": { "argName": "value" } (optional),
  "finalAnswer": "The final answer to the user's request (optional)"
}

Available tools:
- get_weather: { location: string }
- search_wikipedia: { query: string }

If you have enough information to answer the user, provide a "finalAnswer" and no "action".
`;

async function runAgent(goal) {
  let messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: goal }
  ];

  console.log(`\nGoal: ${goal}\n${'='.repeat(50)}`);

  for (let i = 0; i < 5; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-2024-05-13', // Or another model
        messages: messages,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      console.log(`\nStep ${i + 1}:`);
      console.log(`Thought: ${result.thought}`);

      if (result.finalAnswer) {
        console.log(`\nFinal Answer: ${result.finalAnswer}`);
        return result.finalAnswer;
      }

      if (result.action && tools[result.action]) {
        console.log(`Action: ${result.action}(${JSON.stringify(result.actionInput)})`);
        
        const observation = await tools[result.action](result.actionInput);
        console.log(`Observation: ${observation}`);

        // Add the agent's thought and the observation to the history
        messages.push({ role: 'assistant', content: JSON.stringify(result) });
        messages.push({ role: 'system', content: `Observation: ${observation}` });
      } else {
        console.log("No valid action taken. Ending loop.");
        break;
      }
    } catch (error) {
      console.error("Error during agent execution:", error.message);
      break;
    }
  }
}

// Example usage:
if (process.env.OPENAI_API_KEY) {
  runAgent("What is the weather in New York and what is the definition of an autonomous agent?");
} else {
  console.log("Please set OPENAI_API_KEY in your .env file to run the real agent.");
  console.log("Running the mock version (index.js) instead...");
  require('./index.js');
}
