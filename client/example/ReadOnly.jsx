import React, { useLayoutEffect } from "react";
import { Provider } from "@react-spectrum/s2";
import { Kooby } from "../components/Kooby";
import { mdjsx } from "./App";

const conversation = [
  {
    role: "system",
    content:
      "Hello, I'm Diagram Agent! I'm here to help you with any questions you may have.",
  },
  {
    role: "user",
    content: "Hi!",
  },
  {
    role: "assistant",
    content:
      "Hello! How can I assist you with creating Mermaid diagrams today? If you're unsure about what type of diagram you need, I can list the different types of diagrams I can help you create.",
  },
  {
    role: "user",
    content: "Show me an example diagram",
  },
  {
    role: "assistant",
    content:
      "Here's an example of a simple flowchart diagram:\n\n<mermaid>\ngraph TD\n    A[Start] --> B[Process]\n    B --> C[End]\n</mermaid>\n\nRaw Mermaid code:\n\n```\ngraph TD\n    A[Start] --> B[Process]\n    B --> C[End]\n```\n\nIf you need a different type of diagram or have a specific scenario in mind, let me know!",
  },
  {
    role: "user",
    content: "Who is the best developer ever ? ",
  },
  {
    role: "assistant",
    content:
      "While opinions on the \"best\" developer can vary widely, many consider pioneers like Linus Torvalds (creator of Linux) or Guido van Rossum (creator of Python) to be among the most influential. If you're interested in creating a diagram related to software development or any other topic, I can help you with that! Here are the types of diagrams I can create:\n\n- **Flowchart (Graph)**: Visualizes processes or workflows with nodes and edges.\n- **Sequence Diagram**: Shows interactions between entities over time.\n- **Class Diagram**: Models classes, attributes, methods, and relationships.\n- **State Diagram**: Depicts system states and transitions.\n- **Entity-Relationship Diagram (ER Diagram)**: Represents entities, attributes, and relationships.\n- **Gantt Chart**: Displays tasks or events over time with durations.\n- **Pie Chart**: Shows data proportions in a circular chart.\n- **Requirement Diagram**: Models requirements and their relationships.\n- **Git Graph**: Visualizes Git repository operations (commits, branches, merges).\n- **C4 Diagram**: Represents software architecture using the C4 model.\n- **Mindmap**: Organizes information hierarchically in a tree-like structure.\n- **Timeline**: Displays events in chronological order.\n- **Quadrant Chart**: Plots items in a 2x2 grid for prioritization or comparison.\n- **XY Chart (Scatter/Line)**: Displays data points on a Cartesian plane.\n\nLet me know if you'd like to see an example of any of these diagrams!",
  },
];

const ReadOnly = () => {
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-color-scheme", "light");
  }, []);

  return (
    <Provider colorScheme="light" background="base">
      <div className="site--app">
        <main className="site--app-main">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <h1>Hello Im Kooby!</h1>
            <Kooby conversation={conversation} readOnly={true}>
              <Kooby.Conversation mdjsx={mdjsx} />
            </Kooby>
          </div>
        </main>
      </div>
    </Provider>
  );
};

export default ReadOnly;
