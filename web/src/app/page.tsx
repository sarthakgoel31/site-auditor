import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { SampleReport } from "@/components/sample-report";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="grid-bg min-h-screen">
      <Hero />
      <Features />
      <SampleReport />
      <HowItWorks />
      <Footer />
    </main>
  );
}
