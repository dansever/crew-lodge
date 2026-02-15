import { currentUser } from "@clerk/nextjs/server";
import LandingPageClient from "./ClientPage";

export default async function LandingPage() {
  const user = await currentUser();

  return <LandingPageClient />;
}
