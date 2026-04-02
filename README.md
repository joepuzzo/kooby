# Kooby

A simple Chatbot component that uses WebSockets to interact with a backend server

## Usage

```jsx
// Import the kooby component
import { Kooby } from "kooby";

const MyComponent = () => {
  return (
    <Kooby url="ws://localhost:8000">
      <Kooby.Toolbar />
      <Kooby.Conversation />
      <Kooby.ConnectionStatus />
      <Kooby.TextBox />
    </Kooby>
  );
};
```

## With metadata

```jsx
import { Kooby } from "kooby";

const MyComponent = () => {
  return (
    <Kooby
      url="ws://localhost:8000"
      metadata={{
        user: "Joe",
      }}
    >
      <Kooby.Toolbar />
      <Kooby.Conversation />
      <Kooby.ConnectionStatus />
      <Kooby.TextBox />
    </Kooby>
  );
};
```

## When not expandable

```jsx
// Import the kooby component
import { Kooby } from "kooby";

const MyComponent = () => {
  return (
    <Kooby url="ws://localhost:8000">
      <Kooby.Toolbar expandable={false} />
      <Kooby.Conversation />
      <Kooby.ConnectionStatus />
      <Kooby.TextBox />
    </Kooby>
  );
};
```

## Always Expanded

Will always take up fill width of parent container 100%

```jsx
// Import the kooby component
import { Kooby } from "kooby";

const MyComponent = () => {
  return (
    <Kooby url="ws://localhost:8000" expanded>
      <Kooby.Toolbar />
      <Kooby.Conversation />
      <Kooby.ConnectionStatus />
      <Kooby.TextBox />
    </Kooby>
  );
};
```

## When you want to hide the reset button

```jsx
// Import the kooby component
import { Kooby } from "kooby";

const MyComponent = () => {
  return (
    <Kooby url="ws://localhost:8000">
      <Kooby.Toolbar reset={false} />
      <Kooby.Conversation />
      <Kooby.ConnectionStatus />
      <Kooby.TextBox />
    </Kooby>
  );
};
```

## With History ( seeding the conversation )

```jsx
// Import the kooby component
import { Kooby } from "kooby";

const MyComponent = () => {
  return (
    <Kooby
      url="ws://localhost:8000"
      conversation={[
        {
          role: "user",
          content: "Hi, I would like to know about the barker project",
        },
      ]}
    >
      <Kooby.Toolbar />
      <Kooby.Conversation />
      <Kooby.ConnectionStatus />
      <Kooby.TextBox />
    </Kooby>
  );
};
```

## Custom Chat Components

Kooby allows you to customize what gets output by your agent. You can build custom React components that will get rendered when your agent returns specific keywords.

### Example: ( Mermaid Diagrams )

When the agent returns text like this you may want Kooby to render that as a diagram:

```
    <mermaid>
     graph TD
         A[Start] -->|Step 1| B[Process]
         B -->|Step 2| C[End]
     </mermaid>
```

In order to get its contents to render inside of your custom `Mermaid.jsx` component, you simply need to register your component like so:

```jsx
import { Kooby } from "kooby";
import { Mermaid } from "./Mermaid.jsx";
import { QR } from "./QR.jsx";

const mdjsx = {
  overrides: {
    mermaid: {
      component: Mermaid,
    },
    qr: {
      component: QR,
    },
  },
};

const MyComponent = () => {
  return (
    <Kooby url="ws://localhost:8000">
      <Kooby.Toolbar />
      <Kooby.Conversation mdjsx={mdjsx} />
      <Kooby.ConnectionStatus />
      <Kooby.TextBox />
    </Kooby>
  );
};
```

---

## Custom Toolbar

Kooby allows you to customize what gets rendered in the toolbar (at the top of the Kooby window).

