import { bridgeConfigSchema } from "./bridge-config-schema.js";
import { JSONSchema7 } from "json-schema";

export const updateBridgeRequestSchema: JSONSchema7 = {
  ...bridgeConfigSchema,
  properties: {
    ...bridgeConfigSchema.properties,
    id: {
      type: "string",
    },
  },
  required: [...(bridgeConfigSchema?.required ?? []), "id"],
};
