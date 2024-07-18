import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Settings DB table for global app settings.
=========================================================================*/
const schema = a.schema({
  Settings: a
    .model({
      content: a.string(),
      isDisabled: a.boolean()
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});