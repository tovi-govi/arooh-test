import AroohExperience from "@/pages/AroohExperience";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="w-full min-h-screen bg-[#060609]">
      <AroohExperience />
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
