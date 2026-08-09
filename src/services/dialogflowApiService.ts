/**
 * -------------------------------------------------------
 * dialogflowApiService.ts
 * -------------------------------------------------------
 * Service for communicating directly with Dialogflow APIs.
 * Dispatches text queries through REST API or <df-messenger> transport.
 * -------------------------------------------------------
 */

export interface DialogflowQueryResult {
  fulfillmentText: string;
  intentName?: string;
  confidence?: number;
  parameters?: Record<string, any>;
}

const AGENT_ID = import.meta.env.VITE_DIALOGFLOW_AGENT_ID || "9854126f-4b7b-4bcc-bbde-50058390c6d0";
const API_KEY = import.meta.env.VITE_DIALOGFLOW_API_KEY || "";
const LANGUAGE_CODE = import.meta.env.VITE_DIALOGFLOW_LANGUAGE || "en";

// Unique session ID for the current browser session
let currentSessionId = "";
const getSessionId = (): string => {
  if (!currentSessionId) {
    currentSessionId = "snipforge-session-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  }
  return currentSessionId;
};

/**
 * Sends a query text directly to the Dialogflow API or <df-messenger> element.
 * Does NOT register competing event listeners on window.
 */
export const sendQueryToDialogflow = async (queryText: string): Promise<boolean> => {
  const session = getSessionId();

  // 1. Try Direct Google Dialogflow REST API if API Key is configured
  if (API_KEY) {
    try {
      const url = `https://dialogflow.googleapis.com/v2/projects/${AGENT_ID}/agent/sessions/${session}:detectIntent?key=${API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryInput: {
            text: {
              text: queryText,
              languageCode: LANGUAGE_CODE,
            },
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const fulfillmentText = data.queryResult?.fulfillmentText;
        if (fulfillmentText) {
          // Dispatch synthetic event so single window listener catches it
          const customEvent = new CustomEvent("df-response-received", {
            detail: { response: { queryResult: data.queryResult } },
          });
          window.dispatchEvent(customEvent);
          return true;
        }
      }
    } catch (err) {
      console.warn("[dialogflowApiService] REST API error:", err);
    }
  }

  // 2. Transport via <df-messenger> Custom Element
  const dfMessengerEl = document.querySelector("df-messenger") as any;
  if (!dfMessengerEl) return false;

  try {
    if (typeof dfMessengerEl.sendQuery === "function") {
      dfMessengerEl.sendQuery(queryText);
      return true;
    }

    // Shadow DOM input event dispatch fallback
    const shadow1 = dfMessengerEl.shadowRoot;
    const chat = shadow1?.querySelector("df-messenger-chat") || shadow1?.querySelector("df-messenger-chat-window");
    const shadow2 = chat?.shadowRoot;
    const userInput = shadow2?.querySelector("df-messenger-user-input");
    const shadow3 = userInput?.shadowRoot;
    const inputEl = shadow3?.querySelector("input") || shadow3?.querySelector("textarea") || shadow3?.querySelector("#textInput");
    const sendBtn = shadow3?.querySelector("button") || shadow3?.querySelector("#sendIcon") || shadow3?.querySelector(".send-icon");

    if (inputEl) {
      (inputEl as any).value = queryText;
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      inputEl.dispatchEvent(new Event("change", { bubbles: true }));
      if (sendBtn) {
        (sendBtn as HTMLElement).click();
        return true;
      }
    }
  } catch (e) {
    console.warn("[dialogflowApiService] Custom element trigger error:", e);
  }

  return false;
};
