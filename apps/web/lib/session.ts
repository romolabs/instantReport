export const SESSION_COOKIE_NAME = "instantreport_session";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export function shouldUseSecureCookies() {
  const explicitValue = process.env.INSTANTREPORT_SECURE_COOKIES?.trim().toLowerCase();

  if (explicitValue) {
    return TRUE_VALUES.has(explicitValue);
  }

  return process.env.NODE_ENV === "production";
}
