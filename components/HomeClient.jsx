"use client";

import { useSearchParams } from "next/navigation";
import InvitationPage from "./InvitationPage";

export default function HomeClient() {
  const searchParams = useSearchParams();
  const guestId = searchParams.get("id");

  return <InvitationPage guestId={guestId} />;
}
