import { z } from "zod";

export const PASSWORD_RULES = [
  { label: "At least 6 characters", test: (v: string) => v.length >= 6 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export const passwordSchema = z
  .string()
  .max(128)
  .refine((v) => PASSWORD_RULES.every((r) => r.test(v)), {
    message:
      "Password needs 6+ characters with an uppercase, lowercase, number and special character",
  });

export function passwordScore(value: string) {
  return PASSWORD_RULES.filter((r) => r.test(value)).length;
}
