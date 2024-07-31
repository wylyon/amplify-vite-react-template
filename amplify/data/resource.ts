import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

import { schema as generatedSqlSchema } from './schema.sql';
const sqlSchema = generatedSqlSchema.authorization(allow => allow.publicApiKey())

const schema = a.schema({
  Settings: a
    .model({
      content: a.string(),
      isDisabled: a.boolean()
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

const combinedSchema = a.combine([schema, sqlSchema]);
export type Schema = ClientSchema<typeof combinedSchema>;
export const data = defineData({
    schema: combinedSchema,
    authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  },
});