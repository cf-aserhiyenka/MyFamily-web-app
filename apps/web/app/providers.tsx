"use client";

import { SessionProvider } from "next-auth/react";

// next-auth's useSession() hook (used on the homepage to know if someone
// is logged in) only works inside this provider. layout.tsx is a server
// component and can't use "use client" itself, so the provider lives here
// in its own small client component and wraps {children} in layout.tsx.
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
