import {
  ActionButton,
  Button,
  ProgressCircle,
  Provider,
  Text,
  Tooltip,
  TooltipTrigger,
} from "@react-spectrum/s2";
import BrightnessContrast from "@react-spectrum/s2/icons/BrightnessContrast";
import Copy from "@react-spectrum/s2/icons/Copy";
import FileText from "@react-spectrum/s2/icons/FileText";
import Share from "@react-spectrum/s2/icons/Share";
import Settings from "@react-spectrum/s2/icons/Settings";
import React, { useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Kram } from "../components/Kram.jsx";
import { Kooby } from "../components/Kooby.jsx";
import { Navigate } from "../components/Navigate.jsx";
import { Form } from "../components/inputs/Form.jsx";
import { Input } from "../components/inputs/Input.jsx";
import { TextArea } from "../components/inputs/TextArea.jsx";
import { Mermaid } from "./chat-components/Mermaid.jsx";
import { QR } from "./chat-components/QR.jsx";
import { kramNav } from "./kramNav.js";
import { useGet } from "./useGet.jsx";
import { Product } from "./chat-components/Product.jsx";
import { People } from "./chat-components/People.jsx";

export const mdjsx = {
  overrides: {
    mermaid: {
      component: Mermaid,
    },
    qr: {
      component: QR,
    },
    product: {
      component: Product,
    },
    people: {
      component: People,
    },
    navigate: {
      component: Navigate,
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

  const copyFullConversation = async () => {
    try {
      if (!socketId) {
        throw new Error("Missing socketId");
      }

      const response = await fetch(
        `/api/convo/${encodeURIComponent(socketId)}`,
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch full conversation (${response.status})`,
        );
      }
      const payload = await response.json();
      await navigator.clipboard.writeText(
        JSON.stringify(payload.conversationHistory, null, 2),
      );
    } catch (error) {
      console.error("Error copying full conversation", error);
      // Fallback to current in-memory conversation shown in the UI.
      const fallbackConversation = JSON.stringify(conversation, null, 2);
      await navigator.clipboard.writeText(fallbackConversation);
    }
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/convo/${socketId}`;
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <>
      <TooltipTrigger>
        <ActionButton
          aria-label="Copy full conversation"
          onPress={copyConversation}
          isQuiet
        >
          <Copy isQuiet />
        </ActionButton>
        <Tooltip>Copy conversation</Tooltip>
      </TooltipTrigger>

      <TooltipTrigger>
        <ActionButton
          aria-label="Copy full conversation"
          onPress={copyFullConversation}
          isQuiet
        >
          <FileText />
        </ActionButton>
        <Tooltip>Copy full conversation</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <ActionButton
          aria-label="Copy share link"
          onPress={copyShareLink}
          isQuiet
        >
          <Share />
        </ActionButton>
        <Tooltip>Copy share link</Tooltip>
      </TooltipTrigger>
      <ActionButton
        aria-label={isDarkTheme ? "Use light theme" : "Use dark theme"}
        onPress={toggleTheme}
        isQuiet
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

  const [loading, error, convoData] = useGet({
    url: convoId ? `/api/convo/${convoId}` : "",
    lazy: !convoId,
  });

  const koobyConversation = convoId
    ? convoData?.conversationHistory
    : undefined;

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

  // const kramApiRef = useRef(null);

  const onSubmit = ({ values }) => {
    const { url, context } = values;

    const qp = new URLSearchParams(window.location.search);
    if (url) qp.set("url", url);

    const newUrl = `${window.location.pathname}?${qp.toString()}`;
    window.history.replaceState(null, "", newUrl);

    setConfig({
      url,
      context: {
        info: context,
        // Dont send prompt for this type of context update
      },
    });
  };

  return (
    <Provider colorScheme={isDarkTheme ? "dark" : "light"} background="base">
      <div className="site--app">
        <Kram
          nav={kramNav}
          // hideLabels
          // apiRef={kramApiRef}
          onSelect={({ item }) => {
            // This gets triggerd any time HASH # changes
            // 1: when the user selects nav item manually
            // 2: when the AI determines it needs to change the nav
            console.log("Item selected", item);
            setConfig((prev) => ({
              ...prev,
              context: {
                info: `Currnet kram selection: ${item.label}`,
                prompt: item.instructions
                  ? item.instructions
                  : `Display information about ${item.label}`,
              },
            }));
          }}
        />
        <main className="site--app-main" style={{ marginLeft: "260px" }}>
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
            {loading && (
              <Text
                UNSAFE_style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <ProgressCircle
                  size="S"
                  aria-label="Loading conversation"
                  isIndeterminate
                />
                Loading conversation…
              </Text>
            )}
            {error && (
              <Text
                UNSAFE_style={{
                  display: "block",
                  marginBottom: 16,
                  color: "var(--spectrum-global-color-red-600)",
                }}
              >
                Could not load this conversation: {error?.message}
              </Text>
            )}
            <Kooby
              url={config.url}
              debug={debug}
              context={config.context}
              agent="Kooby"
              conversation={koobyConversation}
              socketId={convoId}
              metadata={{ kramNav }}
              // onUpdate={(update) => {
              //   if (update?.kram && "selectedNavIndex" in update.kram) {
              //     kramApiRef.current?.setSelectedNavIndex?.(
              //       update.kram.selectedNavIndex,
              //     );
              //   }
              // }}
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
