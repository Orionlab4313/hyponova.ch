"use client";

import { I18nProvider } from "@/i18n/context";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { ToastProvider } from "@/components/ui/Toast";
import { AdsProvider } from "@/components/ads/AdsProvider";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AdsProvider>
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
        </ToastProvider>
      </AdsProvider>
    </I18nProvider>
  );
}
