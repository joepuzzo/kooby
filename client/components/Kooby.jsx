import React, { useState, useEffect, useRef } from "react";
import { ChatManager } from "./ChatManager";
import {
  ActionButton,
  DialogTrigger,
  Heading,
  InlineAlert,
  Popover,
  ProgressCircle,
  Text,
  TextArea,
  Tooltip,
  TooltipTrigger,
} from "@react-spectrum/s2";
import Copy from "@react-spectrum/s2/icons/Copy";
import OpenIn from "@react-spectrum/s2/icons/OpenIn";
import Refresh from "@react-spectrum/s2/icons/Refresh";
import ThumbDown from "@react-spectrum/s2/icons/ThumbDown";
import ThumbUp from "@react-spectrum/s2/icons/ThumbUp";
import Markdown from "markdown-to-jsx";
import "./Kooby.css";

const format = (value) => {
  if (value) {
    return value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } else {
    return "Kooby";
  }
};

/* Helper: interactive feedback popover (replaces non-interactive tooltip + form) */

const FeedbackField = ({
  icon: Icon,
  title,
  value,
  onValueChange,
  onCommit,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <TooltipTrigger>
        <ActionButton isQuiet aria-label={title}>
          <Icon />
        </ActionButton>
        <Tooltip>{title}</Tooltip>
      </TooltipTrigger>
      <Popover size="S">
        <div style={{ padding: 12 }}>
          <Heading>{title}</Heading>
          <TextArea
            value={value}
            onChange={onValueChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onCommit();
                setOpen(false);
              }
            }}
          />
        </div>
      </Popover>
    </DialogTrigger>
  );
};

/* -------------------- Kooby Context -------------------- */

const KoobyContext = React.createContext();

export const useKooby = () => {
  const context = React.useContext(KoobyContext);
  if (!context) {
    throw new Error("useKooby must be used within a KoobyProvider");
  }
  return context;
};

/* -------------------- Kooby Components -------------------- */

const Feedback = ({
  responding,
  message,
  index,
  conversation,
  negative,
  positive,
  showFeedbackOnAllMessages,
  loading,
}) => {
  const currentMessage = index === conversation.length - 1;

  let show = false;
  if (currentMessage && !responding && message.role === "assistant") {
    show = true;
  }
  if (
    !currentMessage &&
    showFeedbackOnAllMessages &&
    message.role === "assistant"
  ) {
    show = true;
  }

  const copyMessage = () => {
    const messageJson = JSON.stringify(message.content, null, 2);
    navigator.clipboard.writeText(messageJson);
  };

  const [positiveFeedback, setPositiveFeedback] = useState("");
  const [negativeFeedback, setNegativeFeedback] = useState("");

  if (loading && currentMessage) {
    return (
      <div
        className="kooby-feedback"
        style={{ marginTop: "-35px", marginLeft: "-40px" }}
      >
        <ProgressCircle
          size="M"
          isIndeterminate
          aria-label="Loading"
          staticColor="white"
        />
      </div>
    );
  }

  if (show) {
    return (
      <div className="kooby-feedback">
        <TooltipTrigger>
          <ActionButton isQuiet aria-label="Copy message" onPress={copyMessage}>
            <Copy />
          </ActionButton>
          <Tooltip>Copy message</Tooltip>
        </TooltipTrigger>
        {positive && (
          <FeedbackField
            icon={ThumbUp}
            title={positive.label || "Positive Feedback"}
            value={positiveFeedback}
            onValueChange={setPositiveFeedback}
            onCommit={() =>
              positive.onSubmit({
                feedback: positiveFeedback,
                conversation,
                message: message.content,
              })
            }
          />
        )}
        {negative && (
          <FeedbackField
            icon={ThumbDown}
            title={negative.label || "Negative Feedback"}
            value={negativeFeedback}
            onValueChange={setNegativeFeedback}
            onCommit={() =>
              negative.onSubmit({
                feedback: negativeFeedback,
                conversation,
              })
            }
          />
        )}
      </div>
    );
  }
};

const Content = ({
  mdjsx,
  feedback,
  responding,
  loading,
  index,
  message,
  conversation,
  positive,
  negative,
  showFeedbackOnAllMessages,
}) => {
  return (
    <div style={{ width: "100%" }}>
      <div className="kooby-content">
        <Markdown options={mdjsx}>{message.content}</Markdown>
      </div>
      {feedback && (
        <Feedback
          responding={responding}
          loading={loading}
          index={index}
          message={message}
          conversation={conversation}
          positive={positive}
          negative={negative}
          showFeedbackOnAllMessages={showFeedbackOnAllMessages}
        />
      )}
    </div>
  );
};

