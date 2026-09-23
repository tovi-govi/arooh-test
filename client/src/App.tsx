import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AroohExperience from "@/pages/AroohExperience";
import About from "@/pages/About";
import Events from "@/pages/Events";
import Schedule from "@/pages/Schedule";
import Sponsors from "@/pages/Sponsors";
import Contact from "@/pages/Contact";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import { DemoOne } from "@/components/ui/demo";

function App() {
  const [location] = useLocation();
  const isExperience = location === "/" || location === "";

  if (isExperience) {
    return (
      <div className="w-full min-h-screen bg-[#060609]">
        <AroohExperience />
        <Toaster position="bottom-right" theme="dark" />
      </div>
    );
  }

  if (location === "/horizon") {
    return (
      <div className="w-full min-h-screen bg-black">
        <DemoOne />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        <Switch>
          <Route path="/about" component={About} />
          <Route path="/events" component={Events} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/sponsors" component={Sponsors} />
          <Route path="/contact" component={Contact} />
          <Route path="/register" component={Register} />
          <Route path="/horizon" component={DemoOne} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <SiteFooter />
      <Toaster />
    </div>
  );
}

export default App;
