/**
 * Generate a simple unique ID using timestamp + random suffix.
 * Avoids adding a uuid dependency for a lightweight solution.
 */
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
};
