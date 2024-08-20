import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

import { schema as generatedSqlSchema } from './schema.sql';
const sqlSchema = generatedSqlSchema.authorization(allow => allow.publicApiKey())
  .addQueries({
    listUserByEmail: a.query()
    .arguments({
      email: a.string().required(),
    })
    .returns(a.ref("user").array())
    .handler(a.handler.inlineSql(
      "SELECT id, division_id, email_address, first_name, last_name, middle_name, active_date, deactive_date, notes, created, created_by FROM logistics.user WHERE email_address = :email;"
    )).authorization(allow => allow.publicApiKey()),
    listAdminByEmail: a.query()
    .arguments({
      email: a.string().required(),
    })
    .returns(a.ref("admin").array())
    .handler(a.handler.inlineSql(
      "SELECT id, username, email_address, company_id, company_name, first_name, last_name, middle_name, active_date, deactive_date, created, created_by FROM logistics.admin WHERE email_address = :email;"
    )).authorization(allow => allow.publicApiKey()),
  })

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