import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "./components/layout/header";
import { Footer } from "./components/layout/footer";
import Home from "@/pages/home";
import Swap from "@/pages/swap";
import Liquidity from "@/pages/liquidity";
import Pools from "@/pages/pools";
import NotFound from "@/pages/not-found";

// Floating decorative elements
function FloatingElements() {
  return (
    <>
      <div className="floating-element top-10 left-20" style={{ animationDelay: '0s' }}>
        <i className="fas fa-star star text-3xl"></i>
      </div>
      <div className="floating-element top-40 right-32" style={{ animationDelay: '1s' }}>
        <div className="w-8 h-8 bg-cyan-400 rounded-full border-2 border-black"></div>
      </div>
      <div className="floating-element bottom-32 left-16" style={{ animationDelay: '2s' }}>
        <i className="fas fa-star star text-2xl"></i>
      </div>
      <div className="floating-element top-96 left-1/2" style={{ animationDelay: '0.5s' }}>
        <div className="w-6 h-6 bg-yellow-400 transform rotate-45 border-2 border-black"></div>
      </div>
      <div className="floating-element bottom-20 right-20" style={{ animationDelay: '1.5s' }}>
        <div className="w-10 h-10 bg-pink-400 rounded-full border-3 border-black"></div>
      </div>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/swap" component={Swap} />
      <Route path="/liquidity" component={Liquidity} />
      <Route path="/pools" component={Pools} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="checkered-bg min-h-screen overflow-x-hidden">
          <div className="min-h-screen relative">
            <FloatingElements />
            <Header />
            <Router />
            <Footer />
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
