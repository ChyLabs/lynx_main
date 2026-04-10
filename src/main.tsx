import "./index.css"
import { StrictMode } from 'react'
import { routerTree } from './routes/_root';
import { createRoot } from 'react-dom/client'
import TanstackProvider from './contexts/TanstackProvider';
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createRouter({ routeTree: routerTree });

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TanstackProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </TanstackProvider>
  </StrictMode>
)
