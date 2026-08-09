/**
 * Root Application Component
 * Hosts global UI notifications (ToastProvider), application route definitions (AppRoutes),
 * and the Dialogflow Help Assistant chatbot (DialogflowChat).
 */
import { lazy, Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import ToastProvider from "./components/common/ToastProvider";

/** Lazy-load the Dialogflow chatbot to avoid blocking the initial render */
const DialogflowChat = lazy(() => import("./components/HelpAssistant/DialogflowChat"));

function App() {
  return (
    // Since BrowserRouter is in main.tsx, we use a Fragment here.
    <>
      {/* ToastProvider handles all toast notifications */}
      <ToastProvider />
      {/* AppRoutes handles all the routing logic */}
      <AppRoutes />
      {/* Dialogflow Help Assistant — rendered once at root, available on all pages */}
      <Suspense fallback={null}>
        <DialogflowChat />
      </Suspense>
    </>
  );
}

export default App;
