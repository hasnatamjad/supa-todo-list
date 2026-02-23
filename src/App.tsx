import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import Auth from "./pages/Auth";
import TaskRegistry from "./pages/TaskRegistry";
import TaskList from "./pages/TaskList";
import Members from "./pages/Members";
import Inbox from "./pages/Inbox";
import FinishedTasks from "./pages/FinishedTasks";
import ExpenseTracker from "./pages/ExpenseTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<DashboardLayout><TaskRegistry /></DashboardLayout>} />
            <Route path="/task-list" element={<DashboardLayout><TaskList /></DashboardLayout>} />
            <Route path="/finished" element={<DashboardLayout><FinishedTasks /></DashboardLayout>} />
            <Route path="/expenses" element={<DashboardLayout><ExpenseTracker /></DashboardLayout>} />
      <Route path="members" element={<Members />} />
      <Route path="inbox" element={<Inbox />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
