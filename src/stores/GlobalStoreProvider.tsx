import React from "react";
import { AuthProvider } from "./authStore";
import { NotificationProvider } from "./notificationStore";
import { DealProvider } from "./dealStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const GlobalStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <DealProvider>
            {children}
          </DealProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};
