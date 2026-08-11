import "server-only";

export type LegalConfig = {
  controllerName: string;
  controllerAddress: string;
  controllerCountry: string;
  minimumAge: number;
};

function configuredValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getLegalConfig(): LegalConfig {
  const controllerName = configuredValue("LEGAL_CONTROLLER_NAME");
  const controllerAddress = configuredValue("LEGAL_CONTROLLER_ADDRESS");
  const controllerCountry = configuredValue("LEGAL_CONTROLLER_COUNTRY");
  const minimumAgeRaw = configuredValue("LEGAL_MINIMUM_AGE");
  const minimumAge = minimumAgeRaw ? Number(minimumAgeRaw) : 18;

  if (process.env.VERCEL_ENV === "production") {
    const missing = [
      !controllerName && "LEGAL_CONTROLLER_NAME",
      !controllerAddress && "LEGAL_CONTROLLER_ADDRESS",
      !controllerCountry && "LEGAL_CONTROLLER_COUNTRY",
      !minimumAgeRaw && "LEGAL_MINIMUM_AGE",
    ].filter(Boolean);
    if (missing.length > 0) {
      throw new Error(`Production legal configuration is incomplete: ${missing.join(", ")}`);
    }
  }

  if (!Number.isInteger(minimumAge) || minimumAge < 13 || minimumAge > 18) {
    throw new Error("LEGAL_MINIMUM_AGE must be an integer from 13 through 18.");
  }

  return {
    controllerName: controllerName ?? "ResumeAI launch owner (local development)",
    controllerAddress: controllerAddress ?? "Not configured for local development",
    controllerCountry: controllerCountry ?? "Not configured for local development",
    minimumAge,
  };
}
