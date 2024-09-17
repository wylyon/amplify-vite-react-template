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
    listTemplateByDivisionId: a.query()
    .arguments({
      divisionId: a.string().required(),
    })
    .returns(a.ref("template").array())
    .handler(a.handler.inlineSql(
      "SELECT id, division_id, title, description, pre_load_page_attributes, post_load_page_attributes, live_date, prod_date, deactive_date, notes, created, created_by FROM logistics.template WHERE division_id = :divisionId;"
    )).authorization(allow => allow.publicApiKey()),
    listUserTemplatePermissions: a.query()
    .arguments({
      templateId: a.string().required(),
      divisionId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT distinct a.id, a.first_name, a.last_name, b.id as template_user_id, b.enabled_date, b.verified_date, a.email_address FROM " +
      "logistics.user a join logistics.template t " +
      "left join logistics.template_permissions b " +
      "on t.division_id = a.division_id and t.id = b.template_id " +
      "WHERE a.division_id = :divisionId and t.id = :templateId;"
    )).authorization(allow => allow.publicApiKey()),
    listUserTemplates: a.query()
    .arguments({
      email: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT a.id, b.id as template_user_id, t.id as template_id, t.title, t.pre_load_page_attributes, t.post_load_page_attributes, b.enabled_date, b.verified_date FROM " +
      "logistics.user a join logistics.template t on t.division_id = a.division_id left join logistics.template_permissions b " +
      "on b.user_id = a.id and t.id = b.template_id WHERE " +
      "a.email_address = :email and t.prod_date <= current_date();"
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