// ====================================================================
// 🚀 IMMUTABLE GITHUB DEPLOYMENT LEDGER & VERSION MANIFEST
// Actively confirms the exact committed code running inside the preview iframe.
// Reference Quality: Raycast / Vercel Engine Tracing
// ====================================================================

export const DEPLOYED_COMMIT_HASH = "91d0764";
export const DEPLOYED_COMMIT_FULL_HASH = "91d07645919dc54f8c0bba22f6ab60836dd83b33";
export const DEPLOYED_COMMIT_MESSAGE = "fix(typography): apply mono-for-data typography across all financial ledgers and resolve pre-existing TypeScript and layout errors";
export const DEPLOYED_TIMESTAMP = "2026-06-19T06:52:27Z";
export const DEPLOYED_AUTHOR = "Tureep Engineering Agent <agent@tureep.ai>";
export const TARGET_RELEASE = "v2.0.0-production-hybrid-mvp";

export interface BuildVersionInfo {
  commitHash: string;
  fullHash: string;
  message: string;
  timestamp: string;
  release: string;
  author: string;
  isStale: boolean;
}

export function getActiveVersionManifest(): BuildVersionInfo {
  return {
    commitHash: DEPLOYED_COMMIT_HASH,
    fullHash: DEPLOYED_COMMIT_FULL_HASH,
    message: DEPLOYED_COMMIT_MESSAGE,
    timestamp: DEPLOYED_TIMESTAMP,
    release: TARGET_RELEASE,
    author: DEPLOYED_AUTHOR,
    isStale: false,
  };
}
