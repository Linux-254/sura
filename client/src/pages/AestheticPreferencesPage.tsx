import DashboardLayout from "@/components/DashboardLayout";
import { AestheticCuration } from "@/components/AestheticCuration";

export default function AestheticPreferencesPage() {
  return <DashboardLayout showAestheticOnboarding={false} eyebrow="SURA / EXPRESSION BOARD" title="More than one direction can be yours." description="Keep up to five core aesthetics close. Your primary direction sets the active palette; the full mix keeps your personal prompts richer and more recognisable.">
    <AestheticCuration alwaysVisible />
  </DashboardLayout>;
}
