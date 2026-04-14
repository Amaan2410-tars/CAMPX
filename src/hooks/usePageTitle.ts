import { useEffect } from "react";

/**
 * Sets the document title for the current page.
 * Automatically prefixes with "CampX — " for consistent branding.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `CampX — ${title}` : "CampX";
    return () => {
      document.title = "CampX";
    };
  }, [title]);
}
