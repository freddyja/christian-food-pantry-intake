export const EMERGENCY_REASON_MIN = 3;

export function emergencyReasonError(reason: string): string | null {
  if (reason.trim().length < EMERGENCY_REASON_MIN) {
    return "Please enter a short reason (at least 3 characters).";
  }
  return null;
}

const SHAME_LANGUAGE = /\b(denied|blocked|ineligible)\b/i;

export function copyIsDignified(text: string): boolean {
  return !SHAME_LANGUAGE.test(text);
}
