// ==================== PII & SENSITIVE DATA PROTECTION FILTER ====================
// Sanitizes text and masks credentials/PII before sending data to external AI models.

export class PiiProtectionFilter {
  private static MASK_PATTERNS = [
    { name: 'EMAIL', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[MASKED_EMAIL]' },
    { name: 'PHONE', regex: /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, replacement: '[MASKED_PHONE]' },
    { name: 'IP_ADDRESS', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replacement: '[MASKED_IP]' },
    { name: 'API_KEY', regex: /(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"]?([a-zA-Z0-9_.-]{16,})['"]?/gi, replacement: '[MASKED_CREDENTIAL]' },
    { name: 'SSN_AADAAR', regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: '[MASKED_ID]' },
  ];

  public static sanitizePrompt(input: string): { sanitizedText: string; piiMaskApplied: boolean } {
    let text = input;
    let piiMaskApplied = false;

    for (const pattern of this.MASK_PATTERNS) {
      if (pattern.regex.test(text)) {
        piiMaskApplied = true;
        text = text.replace(pattern.regex, pattern.replacement);
      }
    }

    return { sanitizedText: text, piiMaskApplied };
  }
}
