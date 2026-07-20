import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";

const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const MovingToSweden = lazy(() => import("./pages/MovingToSweden"));
const NewInSweden = lazy(() => import("./pages/NewInSweden"));
const JobsForEnglishSpeakers = lazy(() => import("./pages/guides/JobsForEnglishSpeakers"));
const SwedishRentalMarket = lazy(() => import("./pages/guides/SwedishRentalMarket"));
const Personnummer = lazy(() => import("./pages/guides/Personnummer"));
const LearningSwedishSFI = lazy(() => import("./pages/guides/LearningSwedishSFI"));
const AftonbladetVsExpressen = lazy(() => import("./pages/guides/AftonbladetVsExpressen"));
const EssentialSwedishVocabulary = lazy(() => import("./pages/guides/EssentialSwedishVocabulary"));
const ImmigrationPolicyUpdates = lazy(() => import("./pages/guides/ImmigrationPolicyUpdates"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/article/:sourceUrl" element={<ArticleDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/guides/moving-to-sweden" element={<MovingToSweden />} />
                <Route path="/guides/new-in-sweden" element={<NewInSweden />} />
                <Route path="/guides/new-in-sweden/jobs-for-english-speakers" element={<JobsForEnglishSpeakers />} />
                <Route path="/guides/new-in-sweden/swedish-rental-market" element={<SwedishRentalMarket />} />
                <Route path="/guides/new-in-sweden/personnummer" element={<Personnummer />} />
                <Route path="/guides/new-in-sweden/learning-swedish-sfi" element={<LearningSwedishSFI />} />
                <Route path="/guides/aftonbladet-vs-expressen" element={<AftonbladetVsExpressen />} />
                <Route path="/guides/new-in-sweden/essential-swedish-vocabulary" element={<EssentialSwedishVocabulary />} />
                <Route path="/guides/immigration-policy-updates" element={<ImmigrationPolicyUpdates />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
