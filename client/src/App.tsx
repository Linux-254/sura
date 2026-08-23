import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import BuildBrief from "@/pages/BuildBrief";
import BuildBoard from "@/pages/BuildBoard";
import AuthPage from "@/pages/AuthPage";
import { AccountPage, AdminPage, CompanyPage } from "@/pages/DashboardPages";
import CheckoutPage from "@/pages/CheckoutPage";
import Discover from "@/pages/Discover";
import Home from "@/pages/Home";
import LegalPage from "@/pages/LegalPage";
import PublicProfilePage from "@/pages/PublicProfilePage";
import CompanyDetailPage from "@/pages/CompanyDetailPage";
import { AdminEngagementPage, MembershipPage, OffersPage } from "@/pages/EngagementPages";
import AiStudioPage from "@/pages/AiStudioPage";
import AiStudioPreview from "@/pages/AiStudioPreview";
import { CommerceOrdersPage, ShopPage } from "@/pages/CommercePages";
import CompanyCatalogPage from "@/pages/CompanyCatalogPage";
import AestheticPreferencesPage from "@/pages/AestheticPreferencesPage";
import AdminCommissionPage from "@/pages/AdminCommissionPage";
import AdminDashboardPreview from "@/pages/AdminDashboardPreview";
import PersonalEditStudio from "@/pages/PersonalEditStudio";
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
      <Route path="/join" component={AuthPage} />
      <Route path="/terms" component={LegalPage} />
      <Route path="/privacy" component={LegalPage} />
      <Route path="/people/:slug"><PublicProfilePage kind="person" /></Route>
      <Route path="/studios/:slug"><PublicProfilePage kind="company" /></Route>
      <Route path="/board" component={BuildBoard} />
      <Route path="/membership" component={MembershipPage} />
      <Route path="/ai-studio" component={AiStudioPage} />
      <Route path="/ai-studio-preview" component={AiStudioPreview} />
      <Route path="/edit-studio" component={PersonalEditStudio} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/orders" component={CommerceOrdersPage} />
      <Route path="/offers" component={OffersPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/aesthetics" component={AestheticPreferencesPage} />
      <Route path="/company" component={CompanyPage} />
      <Route path="/company/:id/catalog" component={CompanyCatalogPage} />
      <Route path="/company/:id" component={CompanyDetailPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin-preview" component={AdminDashboardPreview} />
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
