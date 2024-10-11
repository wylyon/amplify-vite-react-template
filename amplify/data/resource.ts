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
      "SELECT id, division_id, title, description, pre_load_page_attributes, post_load_page_attributes, live_date, prod_date, deactive_date, notes, created, created_by, use_pagination, auto_space, box_controls " +
      " FROM logistics.template WHERE division_id = :divisionId;"
    )).authorization(allow => allow.publicApiKey()),
    listUserTemplatePermissions: a.query()
    .arguments({
      templateId: a.string().required(),
      divisionId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT distinct a.id, a.first_name, a.last_name, b.id as template_user_id, b.enabled_date, b.verified_date, a.email_address FROM " +
        "logistics.user a join logistics.template_permissions b on b.user_id = a.id " +
        "join logistics.template t on t.id = b.template_id " +
        "WHERE a.division_id = :divisionId and t.id = :templateId union all " +
      "SELECT distinct a.id, a.first_name, a.last_name, b.id as template_user_id, b.enabled_date, b.verified_date, a.email_address FROM " + 
	      "logistics.user a join logistics.division d on d.id = a.division_id join logistics.template t on t.division_id = d.id " +
        "left join logistics.template_permissions b on b.user_id = a.id and b.template_id = t.id " +
	      "WHERE a.division_id = :divisionId and t.id = :templateId and b.id is null;"
    )).authorization(allow => allow.publicApiKey()),
    listUserTemplates: a.query()
    .arguments({
      email: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT a.id, b.id as template_user_id, t.id as template_id, t.title, t.pre_load_page_attributes, t.post_load_page_attributes, b.enabled_date, " +
      "t.use_pagination, t.auto_space, t.box_controls, b.verified_date FROM " +
      "logistics.user a join logistics.template t on t.division_id = a.division_id left join logistics.template_permissions b " +
      "on b.user_id = a.id and t.id = b.template_id WHERE " +
      "a.email_address = :email and t.prod_date <= current_date();"
    )).authorization(allow => allow.publicApiKey()),
    listDivisionByCompanyId: a.query()
    .arguments({
      companyId: a.string().required(),
    })
    .returns(a.ref("division").array())
    .handler(a.handler.inlineSql(
      "SELECT id, company_id, name, email, address1, address2, city, state, zipcode, ref_department, notes, deactive_date, created, created_by FROM logistics.division WHERE company_id = :companyId;"
    )).authorization(allow => allow.publicApiKey()),
    listUserByDivisionId: a.query()
    .arguments({
      divisionId: a.string().required(),
    })
    .returns(a.ref("user").array())
    .handler(a.handler.inlineSql(
      "SELECT id, division_id, email_address, first_name, last_name, middle_name, active_date, deactive_date, notes, created, created_by FROM logistics.user WHERE division_id = :divisionId;"
    )).authorization(allow => allow.publicApiKey()),
    listQuestionsByTemplateId: a.query()
    .arguments({
      templateId: a.string().required(),
    })
    .returns(a.ref("template_question").array())
    .handler(a.handler.inlineSql(
      "SELECT id, template_id, question_order, pre_load_attributes, title, description, question_type, question_values, post_load_attributes, optional_flag, actions_flag, notes, created, created_by FROM " +
      "logistics.template_question WHERE template_id = :templateId and deactive_date is null order by question_order;"
    )).authorization(allow => allow.publicApiKey()),
  }).addToSchema({
    deleteQuestionById: a.mutation().arguments({
      questionId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.template_question WHERE id = :questionId;"))
    .authorization(allow => allow.publicApiKey())
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