const Conversation = ({
  mdjsx,
  feedback = true,
  positive,
  negative,
  showFeedbackOnAllMessages,
}) => {
  const { conversation, responding, loading } = useKooby();
  const conversationEndRef = useRef(null);

  useEffect(() => {
    if (
      conversation.length > 0 &&
      conversation[conversation.length - 1].role != "system"
    ) {
      conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const filteredConvo = conversation.filter(
    (message) =>
      message.role !== "system" &&
      message.role !== "tool" &&
      !message.tool_calls,
  );

  return (
    <div className="kooby-conversation">
      {filteredConvo.map((message, index) => (
        <div key={index} className="kooby-message">
          <div className={`kooby-message-role kooby-${message.role}`}>
            <strong>
              {message.role === "assistant" || message.role === "system"
                ? "Kooby"
                : message.role.charAt(0).toUpperCase() + message.role.slice(1)}
            </strong>
          </div>
          <Content
            mdjsx={mdjsx}
            feedback={feedback}
            responding={responding}
            loading={loading}
            index={index}
            message={message}
            conversation={filteredConvo}
            positive={positive}
            negative={negative}
            showFeedbackOnAllMessages={showFeedbackOnAllMessages}
          />
        </div>
      ))}
      <div ref={conversationEndRef} />
    </div>
  );
};

const TextBox = () => {
  const {
    isConnected,
    socketManagerRef,
    setConversation,
    context,
    setLoading,
  } = useKooby();
  const [input, setInput] = useState("");

  const handleSend = React.useCallback(() => {
    if (input.trim()) {
      if (!isConnected && !socketManagerRef.current) {
        console.error("WebSocket is not connected");
        return;
      }

      const send = () => {
        setConversation((prev) => [
          ...prev,
          {
            role: "user",
            content: input,
          },
        ]);

        try {
          socketManagerRef.current.sendMessage({ input });
          socketManagerRef.current.sendMessage({ complete: true });
          setLoading(true);
        } catch (error) {
          console.error("Error sending message:", error);
        }

        setInput("");
      };

      if (!isConnected) {
        socketManagerRef.current.connect(() => {
          send();
        });
        return;
      }

      send();
    }
  }, [input, isConnected, socketManagerRef, setConversation, context]);

  return (
    <div className="kooby-text-box">
      <TextArea
        id="prompt"
        placeholder="Ask Me Anything!"
        aria-label="Prompt"
        value={input}
        onChange={setInput}
        width="100%"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
    </div>
  );
};

const Toolbar = ({ children, expandable = true, reset = true }) => {
  const { agent, conversation, toggleFocus, resetConversation, socketId } =
    useKooby();

  return (
    <div className="kooby-toolbar">
      {children ? children({ agent, conversation, socketId }) : null}
      {reset && (
        <TooltipTrigger>
          <ActionButton aria-label="Reset" onPress={resetConversation} isQuiet>
            <Refresh />
          </ActionButton>
          <Tooltip>Reset</Tooltip>
        </TooltipTrigger>
      )}
      {expandable && (
        <TooltipTrigger>
          <ActionButton aria-label="Expand" onPress={toggleFocus} isQuiet>
            <OpenIn />
          </ActionButton>
          <Tooltip>Expand</Tooltip>
        </TooltipTrigger>
      )}
    </div>
  );
};

const ConnectionStatus = () => {
  const { isConnected } = useKooby();

  if (!isConnected) {
    return (
      // <div >
      <InlineAlert variant="notice" UNSAFE_style={{ marginBottom: "10px" }}>
        <Heading>Disconnected</Heading>
        <Text>Please continue talking to reconnect.</Text>
      </InlineAlert>
      // </div>
    );
  }
};

/* -------------------- Kooby Component -------------------- */

const defaultGreetingMessage = (agent) => ({
  role: "assistant",
  content: `Hello, I'm ${format(
    agent,
  )}! I'm here to help you with any questions you may have.`,
});

const initializeConversation = ({ agent, initialConversation }) => {
  if (initialConversation && initialConversation.length > 0) {
    return initialConversation.filter(
      (message) => message.role !== "tool" && !message.tool_calls,
    );
  }
  return [defaultGreetingMessage(agent)];
};

const createSocketId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `kooby-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const Kooby = ({
  debug,
  url,
  agent,
  token,
  children,
  metadata = {},
  context,
  readOnly = false,
  sendHistory = false,
  apiRef,
  expanded,
  onUpdate,
  ...rest
}) => {
  const [focus, setFocus] = useState(false);
  const toggleFocus = () => setFocus((prev) => !prev);

  const initialConversation = rest.conversation;

  const [conversation, setConversation] = useState(() => {
    return initializeConversation({ agent, initialConversation });
  });

  const conversationRef = useRef();
  conversationRef.current = conversation;

  useEffect(() => {
    setConversation(initializeConversation({ agent, initialConversation }));
  }, [agent, initialConversation]);

  const [isConnected, setIsConnected] = useState(false);
  const [socketId] = useState(() => rest.socketId ?? createSocketId());
  const [responding, setResponding] = useState(false);
  const [loading, setLoading] = useState(false);
  const socketManagerRef = useRef(null);

  const metadataRef = useRef();
  metadataRef.current = metadata;

  useEffect(() => {
    if (url && !readOnly) {
      socketManagerRef.current = ChatManager.create({
        url: url,
        authToken: token,
        agent: agent,
        onMessage: (data) => {
          // Example SSE message
          // {"output":" I","trace_id":"94008937-f598-4be3-8714-5c6a4b4c9a32","span_id":"07b85d19-fb89-4a57-9566-6a9d9fdb0dc7"}
          // {"type":"complete","trace_id":"94008937-f598-4be3-8714-5c6a4b4c9a32","span_id":"07b85d19-fb89-4a57-9566-6a9d9fdb0dc7"}

          // Check if the incoming data contains an 'output' property
          if (data.output) {
            // We are starting to respond
            setResponding(true);
            // We are done loading the response
            setLoading(false);
            // Update the conversation state using the setConversation function
            setConversation((prev) => {
              // Get the last message in the current conversation
              const lastMessage = prev[prev.length - 1];

              // Clean the output by removing any prefix like "user_id-<number>: "
              const cleanOutput = data.output.replace(/^user_id-\d+:\s*/, "");

              // Check if the last message in the conversation is from the assistant
              if (lastMessage.role === "assistant") {
                // If the last message is from the assistant, update its content
                // by appending the cleaned output and replace the last message
                return [
                  ...prev.slice(0, -1), // Keep all messages except the last one
                  {
                    ...lastMessage, // Copy the last message
                    content: lastMessage.content + cleanOutput, // Append the new content
                  },
                ];
              } else {
                // If the last message is not from the assistant, add a new message
                // from the assistant with the cleaned output
                return [...prev, { role: "assistant", content: cleanOutput }];
              }
            });
          }
          if (data.complete) {
            console.log("complete");
            setResponding(false);
            setIsConnected(true);
          }
          if (data.update && onUpdate) {
            onUpdate(data.update);
          }
        },
        onOpen: () => {
          console.log("Chat Manager Connected", metadataRef.current);
          setIsConnected(true);

          // Take the current conversation and format it for the chat manager history
          const history = initialConversation;

          socketManagerRef.current.sendMessage({
            handshake: true,
            socketId,
            history,
            metadata: {
              user_agent: navigator.userAgent,
              ...metadataRef.current,
            },
          });
        },
        onClose: () => {
          console.log("Chat Manager Disconnecting");
          setIsConnected(false);
        },
        onError: () => {
          setIsConnected(false);
        },
      });

      socketManagerRef.current.connect();
    }

    return () => {
      if (url) {
        console.log("Cleaing up Socket");
        socketManagerRef.current.disconnect();
        setIsConnected(false);
      }
    };
  }, [url, agent, token, socketId]);

  useEffect(() => {
    if (socketManagerRef.current && context) {
      console.log("Setting context", context);
      setConversation((prev) => [
        ...prev,
        {
          role: "system",
          content: context,
        },
      ]);

      socketManagerRef.current.sendMessage({
        context,
      });
    }
  }, [context]);

  const resetConversation = () => {
    if (url && !readOnly && socketManagerRef.current) {
      socketManagerRef.current.sendMessage({ reset: true });
    }
    setConversation([defaultGreetingMessage(agent)]);
  };

  const contextValue = React.useMemo(
    () => ({
      conversation,
      setConversation,
      resetConversation,
      isConnected,
      socketId,
      setIsConnected,
      socketManagerRef: socketManagerRef,
      agent,
      toggleFocus,
      responding,
      context,
      setLoading,
      loading,
    }),
    [conversation, isConnected, socketId, agent, responding, context],
  );

  if (apiRef) {
    apiRef.current = {
      resetConversation,
    };
  }

  return (
    <KoobyContext.Provider value={contextValue}>
      <div className={`kooby ${focus || expanded ? "kooby-focus" : ""}`}>
        {children}
      </div>
      {debug && (
        <code className="kooby-debug">
          <pre>{JSON.stringify(conversation, null, 2)}</pre>
        </code>
      )}
    </KoobyContext.Provider>
  );
};

Kooby.Content = Content;
Kooby.Conversation = Conversation;
Kooby.TextBox = TextBox;
Kooby.Toolbar = Toolbar;
Kooby.ConnectionStatus = ConnectionStatus;