```jsx
import { Kooby } from "kooby";

const CustomToolbar = ({ agent, conversation, socketId }) => {
  const copyConversation = () => {
    const conversationJson = JSON.stringify(conversation, null, 2);
    navigator.clipboard.writeText(conversationJson);
  };

  return (
    <button
      type="button"
      onClick={copyConversation}
      aria-label="Copy conversation"
    >
      Copy
    </button>
  );
};

const MyComponent = () => {
  return (
    <Kooby url="ws://localhost:8000">
      <Kooby.Toolbar>
        {({ conversation }) => <CustomToolbar conversation={conversation} />}
      </Kooby.Toolbar>
      <Kooby.Conversation />
      <Kooby.ConnectionStatus />
      <Kooby.TextBox />
    </Kooby>
  );
};
```

---

## Kooby Api

You can get access to the internal kooby api via a ref

```jsx
// Import useRef
import React, { useRef } from "react";

// Import the kooby component
import { Kooby } from "kooby";

const MyComponent = () => {
  const koobyApiRef = useRef();

  return (
    <>
      <Button
        onClick={() => {
          koobyApiRef.current?.resetConversation();
        }}
        variant="secondary"
      >
        Reset
      </Button>
      <Kooby url="ws://localhost:8000" apiRef={koobyApiRef}>
        <Kooby.Toolbar />
        <Kooby.Conversation />
        <Kooby.ConnectionStatus />
        <Kooby.TextBox />
      </Kooby>
    </>
  );
};
```

---

## Sending Feedback

```jsx
// Import the kooby component
import { Kooby } from "kooby";

const MyComponent = () => {
  return (
    <Kooby url="ws://localhost:8000">
      <Kooby.Toolbar />
      <Kooby.Conversation
        negative={{
          onSubmit: (feedback) => {
            console.log(JSON.stringify(feedback, null, 2));
          },
        }}
        positive={{
          onSubmit: (feedback) => {
            console.log(JSON.stringify(feedback, null, 2));
          },
        }}
      />
      <Kooby.ConnectionStatus />
      <Kooby.TextBox />
    </Kooby>
  );
};
```

Example Output from negative feedback log

```json
{
  "feedback": "Wish it just told me what was new!",
  "message": "Are you asking about new models, features, or updates? Could you please specify?",
  "conversation": [
    {
      "role": "system",
      "content": "Hello, I'm Test! I'm here to help you with any questions you may have."
    },
    {
      "role": "user",
      "content": "Hi!"
    },
    {
      "role": "assistant",
      "content": "Hello! How can I assist you today?"
    },
    {
      "role": "user",
      "content": "What new ? "
    },
    {
      "role": "assistant",
      "content": "Are you asking about new models, features, or updates? Could you please specify?"
    }
  ]
}
```

## Showing feedback on all messages

By default feedback will only be shown on the most recent message. By passing `showFeedbackOnAllMessages` you can change that behavior.

```jsx
// Import the kooby component
import { Kooby } from "kooby";

const MyComponent = () => {
  return (
    <Kooby url="ws://localhost:8000">
      <Kooby.Toolbar />
      <Kooby.Conversation
        showFeedbackOnAllMessages
        negative={{
          onSubmit: (feedback) => {
            console.log(JSON.stringify(feedback, null, 2));
          },
        }}
        positive={{
          onSubmit: (feedback) => {
            console.log(JSON.stringify(feedback, null, 2));
          },
        }}
      />
      <Kooby.ConnectionStatus />
      <Kooby.TextBox />
    </Kooby>
  );
};
```

---

## Project Layout

client - a simple react app with a chat window ( using the exported Kooby react component )
server - a simple js express server that serves up the chatbot and connects to the chat api

## Getting It Running

#### Step1: First you need to make sure you have node installed on your computer

Visit this site [HERE](https://nodejs.org/en/download)

### Step2: you need to install the dependencies

```bash
npm i
```

This will install all the dependencies

### Step3: Add required secrets

Get chat token and put it in the following file in the root of this project ( used grok in example )

```bash
touch token_grok.txt
```

### Step4: Run it!

```bash
npm run start:dev
```

This will start a express web server with basic chatbot and also a sample front end react app that connects to the servers endpoint

Go [here](http://localhost:3000/) to view the frontend example

```
http://localhost:3000/
```

### WebSocket URL (example app)

```
ws://localhost:3000/kooby
```
