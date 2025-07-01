// Client-safe configuration
export const config = {
  isDevelopment:
    typeof window !== "undefined"
      ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      : false,

  // Add other client-safe config here
  maxRetries: 3,
  retryDelay: 1000,

  // Feature flags
  features: {
    showErrorDetails:
      typeof window !== "undefined"
        ? window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        : false,
  },
}
