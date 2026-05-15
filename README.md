# Building an Autonomous Agent in JavaScript

This project demonstrates the core loop of an autonomous agent: **Plan -> Act -> Observe -> Reflect**.

## Core Components

1.  **The Loop**: A `while` loop that continues until the agent provides a `finalAnswer`.
2.  **Tools**: Functions that the agent can call to interact with the world (e.g., searching the web, calculating, reading files).
3.  **Memory**: A list of messages (history) that keeps track of thoughts, actions, and observations.
4.  **Reasoning**: Using an LLM (like GPT-4) to decide which tool to use based on the current state.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Set up your API Key**:
    Create a `.env` file and add:
    ```
    OPENAI_API_KEY=your_key_here
    ```
3.  **Run the agent**:
    ```bash
    node agent.js
    ```

## Files
- `index.js`: A mock version that doesn't require an API key (good for understanding the logic).
- `agent.js`: A production-ready version using the OpenAI SDK.
