const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function isHexColor(value?: string | null): value is string {
  return typeof value === "string" && HEX_COLOR_REGEX.test(value.trim());
}

export function normalizeHexColor(value: string | null | undefined, fallback: string): string {
  if (isHexColor(value)) return value;
  return fallback;
}
