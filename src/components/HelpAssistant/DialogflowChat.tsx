/**
 * -------------------------------------------------------
 * DialogflowChat.tsx
 * -------------------------------------------------------
 * Root Help Assistant integration component.
 *
 * Responsibilities:
 * 1. Load Dialogflow Messenger bootstrap script safely (once).
 * 2. Mount <df-messenger> to maintain active Dialogflow ES session.
 * 3. Route user queries via sendQueryToDialogflow.
 * 4. Act as the SINGLE authoritative listener for 'df-response-received' events.
 * 5. Deduplicate responses using lastProcessedResponseRef.
 * 6. Render native SnipForge UI (ChatLauncher + ChatWindow).
 * 7. Auth-gating: Only render for logged-in non-admin users.
 * -------------------------------------------------------
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../layouts/AuthContext";
import { ChatLauncher } from "./ChatLauncher";
import { ChatWindow } from "./ChatWindow";
import type { Message } from "./ChatMessages";
import { sendQueryToDialogflow } from "../../services/dialogflowApiService";
import "./DialogflowChat.css";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "df-messenger": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "agent-id"?: string;
          "chat-title"?: string;
          "language-code"?: string;
          intent?: string;
        },
        HTMLElement
      >;
    }
  }
}

/** URL of the official Dialogflow Messenger bootstrap script */
const DF_SCRIPT_SRC =
  "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";

/** Unique DOM ID for the injected script tag */
const DF_SCRIPT_ID = "df-messenger-script";

/**
 * Dynamically injects Dialogflow Messenger bootstrap script into <head>
 */
const loadMessengerScript = (): (() => void) => {
  if (document.getElementById(DF_SCRIPT_ID)) {
    return () => {};
  }

  const script = document.createElement("script");
  script.id = DF_SCRIPT_ID;
  script.src = DF_SCRIPT_SRC;
  script.async = true;

  const handleError = () => {
    console.warn("[HelpAssistant] Failed to load Dialogflow Messenger script.");
  };

  script.addEventListener("error", handleError);
  document.head.appendChild(script);

  return () => {
    script.removeEventListener("error", handleError);
  };
};

/**
 * Formats current time into readable string (e.g. 10:42 AM)
 */
const getFormattedTime = (): string => {
  const date = new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function DialogflowChat() {
  const { user, isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cleanupRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Response deduplication ref
  const lastProcessedResponseRef = useRef<{ text: string; timestamp: number }>({
    text: "",
    timestamp: 0,
  });

  const agentId = import.meta.env.VITE_DIALOGFLOW_AGENT_ID as string | undefined;
  const chatTitle = (import.meta.env.VITE_DIALOGFLOW_CHAT_TITLE as string) || "Help Assistant";
  const language = (import.meta.env.VITE_DIALOGFLOW_LANGUAGE as string) || "en";

  /**
   * Appends an assistant response message to React state (deduplicated).
   */
  const addBotResponse = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Deduplication check: ignore identical response if received within 1500ms
    const now = Date.now();
    if (
      lastProcessedResponseRef.current.text === trimmed &&
      now - lastProcessedResponseRef.current.timestamp < 1500
    ) {
      return;
    }

    lastProcessedResponseRef.current = { text: trimmed, timestamp: now };

    const botMsg: Message = {
      id: `bot-${now}-${Math.random().toString(36).substring(2, 7)}`,
      sender: "bot",
      text: trimmed,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsLoading(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Single, authoritative listener for Dialogflow 'df-response-received' events
   */
  useEffect(() => {
    if (!agentId) return;

    cleanupRef.current = loadMessengerScript();

    const handleDialogflowResponse = (event: any) => {
      const queryResult = event?.detail?.response?.queryResult;
      if (queryResult) {
        const responseText =
          queryResult.fulfillmentText ||
          queryResult.fulfillmentMessages?.[0]?.text?.text?.[0] ||
          queryResult.fulfillmentMessages?.find((m: any) => m.text?.text?.[0])?.text?.text?.[0];

        if (responseText) {
          addBotResponse(responseText);
        }
      }
    };

    window.addEventListener("df-response-received", handleDialogflowResponse);

    return () => {
      window.removeEventListener("df-response-received", handleDialogflowResponse);
      cleanupRef.current?.();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [agentId, addBotResponse]);

  /**
   * Routes user message directly to Dialogflow via sendQueryToDialogflow
   */
  const handleSendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: trimmed,
        timestamp: getFormattedTime(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // Dispatch query to Dialogflow transport
      sendQueryToDialogflow(trimmed);

      // Failsafe timeout (8s) if Dialogflow is unreachable
      timeoutRef.current = setTimeout(() => {
        setIsLoading((loading) => {
          if (loading) {
            addBotResponse(
              "I am connected to Dialogflow APIs. Feel free to rephrase or ask another question."
            );
          }
          return false;
        });
      }, 8000);
    },
    [addBotResponse]
  );

  // Don't render on login/register (unauthenticated) or for admin users
  if (!isAuthenticated || !agentId || user?.role === "admin") return null;

  return (
    <>
      {/* 1. Dialogflow Web Component for session & API transport */}
      <df-messenger
        agent-id={agentId}
        chat-title={chatTitle}
        language-code={language}
        intent="WELCOME"
      />

      {/* 2. Floating Action Button Launcher */}
      <ChatLauncher isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />

      {/* 3. Floating Assistant Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
      />
    </>
  );
}