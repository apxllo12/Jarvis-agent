/**
 * Simple Autonomous Agent in Node.js (Mock Version)
 */

class SimpleAgent {
  constructor(name, tools) {
    this.name = name;
    this.tools = tools;
    this.memory = [];
  }

  // A smarter mock LLM call to demonstrate the state change
  async callLLM(history) {
    const lastMessage = history[history.length - 1].content;
    
    if (lastMessage.includes("Observation: The weather in San Francisco is 65°F and sunny.")) {
      return JSON.stringify({
        thought: "I now know the weather. I can provide the final answer.",
        finalAnswer: "The weather in San Francisco is currently 65°F and sunny."
      });
    }
    
    return JSON.stringify({
      thought: "The user is asking about the weather. I should check the current weather in San Francisco.",
      action: "get_weather",
      actionInput: { location: "San Francisco" }
    });
  }

  async run(goal) {
    console.log(`Goal: ${goal}`);
    this.memory.push({ role: "user", content: goal });

    for (let i = 0; i < 3; i++) {
      const responseText = await this.callLLM(this.memory);
      const decision = JSON.parse(responseText);

      console.log(`\n[Step ${i+1}] Thought: ${decision.thought}`);

      if (decision.finalAnswer) {
        console.log(`Final Answer: ${decision.finalAnswer}`);
        return;
      }

      if (decision.action && this.tools[decision.action]) {
        console.log(`Action: ${decision.action}(${JSON.stringify(decision.actionInput)})`);
        const observation = await this.tools[decision.action](decision.actionInput);
        console.log(`Observation: ${observation}`);
        
        this.memory.push({ role: "assistant", content: responseText });
        this.memory.push({ role: "system", content: `Observation: ${observation}` });
      }
    }
  }
}

const tools = {
  get_weather: async (args) => `The weather in ${args.location} is 65°F and sunny.`
};

const agent = new SimpleAgent("AssistantBot", tools);
agent.run("What is the weather in San Francisco?");
