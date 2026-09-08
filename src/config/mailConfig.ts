/**
 * Configuration module for email destinations & Feature Flags.
 * 
 * Control how emails are routed:
 * - NEXT_PUBLIC_USE_TEST_EMAIL="true"  -> Sends to lx.garduno@gmail.com
 * - NEXT_PUBLIC_USE_TEST_EMAIL="false" -> Sends to contacto@defpotecmx.com
 * - NEXT_PUBLIC_CONTACT_EMAIL="xyz@..." -> Custom recipient override
 */

export const DEFAULT_PRODUCTION_EMAIL = "contacto@defpotecmx.com";
export const DEFAULT_TEST_EMAIL = "lx.garduno@gmail.com";

/**
 * Returns the destination email address based on active Feature Flag.
 * Default in environment is set to test mode (lx.garduno@gmail.com) for testing.
 */
export function getContactTargetEmail(): string {
  if (process.env.NEXT_PUBLIC_CONTACT_EMAIL && process.env.NEXT_PUBLIC_CONTACT_EMAIL.trim() !== "") {
    return process.env.NEXT_PUBLIC_CONTACT_EMAIL.trim();
  }

  const useTestFlag = process.env.NEXT_PUBLIC_USE_TEST_EMAIL;
  
  // If explicitly set to "false", use production email
  if (useTestFlag === "false") {
    return DEFAULT_PRODUCTION_EMAIL;
  }
  
  // Default to test email (lx.garduno@gmail.com) while in testing mode
  return DEFAULT_TEST_EMAIL;
}
