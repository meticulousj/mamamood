import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Affirmations from "./pages/Affirmations";
import Journal from "./pages/Journal";
import Meditations from "./pages/Meditations";
import Insights from "./pages/Insights";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/affirmations" component={Affirmations} />
      <Route path="/journal" component={Journal} />
      <Route path="/meditations" component={Meditations} />
      <Route path="/insights" component={Insights} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
