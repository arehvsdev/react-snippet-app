/**
 * Root Application Component
 * Hosts global UI notifications (ToastProvider) and application route definitions (AppRoutes).
 */
import AppRoutes from "./routes/AppRoutes";
import ToastProvider from "./components/common/ToastProvider";

function App() {
  return (
    // Since BrowserRouter is in main.tsx, we use a Fragment here.
    <>
      {/* ToastProvider handles all toast notifications */}
      <ToastProvider />
      {/* AppRoutes handles all the routing logic */}
      <AppRoutes />
    </>
  );
}

export default App;
