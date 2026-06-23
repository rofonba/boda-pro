"use client";

import GuestProvider from "./GuestProvider";
import InvitationPage from "./InvitationPage";

export default function HomeClient() {
  return (
    <GuestProvider>
      <InvitationPage />
    </GuestProvider>
  );
}
