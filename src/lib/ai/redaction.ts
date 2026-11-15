/**
 * PII Redaction Module (PRD Section 11, Problem 22)
 * Strips direct patient identifiers before text leaves for an LLM provider.
 */

const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\d{10}|\d{3}[-.\s]\d{3}[-.\s]\d{4})/g;
const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/g;

/**
 * Redacts direct identifiers from narrative text.
 */
export function redactIdentifiers(
  text: string,
  patientDisplayName?: string | null
): string {
  let redacted = text.replace(EMAIL_REGEX, "[redacted-email]");
  redacted = redacted.replace(PHONE_REGEX, "[redacted-phone]");

  if (patientDisplayName && patientDisplayName.trim().length > 0) {
    const tokens = new Set<string>([
      patientDisplayName.trim(),
      ...patientDisplayName.trim().split(/\s+/),
    ]);

    // Sort tokens longest first to avoid partial replacements
    const sortedTokens = Array.from(tokens)
      .filter((t) => t.length >= 2)
      .sort((a, b) => b.length - a.length);

    for (const token of sortedTokens) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");
      redacted = redacted.replace(regex, "[patient]");
    }
  }

  return redacted;
}

/**
 * Pre-flight safety check called immediately before any outbound LLM request.
 * Throws if checkable PII (email, phone, or patient name) remains in text.
 */
export function assertNoIdentifiersLeaked(
  text: string,
  patientDisplayName?: string | null
): void {
  if (EMAIL_REGEX.test(text)) {
    throw new Error("Redaction check failed: an email pattern was detected in payload.");
  }
  if (PHONE_REGEX.test(text)) {
    throw new Error("Redaction check failed: a phone pattern was detected in payload.");
  }
  if (patientDisplayName && patientDisplayName.trim().length >= 3) {
    const lowerText = text.toLowerCase();
    const lowerName = patientDisplayName.trim().toLowerCase();
    if (lowerText.includes(lowerName)) {
      throw new Error("Redaction check failed: patient display name is still present in payload.");
    }
  }
}
