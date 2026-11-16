/**
 * HTML Utility Functions
 * Prevents XSS by escaping dynamic values before HTML interpolation.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

const HTML_ESCAPE_REGEX = /[&<>"']/g;

/**
 * Escapes a string for safe HTML interpolation.
 * Converts &, <, >, ", ' to their HTML entity equivalents.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(HTML_ESCAPE_REGEX, (ch) => HTML_ESCAPE_MAP[ch] || ch);
}
