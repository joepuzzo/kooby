import { ActionButton, Button, Provider, Text } from "@react-spectrum/s2";
import BrightnessContrast from "@react-spectrum/s2/icons/BrightnessContrast";
import Copy from "@react-spectrum/s2/icons/Copy";
import FileText from "@react-spectrum/s2/icons/FileText";
import Settings from "@react-spectrum/s2/icons/Settings";
import React, { useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Kooby } from "../components/Kooby.jsx";
import { Form } from "../components/inputs/Form.jsx";
import { Input } from "../components/inputs/Input.jsx";
import { TextArea } from "../components/inputs/TextArea.jsx";
import { Mermaid } from "./chat-components/Mermaid.jsx";
import { QR } from "./chat-components/QR.jsx";

export const mdjsx = {
  overrides: {
    mermaid: {
      component: Mermaid,
    },
    qr: {
      component: QR,
    },
  },
};

const CustomToolbar = ({
  conversation,
  toggleTheme,
  isDarkTheme,
  socketId,
}) => {
  const [useSuccessIcon, setUseSuccessIcon] = useState(false);

  const copyConversation = () => {
    const conversationJson = JSON.stringify(conversation, null, 2);
    navigator.clipboard.writeText(conversationJson);
  };

  const copySocketId = () => {
    navigator.clipboard.writeText(socketId);
  };

  return (
    <>
      <ActionButton aria-label="Copy conversation" onPress={copyConversation}>
        <Copy />
      </ActionButton>
      <ActionButton aria-label="Copy test" onPress={copySocketId}>
        <FileText />
      </ActionButton>
      <ActionButton
        aria-label={isDarkTheme ? "Use light theme" : "Use dark theme"}
        onPress={toggleTheme}
      >
        <BrightnessContrast />
      </ActionButton>
    </>
  );
};

const App = () => {
  const { id: convoId } = useParams();
  const params = new URLSearchParams(window.location.search);
  const themeQueryParam = params.get("theme");
  const initialTheme =
    themeQueryParam === "dark"
      ? true
      : themeQueryParam === "light"
        ? false
        : false;

  const [isDarkTheme, setIsDarkTheme] = useState(initialTheme);

  const formApiRef = useRef();

  console.log("convoId", convoId);

  // Spectrum Provider themes via CSS classes, not data-color-scheme. We mirror the
  // scheme on <html> so global CSS (e.g. Kooby.css) and DevTools match the toggle.
  useLayoutEffect(() => {
    document.documentElement.setAttribute(
      "data-color-scheme",
      isDarkTheme ? "dark" : "light",
    );
  }, [isDarkTheme]);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("theme", newTheme ? "dark" : "light");
    const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  const [debug, setDebug] = useState(false);

  const toggleDebug = () => {
    setDebug(!debug);
  };

  const queryParams = new URLSearchParams(window.location.search);
  const urlQueryParam = queryParams.get("url") || "ws://localhost:3000/kooby";

  const [config, setConfig] = useState({
    url: urlQueryParam,
  });

  const onSubmit = ({ values }) => {
    const { url, context } = values;

    const qp = new URLSearchParams(window.location.search);
    if (url) qp.set("url", url);

    const newUrl = `${window.location.pathname}?${qp.toString()}`;
    window.history.replaceState(null, "", newUrl);

    setConfig({
      url,
      context,
    });
  };

  return (
    <Provider colorScheme={isDarkTheme ? "dark" : "light"} background="base">
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text>The Example Chat Bot</Text>
              <ActionButton aria-label="Toggle debug" onPress={toggleDebug}>
                <Settings />
              </ActionButton>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Form
                onSubmit={onSubmit}
                UNSAFE_style={{ width: "100%", maxWidth: 500 }}
                formApiRef={formApiRef}
              >
                <div
                  style={{
                    padding: "10px",
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "10px",
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      flex: "2 1 280px",
                      minWidth: 200,
                      maxWidth: "100%",
                    }}
                  >
                    <Input
                      name="url"
                      label="URL"
                      placeholder="Enter URL"
                      defaultValue={urlQueryParam}
                      width="100%"
                    />
                  </div>

                  <Button type="submit">Update</Button>
                </div>
                <div style={{ padding: "10px", width: "100%" }}>
                  <TextArea
                    name="context"
                    label="Context"
                    placeholder="Enter context"
                  />
                </div>
              </Form>
            </div>
            <Kooby
              url={config.url}
              debug={debug}
              context={config.context}
              agent="Kooby"
              // conversation={[
              //   {
              //     role: "user",
              //     content: "Hi, I would like to know about the barker project",
              //   },
              // ]}
            >
              <Kooby.Toolbar>
                {({ conversation, socketId }) => {
                  return (
                    <CustomToolbar
                      conversation={conversation}
                      toggleTheme={toggleTheme}
                      isDarkTheme={isDarkTheme}
                      socketId={socketId}
                    />
                  );
                }}
              </Kooby.Toolbar>
              <Kooby.Conversation
                mdjsx={mdjsx}
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
          </div>
        </main>
      </div>
    </Provider>
  );
};

export default App;
