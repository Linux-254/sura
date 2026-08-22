import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import BuildBrief from "@/pages/BuildBrief";
import BuildBoard from "@/pages/BuildBoard";
import Discover from "@/pages/Discover";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import SharedBuild from "@/pages/SharedBuild";
import VendorProfile from "@/pages/VendorProfile";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/brief" component={BuildBrief} />
      <Route path="/discover" component={Discover} />
      <Route path="/board" component={BuildBoard} />
      <Route path="/share/:token" component={SharedBuild} />
      <Route path="/vendors/:slug" component={VendorProfile} />
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
