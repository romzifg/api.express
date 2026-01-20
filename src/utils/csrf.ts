import { v4 as uuid } from "uuid";

/**
 * Generate CSRF token random
 */
export const generateCsrfToken = () => {
    return uuid();
};
