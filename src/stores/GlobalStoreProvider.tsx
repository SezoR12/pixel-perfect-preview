import React from "react";
import { AuthProvider } from "./authStore";
import { NotificationProvider } from "./notificationStore";
import { DealProvider } from "./dealStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { I18nProvider } from "@/lib/i18n";

export const GlobalStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <AuthProvider>
          <NotificationProvider>
            <DealProvider>
              {children}
            </DealProvider>
          </NotificationProvider>
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
};
