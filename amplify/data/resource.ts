import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Settings DB table for global app settings.
=========================================================================*/
import { schema as generatedSqlSchema } from './schema.sql';
const sqlSchema = generatedSqlSchema.authorization(allow => allow.guest())

const schema = a.schema({
  Settings: a
    .model({
      content: a.string(),
      isDisabled: a.boolean()
    })
    .authorization((allow) => [allow.owner()]),
});

const combinedSchema = a.combine([schema, sqlSchema]);

export type Schema = ClientSchema<typeof combinedSchema>;

export const data = defineData({
    schema: combinedSchema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});