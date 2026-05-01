"use client";

import { I18nProvider } from "@/i18n/context";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { ToastProvider } from "@/components/ui/Toast";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
