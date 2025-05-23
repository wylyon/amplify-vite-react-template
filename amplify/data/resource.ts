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
      "SELECT distinct u.id, u.division_id, u.email_address, u.first_name, u.last_name, u.middle_name, u.active_date, u.deactive_date, u.notes, u.created, u.created_by " +
      "FROM logistics.user u JOIN logistics.template_permissions p on p.user_id = u.id WHERE email_address = :email;"
    )).authorization(allow => allow.publicApiKey()),
    listAllAdmin: a.query()
    .arguments({})
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT a.id, c.name as company, a.company_id, a.email_address, a.first_name, a.last_name, a.middle_name, a.active_date, a.deactive_date, a.created, a.created_by " +
      "FROM logistics.admin a left join logistics.company c on c.id = a.company_id;"
    )).authorization(allow => allow.publicApiKey()),
    listAllUsers: a.query()
    .arguments({})
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT a.id, a.division_id, d.name as division, c.name as company, a.email_address, a.first_name, a.last_name, a.middle_name, a.active_date, a.deactive_date, a.notes, a.created, a.created_by " +
      "FROM logistics.user a join logistics.division d on d.id = a.division_id join logistics.company c on c.id = d.company_id;"
    )).authorization(allow => allow.publicApiKey()),
    listAllAdminByCompanyId: a.query()
    .arguments({
      companyId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT a.id, c.name as company, a.company_id, a.email_address, a.first_name, a.last_name, a.middle_name, a.active_date, a.deactive_date, a.created, a.created_by " +
      "FROM logistics.admin a left join logistics.company c on c.id = a.company_id WHERE c.id = :companyId;"
    )).authorization(allow => allow.publicApiKey()),
    listAllUsersByCompanyId: a.query()
    .arguments({
      companyId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT a.id, a.division_id, d.name as division, c.name as company, a.email_address, a.first_name, a.last_name, a.middle_name, a.active_date, a.deactive_date, a.notes, a.created, a.created_by " +
      "FROM logistics.user a join logistics.division d on d.id = a.division_id join logistics.company c on c.id = d.company_id WHERE c.id = :companyId;"
    )).authorization(allow => allow.publicApiKey()),
    listAdminByEmail: a.query()
    .arguments({
      email: a.string().required(),
    })
    .returns(a.ref("admin").array())
    .handler(a.handler.inlineSql(
      "SELECT id, username, email_address, company_id, first_name, last_name, middle_name, active_date, deactive_date, created, created_by FROM logistics.admin WHERE email_address = :email;"
    )).authorization(allow => allow.publicApiKey()),
    listPhotoResultsByTemplate: a.query()
    .arguments({
      templateId: a.string().required(),
    })
    .returns(a.ref("question_result").array())
    .handler(a.handler.inlineSql(
      "SELECT qr.* from logistics.question_result qr join logistics.transactions t on t.id = qr.transaction_id " +
      "WHERE t.template_id = :templateId and not result_photo_value is null;"
    )).authorization(allow => allow.publicApiKey()),
    listAllTemplates: a.query()
    .arguments({})
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT t.id, t.division_id, d.name as division, c.name as company, t.title, t.description, t.pre_load_page_attributes, t.post_load_page_attributes, t.live_date, t.prod_date, t.deactive_date, t.notes, t.created, t.created_by, " +
      "t.use_pagination, t.auto_space, t.box_controls " +
      " FROM logistics.template t JOIN logistics.division d on d.id = t.division_id JOIN logistics.company c on c.id = d.company_id;"
    )).authorization(allow => allow.publicApiKey()),
    listAllTemplatesByCompanyId: a.query()
    .arguments({
      companyId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT t.id, t.division_id, d.name as division, c.name as company, t.title, t.description, t.pre_load_page_attributes, t.post_load_page_attributes, t.live_date, t.prod_date, t.deactive_date, t.notes, t.created, t.created_by, " +
      "t.use_pagination, t.auto_space, t.box_controls " +
      " FROM logistics.template t JOIN logistics.division d on d.id = t.division_id JOIN logistics.company c on c.id = d.company_id and c.id = :companyId;"
    )).authorization(allow => allow.publicApiKey()),
    listAllTemplatesByDivisionId: a.query()
    .arguments({
      divisionId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT t.id, t.division_id, d.name as division, c.name as company, t.title, t.description, t.pre_load_page_attributes, t.post_load_page_attributes, t.live_date, t.prod_date, t.deactive_date, t.notes, t.created, t.created_by, " +
      "t.use_pagination, t.auto_space, t.box_controls " +
      " FROM logistics.template t JOIN logistics.division d on d.id = t.division_id JOIN logistics.company c on c.id = d.company_id WHERE d.id = :divisionId;"
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
    listTemplatePermissionsByUser: a.query()
    .arguments({
      userId: a.string().required(),
    })
    .returns(a.ref("template_permissions").array())
    .handler(a.handler.inlineSql(
      "SELECT id, template_id, user_id, enabled_date, verified_date, created, created_by FROM logistics.template_permissions WHERE user_id = :userId;"
    )).authorization(allow => allow.publicApiKey()),
    listTemplatePermissionsByTemplate: a.query()
    .arguments({
      templateId: a.string().required(),
    })
    .returns(a.ref("template_permissions").array())
    .handler(a.handler.inlineSql(
      "SELECT id, template_id, user_id, enabled_date, verified_date, created, created_by FROM logistics.template_permissions WHERE template_id = :templateId;"
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
      "a.email_address = :email and t.prod_date <= current_date() and b.id is not null;"
    )).authorization(allow => allow.publicApiKey()),
    listUserTemplatesByTemplateId: a.query()
    .arguments({
      email: a.string().required(),
      templateId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT a.id, b.id as template_user_id, t.id as template_id, t.title, t.pre_load_page_attributes, t.post_load_page_attributes, b.enabled_date, " +
      "t.use_pagination, t.auto_space, t.box_controls, b.verified_date FROM " +
      "logistics.user a join logistics.template t on t.division_id = a.division_id left join logistics.template_permissions b " +
      "on b.user_id = a.id and t.id = b.template_id WHERE " +
      "a.email_address = :email and t.id = :templateId and t.prod_date <= current_date() and b.id is not null;"
    )).authorization(allow => allow.publicApiKey()),
    listAllDivisions: a.query()
    .arguments({})
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT d.id, d.company_id, c.name as company, d.name, d.email, d.address1, d.address2, d.city, d.state, d.zipcode, d.ref_department, d.notes, d.deactive_date, d.created, d.created_by " +
      "FROM logistics.division d join logistics.company c on c.id = d.company_id;"
    )).authorization(allow => allow.publicApiKey()),
    listAllDivisionsByCompanyId: a.query()
    .arguments({
      companyId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT d.id, d.company_id, c.name as company, d.name, d.email, d.address1, d.address2, d.city, d.state, d.zipcode, d.ref_department, d.notes, d.deactive_date, d.created, d.created_by " +
      "FROM logistics.division d join logistics.company c on c.id = d.company_id WHERE c.id = :companyId;"
    )).authorization(allow => allow.publicApiKey()),
    listResultsByTemplateId: a.query()
    .arguments({
      templateId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT c.name as company, c.id as company_id, d.id as division_id, d.name as division, t.title as template, t.id as template_id, r.transaction_id, q.title as question, " +
      "q.question_order, q.question_type, case when q.question_type = 'photo' then r.result_photo_value when q.question_type = 'datepicker' then r.result_date_value else r.result_option_value end as result, " +
      "r.gps_lat as lat, r.gps_long as lng, r.what3words, r.created, r.created_by, tt.status, tt.reason, tt.last_update FROM logistics.question_result r join logistics.template_question q on q.id = r.template_question_id " +
      "join logistics.transactions tt on tt.id = r.transaction_id join logistics.template t on t.id = q.template_id join logistics.division d on d.id = t.division_id join logistics.company c on c.id = d.company_id " +
      "WHERE q.question_type != 'dialog_input' and q.template_id = :templateId and q.deactive_date is null order by r.transaction_id, r.created;"
    )).authorization(allow => allow.publicApiKey()),
    listResultsByTransactionId: a.query()
    .arguments({
      transactionId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT c.name as company, c.id as company_id, d.id as division_id, d.name as division, t.title as template, t.id as template_id, r.transaction_id, q.title as question, " +
      "q.question_order, q.question_type, case when q.question_type = 'photo' then r.result_photo_value when q.question_type = 'datepicker' then r.result_date_value else r.result_option_value end as result, " +
      "r.gps_lat as lat, r.gps_long as lng, r.what3words, r.created, r.created_by, tt.status, tt.reason, tt.last_update FROM logistics.question_result r join logistics.template_question q on q.id = r.template_question_id " +
      "join logistics.transactions tt on tt.id = r.transaction_id join logistics.template t on t.id = q.template_id join logistics.division d on d.id = t.division_id join logistics.company c on c.id = d.company_id " +
      "WHERE q.question_type != 'dialog_input' and r.transaction_id = :transactionId and q.deactive_date is null order by r.transaction_id, r.created;"
    )).authorization(allow => allow.publicApiKey()),
    summaryResultsByTemplateId: a.query()
    .arguments({
      templateId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT c.name as company, c.id as company_id,  t.title, t.id as template_id, r.transaction_id, count(r.transaction_id) as num_questions, max(r.created) as created, max(what3words) as what3words, " +
      "max(gps_lat) as lattitude, max(gps_long) as longitude, max(r.created_by) as created_by FROM logistics.question_result r " +
      "join logistics.template_question q on q.id = r.template_question_id join logistics.template t on t.id = q.template_id join logistics.division d on d.id = t.division_id join logistics.company c on c.id = d.company_id where template_id = :templateId " +
      "and q.question_type != 'dialog_input' and q.deactive_date is null group by c.name, c.id, t.title, t.id, r.transaction_id order by c.name, c.id, t.title, t.id, r.created;"
    )).authorization(allow => allow.publicApiKey()),
    resultsTotals: a.query()
    .arguments({})
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT company, company_id, title, template_id, count(transaction_id) as num_transactions, max(created) as latest_posting, min(created) as earliest_posting FROM " + 
      "(SELECT c.name as company, c.id as company_id, t.title, t.id as template_id, r.transaction_id, r.created FROM " +
      "logistics.question_result r join logistics.transactions tt on tt.id = r.transaction_id join logistics.template t on t.id = tt.template_id " +
      "join logistics.division d on d.id = t.division_id join logistics.company c on c.id = d.company_id group by c.name, t.title, r.transaction_id) a " +
      "group by company, company_id, title, template_id;"
    )).authorization(allow => allow.publicApiKey()),
    resultsTotalsByCompanyId: a.query()
    .arguments({
      companyId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT company, company_id, title, template_id, count(transaction_id) as num_transactions, max(created) as latest_posting, min(created) as earliest_posting FROM " + 
      "(SELECT c.name as company, c.id as company_id, t.title, t.id as template_id, r.transaction_id, r.created FROM " +
      "logistics.question_result r join logistics.transactions tt on tt.id = r.transaction_id join logistics.template t on t.id = tt.template_id " +
      "join logistics.division d on d.id = t.division_id join logistics.company c on c.id = d.company_id WHERE c.id = :companyId group by c.name, t.title, r.transaction_id) a " +
      "group by company, company_id, title, template_id;"
    )).authorization(allow => allow.publicApiKey()),
    resultsTotalsByTemplateId: a.query()
    .arguments({
      templateId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT company, company_id, title, template_id, count(transaction_id) as num_transactions, max(created) as latest_posting, min(created) as earliest_posting FROM " + 
      "(SELECT c.name as company, c.id as company_id, t.title, t.id as template_id, r.transaction_id, r.created FROM " +
      "logistics.question_result r join logistics.template_question q on q.id = r.template_question_id join logistics.template t on t.id = q.template_id " +
      "join logistics.division d on d.id = t.division_id join logistics.company c on c.id = d.company_id WHERE t.id = :templateId group by c.name, t.title, r.transaction_id) a " +
      "group by company, company_id, title, template_id;"
    )).authorization(allow => allow.publicApiKey()),
    transactionsByCompanyId: a.query()
    .arguments({
      companyId: a.string().required(),
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT c.name as company, c.id as company_id, t.title, tt.template_id, tt.id, tt.gps_lat, tt.gps_long, tt.what3words, tt.created, tt.created_by FROM " +
      "logistics.transactions tt join logistics.template t on t.id = tt.template_id join logistics.division d on d.id = t.division_id " +
      "join logistics.company c on c.id = d.company_id WHERE c.id = :companyId ORDER by tt.created asc;"
    )).authorization(allow => allow.publicApiKey()),
    transactionsAllCompanies: a.query()
    .arguments({})
    .returns(a.json().array())
    .handler(a.handler.inlineSql(
      "SELECT c.name as company, c.id as company_id, t.title, tt.template_id, tt.id, tt.gps_lat, tt.gps_long, tt.what3words, tt.created, tt.created_by FROM " +
      "logistics.transactions tt join logistics.template t on t.id = tt.template_id join logistics.division d on d.id = t.division_id " +
      "join logistics.company c on c.id = d.company_id order by tt.created asc;"
    )).authorization(allow => allow.publicApiKey()),
    transactionsByTemplateId: a.query()
    .arguments({
      templateId: a.string().required(),
    })
    .returns(a.ref("transactions").array())
    .handler(a.handler.inlineSql(
      "SELECT id, template_id, gps_lat, gps_long, what3words, created, created_by FROM logistics.transactions WHERE template_id = :templateId;"
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
      "SELECT id, template_id, question_order, pre_load_attributes, title, description, question_type, question_values, post_load_attributes, optional_flag, " +
      "actions_flag, notes, created, created_by, trigger_value FROM " +
      "logistics.template_question WHERE template_id = :templateId and deactive_date is null order by question_order;"
    )).authorization(allow => allow.publicApiKey()),
    listQuestionsWithResultsByTemplateId: a.query()
    .arguments({
      templateId: a.string().required(),
    })
    .returns(a.ref("template_question").array())
    .handler(a.handler.inlineSql(
      "SELECT id, template_id, question_order, pre_load_attributes, title, description, question_type, question_values, post_load_attributes, optional_flag, " +
      "actions_flag, notes, created, created_by, trigger_value FROM logistics.template_question t " +
      "WHERE template_id = :templateId and deactive_date is null and t.id in (select template_question_id from logistics.question_result where template_question_id = t.id) " +
      "order by question_order;"
    )).authorization(allow => allow.publicApiKey()),
  }).addToSchema({
    deleteQuestionById: a.mutation().arguments({
      questionId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.template_question WHERE id = :questionId;"))
    .authorization(allow => allow.publicApiKey()),
    deletePermissionsByTemplateId: a.mutation().arguments({
      templateId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.template_permissions WHERE template_id = :templateId;"))
    .authorization(allow => allow.publicApiKey()),
    deleteQuestionByTemplateId: a.mutation().arguments({
      templateId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.template_question WHERE template_id = :templateId;"))
    .authorization(allow => allow.publicApiKey()),
    deleteActiveQuestionByTemplateId: a.mutation().arguments({
      templateId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.template_question WHERE template_id = :templateId and deactive_date is null;"))
    .authorization(allow => allow.publicApiKey()),
    deleteResultsByTemplateId: a.mutation().arguments({
      templateId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.question_result WHERE template_question_id in (SELECT id FROM logistics.template_question WHERE template_id = :templateId);"))
    .authorization(allow => allow.publicApiKey()),
    deleteTemplateByDivisionId: a.mutation().arguments({
      divisionId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.template WHERE division_id = :divisionId;"))
    .authorization(allow => allow.publicApiKey()),
    deleteUserByDivisionId: a.mutation().arguments({
      divisionId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.user WHERE division_id = :divisionId;"))
    .authorization(allow => allow.publicApiKey()),
    deleteAdminByCompanyId: a.mutation().arguments({
      companyId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.admin WHERE company_id = :companyId;"))
    .authorization(allow => allow.publicApiKey()),
    deleteCompanyById: a.mutation().arguments({
      id: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.company WHERE id = :id;"))
    .authorization(allow => allow.publicApiKey()),
    deleteTransactionsByTemplateId: a.mutation().arguments({
      templateId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.transactions WHERE template_id = :templateId;"))
    .authorization(allow => allow.publicApiKey()),
    deleteResultsByTransactionId: a.mutation().arguments({
      transactionId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("DELETE from logistics.question_result WHERE transaction_id = :transactionId;"))
    .authorization(allow => allow.publicApiKey()),
    backupTransactionsByTemplateId: a.mutation().arguments({
      templateId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.transactions_delete SELECT * FROM logistics.transactions WHERE template_id = :templateId;"))
    .authorization(allow => allow.publicApiKey()),
    backupTemplatePermissionsByUserId: a.mutation().arguments({
      userId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.template_permissions_delete SELECT * FROM logistics.template_permissions WHERE user_id = :userId;"))
    .authorization(allow => allow.publicApiKey()),
    backupTemplatePermissionsByTemplateId: a.mutation().arguments({
      templateId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.template_permissions_delete SELECT * FROM logistics.template_permissions WHERE template_id = :templateId;"))
    .authorization(allow => allow.publicApiKey()),
    backupAdminById: a.mutation().arguments({
      id: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.admin_delete SELECT * FROM logistics.admin WHERE id = :id;"))
    .authorization(allow => allow.publicApiKey()),
    backupAdminByCompanyId: a.mutation().arguments({
      companyId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.admin_delete SELECT * FROM logistics.admin WHERE company_id = :companyId;"))
    .authorization(allow => allow.publicApiKey()),
    backupUserById: a.mutation().arguments({
      id: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.user_delete SELECT * FROM logistics.user WHERE id = :id;"))
    .authorization(allow => allow.publicApiKey()),
    backupResultsByTemplate: a.mutation().arguments({
      templateId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.question_result_delete (SELECT * FROM logistics.question_result WHERE template_question_id in (SELECT id FROM logistics.template_question WHERE template_id = :templateId));"))
    .authorization(allow => allow.publicApiKey()),
    backupQuestionsByTemplate: a.mutation().arguments({
      templateId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.template_question_delete SELECT * FROM logistics.template_question WHERE template_id = :templateId;"))
    .authorization(allow => allow.publicApiKey()),
    backupTemplateById: a.mutation().arguments({
      id: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.template_delete SELECT * FROM logistics.template WHERE id = :id;"))
    .authorization(allow => allow.publicApiKey()),
    backupTemplateByDivision: a.mutation().arguments({
      divisionId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.template_delete SELECT * FROM logistics.template WHERE division_id = :divisionId;"))
    .authorization(allow => allow.publicApiKey()),
    backupUserByDivision: a.mutation().arguments({
      divisionId: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.user_delete SELECT * FROM logistics.user WHERE division_id = :divisionId;"))
    .authorization(allow => allow.publicApiKey()),
    backupDivisionById: a.mutation().arguments({
      id: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.division_delete SELECT * FROM logistics.division WHERE id = :id;"))
    .authorization(allow => allow.publicApiKey()),
    backupCompanyById: a.mutation().arguments({
      id: a.string().required()
    })
    .returns(a.json().array())
    .handler(a.handler.inlineSql("INSERT into logistics.company_delete SELECT * FROM logistics.company WHERE id = :id;"))
    .authorization(allow => allow.publicApiKey()),
  })

const schema = a.schema({
  Settings: a
    .model({
      content: a.string(),
      isDisabled: a.boolean()
    })
    .authorization((allow) => [allow.publicApiKey()]),
  Log: a
    .model({
      userName: a.string(),
      content: a.string(),
      detail: a.string(),
      refDoc: a.string(),
      transactionDate: a.datetime(),
      refDate: a.datetime(),
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