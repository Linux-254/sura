import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { TooltipProvider } from "@/components/ui/tooltip";
import BuildBrief from "@/pages/BuildBrief";
import BuildBoard from "@/pages/BuildBoard";
import AuthPage from "@/pages/AuthPage";
import { AccountPage, AdminPage, CheckoutPage, CompanyPage } from "@/pages/DashboardPages";
import Discover from "@/pages/Discover";
import Home from "@/pages/Home";
import LandingPage from "@/pages/LandingPage";
import LegalPage from "@/pages/LegalPage";
import PublicProfilePage from "@/pages/PublicProfilePage";
import CompanyDetailPage from "@/pages/CompanyDetailPage";
import { AdminEngagementPage, MembershipPage, OffersPage } from "@/pages/EngagementPages";
import AiStudioPage from "@/pages/AiStudioPage";
import AiStudioPreviewPage from "@/pages/AiStudioPreviewPage";
import { CommerceOrdersPage, ShopPage } from "@/pages/CommercePages";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CompanyCatalogPage from "@/pages/CompanyCatalogPage";
import AestheticPreferencesPage from "@/pages/AestheticPreferencesPage";
import AdminCommissionPage from "@/pages/AdminCommissionPage";
import PersonalEditStudio from "@/pages/PersonalEditStudio";
import NotFound from "@/pages/NotFound";
import SharedBuild from "@/pages/SharedBuild";
import VendorProfile from "@/pages/VendorProfile";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { InstallSuraPrompt } from "./components/InstallSuraPrompt";

function EntryRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="vb-ink grid min-h-screen place-items-center px-6 text-[#e3e3dc]">
        <div className="w-full max-w-xs text-center">
          <img src="/sura-wordmark.svg" alt="SURA" className="mx-auto h-12 w-auto" />
          <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-[#caff32]">Opening the signal</p>
          <div className="mt-6 space-y-2" aria-hidden="true"><div className="sura-shimmer h-2 w-full rounded-full" /><div className="sura-shimmer mx-auto h-2 w-4/5 rounded-full" /><div className="sura-shimmer mx-auto h-2 w-2/3 rounded-full" /></div>
          <p className="mt-4 text-sm font-semibold text-[#c5c9af]">Checking your private space…</p>
        </div>
      </main>
    );
  }

  return user ? <Home /> : <AuthPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={EntryRoute} />
      <Route path="/brief" component={BuildBrief} />
      <Route path="/discover" component={Discover} />
      <Route path="/join" component={AuthPage} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/terms" component={LegalPage} />
      <Route path="/privacy" component={LegalPage} />
      <Route path="/people/:slug"><PublicProfilePage kind="person" /></Route>
      <Route path="/studios/:slug"><PublicProfilePage kind="company" /></Route>
      <Route path="/board" component={BuildBoard} />
      <Route path="/membership" component={MembershipPage} />
      <Route path="/ai-studio-preview" component={AiStudioPreviewPage} />
      <Route path="/ai-studio" component={AiStudioPage} />
      <Route path="/edit-studio" component={PersonalEditStudio} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/shop/:id" component={ProductDetailPage} />
      <Route path="/orders" component={CommerceOrdersPage} />
      <Route path="/offers" component={OffersPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/aesthetics" component={AestheticPreferencesPage} />
      <Route path="/company" component={CompanyPage} />
      <Route path="/company/:id/catalog" component={CompanyCatalogPage} />
      <Route path="/company/:id" component={CompanyDetailPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/commissions" component={AdminCommissionPage} />
      <Route path="/admin/engagement" component={AdminEngagementPage} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
        <CookieConsentBanner />
        <InstallSuraPrompt />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
