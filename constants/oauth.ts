import * as WebBrowser from "expo-web-browser";
import * as ReactNative from "react-native";

// Extract scheme from bundle ID (last segment timestamp, prefixed with "manus")
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
const bundleId = "space.manus.chefmii.t20260312121113";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  portal: process.env.EXPO_PUBLIC_OAUTH_PORTAL_URL ?? "",
  server: process.env.EXPO_PUBLIC_OAUTH_SERVER_URL ?? "",
  appId: process.env.EXPO_PUBLIC_APP_ID ?? "",
  ownerId: process.env.EXPO_PUBLIC_OWNER_OPEN_ID ?? "",
  ownerName: process.env.EXPO_PUBLIC_OWNER_NAME ?? "",
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  deepLinkScheme: schemeFromBundleId,
};

export const OAUTH_PORTAL_URL = env.portal;
export const OAUTH_SERVER_URL = env.server;
export const APP_ID = env.appId;
export const OWNER_OPEN_ID = env.ownerId;
export const OWNER_NAME = env.ownerName;
export const API_BASE_URL = env.apiBaseUrl;

/**
 * Get the API base URL, deriving from current hostname if not set.
 * Metro runs on 8081, API server runs on 3000.
 * URL pattern: https://PORT-sandboxid.region.domain
 */
export function getApiBaseUrl(): string {
  // If API_BASE_URL is set, use it
  if (API_BASE_URL) {
    return API_BASE_URL.replace(/\/$/, "");
  }

  // On web, derive from current hostname by replacing port 8081 with 3000
  if (ReactNative.Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { protocol, hostname } = window.location;
    // Pattern: 8081-sandboxid.region.domain -> 3000-sandboxid.region.domain
    const apiHostname = hostname.replace(/^8081-/, "3000-");
    if (apiHostname !== hostname) {
      return `${protocol}//${apiHostname}`;
    }
  }

  // Fallback to empty (will use relative URL)
  return "";
}

export const SESSION_TOKEN_KEY = "app_session_token";
export const USER_INFO_KEY = "manus-runtime-user-info";

const encodeState = (value: string) => {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(value);
  }
  const BufferImpl = (globalThis as Record<string, any>).Buffer;
  if (BufferImpl) {
    return BufferImpl.from(value, "utf-8").toString("base64");
  }
  return value;
};

/**
 * Get the redirect URI for OAuth callback.
 *
 * IMPORTANT: On native platforms running in Expo Go, Linking.createURL() always
 * returns the exp:// scheme regardless of the custom scheme — which the Manus
 * OAuth portal rejects. To fix this, we always use the HTTPS API server callback
 * URL on native. The server's /api/oauth/callback endpoint handles the code
 * exchange and redirects back to the app's frontend URL.
 *
 * - Web: uses API server callback endpoint (same origin)
 * - Native: uses HTTPS API server callback endpoint (avoids exp:// scheme)
 */
export const getRedirectUri = (): string => {
  const apiBase = getApiBaseUrl();
  // Always use the HTTPS server callback — works on both web and native,
  // and avoids the exp:// scheme that Manus OAuth rejects.
  return `${apiBase}/api/oauth/callback`;
};

export const getLoginUrl = () => {
  const redirectUri = getRedirectUri();
  const state = encodeState(redirectUri);

  const url = new URL(`${OAUTH_PORTAL_URL}/app-auth`);
  url.searchParams.set("appId", APP_ID);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

/**
 * Start OAuth login flow.
 *
 * On native platforms (iOS/Android), use WebBrowser.openAuthSessionAsync() which
 * opens an in-app browser (SFSafariViewController / Chrome Custom Tab). This
 * avoids the exp:// scheme issue in Expo Go. The browser will follow the redirect
 * from the server back to the app's frontend URL, and the result URL will contain
 * the session token set via cookie.
 *
 * On web, this simply redirects to the login URL.
 *
 * @returns Always null — the callback is handled by the server redirect to the
 *          frontend URL, which triggers a page reload with the session cookie set.
 */
export async function startOAuthLogin(): Promise<string | null> {
  const loginUrl = getLoginUrl();

  if (ReactNative.Platform.OS === "web") {
    // On web, just redirect
    if (typeof window !== "undefined") {
      window.location.href = loginUrl;
    }
    return null;
  }

  // On native: use in-app browser. The server /api/oauth/callback will exchange
  // the code, set a cookie, and redirect to the frontend URL (EXPO_PACKAGER_PROXY_URL,
  // which is the 8081 Metro URL) with sessionToken and user as query params.
  //
  // We pass the Metro frontend URL as the redirectUrl so openAuthSessionAsync knows
  // when to close the browser (when the URL starts with the frontend origin).
  const apiBase = getApiBaseUrl();
  // Derive the Metro (8081) URL from the API (3000) URL
  const metroBase = apiBase.replace(/^(https?:\/\/)3000-/, "$18081-");
  // Use the Metro URL as the redirect prefix — this is where the server redirects after auth
  const redirectPrefix = metroBase || apiBase;
  try {
    const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectPrefix);
    console.log("[OAuth] WebBrowser result type:", result.type);

    if (result.type === "success" && result.url) {
      console.log("[OAuth] WebBrowser redirect URL received:", result.url.substring(0, 100));
      // The server redirected to the frontend URL after setting the session cookie.
      // Extract sessionToken from URL if present (server passes it as a query param).
      try {
        const url = new URL(result.url);
        const sessionToken = url.searchParams.get("sessionToken");
        if (sessionToken) {
          console.log("[OAuth] Session token extracted from redirect URL");
          return sessionToken;
        }
      } catch (parseError) {
        console.error("[OAuth] Failed to parse redirect URL:", parseError);
      }
    } else if (result.type === "cancel" || result.type === "dismiss") {
      console.log("[OAuth] User cancelled or dismissed the browser");
    }
  } catch (error) {
    console.error("[OAuth] WebBrowser.openAuthSessionAsync failed:", error);
    throw error;
  }

  return null;
}
