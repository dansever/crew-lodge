import { PageLayout } from "@/stories";
import { AppHeader } from "../_components/AppHeader";

export default function SettingsClientPage() {
  return (
    <PageLayout header={<AppHeader />}>
      <div>Settings</div>
    </PageLayout>
  );
}
