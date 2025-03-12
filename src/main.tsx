import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./style.css";
import App from "./App.tsx";

// Créer une instance de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuration par défaut pour les requêtes
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      // Configuration par défaut pour les mutations
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
