import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import AdminPanel from "./app/admin/AdminPanel.tsx";
import FinancePanel from "./app/finance/FinancePanel.tsx";
import BookingPage from "./app/BookingPage.tsx";
import "./styles/index.css";

function Router() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (hash.startsWith("#/admin") || window.location.pathname.endsWith("/admin")) {
    return <AdminPanel />;
  }
  if (hash.startsWith("#/financeiro") || window.location.pathname.endsWith("/financeiro")) {
    return <FinancePanel />;
  }
  if (hash.startsWith("#/agendar") || window.location.pathname.endsWith("/agendar")) {
    return <BookingPage />;
  }
  return <App />;
}

createRoot(document.getElementById("root")!).render(<Router />);
