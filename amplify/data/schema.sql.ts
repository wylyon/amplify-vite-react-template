// @ts-nocheck
/* eslint-disable */
/* THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY. */
import { a } from "@aws-amplify/data-schema";
import { configure } from "@aws-amplify/data-schema/internals";
import { secret } from "@aws-amplify/backend";

export const schema = configure({
    database: {
        identifier: "IDElVugxuMQJcnR6Pzg1Jog",
        engine: "mysql",
        connectionUri: secret("SQL_CONNECTION_STRING"),
        vpcConfig: {
            vpcId: "vpc-0df1aefdeea42c7ce",
            securityGroupIds: [
                "sg-0e190c701aaf9aea4",
                "sg-04fe1b4f3792f5c25"
            ],
            subnetAvailabilityZones: [
                {
                    subnetId: "subnet-09d1e0e9f1638f761",
                    availabilityZone: "us-east-1f"
                },
                {
                    subnetId: "subnet-0d59bd7052743ad1d",
                    availabilityZone: "us-east-1a"
                },
                {
                    subnetId: "subnet-06d944ac01a740d28",
                    availabilityZone: "us-east-1e"
                },
                {
                    subnetId: "subnet-0d0e3279e1fa07a90",
                    availabilityZone: "us-east-1d"
                },
                {
                    subnetId: "subnet-02f11104d5d3d9d7b",
                    availabilityZone: "us-east-1b"
                },
                {
                    subnetId: "subnet-039a83fa0ee546840",
                    availabilityZone: "us-east-1c"
                }
            ]
        }
    }
}).schema({
    "admin": a.model({
        id: a.string().required(),
        username: a.string(),
        email_address: a.string().required(),
        company_id: a.string(),
        company_name: a.string(),
        first_name: a.string().required(),
        last_name: a.string().required(),
        middle_name: a.string(),
        active_date: a.date(),
        deactive_date: a.datetime(),
        created: a.datetime().required(),
        created_by: a.integer().required()
    }).identifier([
        "id"
    ]),
    "company": a.model({
        id: a.string().required(),
        name: a.string().required(),
        email: a.string().required(),
        address1: a.string().required(),
        address2: a.string(),
        city: a.string().required(),
        state: a.string().required(),
        zipcode: a.string().required(),
        ref_department: a.string(),
        notes: a.string(),
        deactive_date: a.datetime(),
        created: a.datetime().required(),
        created_by: a.integer().required()
    }).identifier([
        "id"
    ]),
    "division": a.model({
        id: a.string().required(),
        company_id: a.string().required(),
        name: a.string().required(),
        email: a.string(),
        address1: a.string(),
        address2: a.string(),
        city: a.string(),
        state: a.string(),
        zipcode: a.string(),
        ref_department: a.string(),
        notes: a.string(),
        deactive_date: a.datetime(),
        created: a.datetime().required(),
        created_by: a.integer().required()
    }).identifier([
        "id"
    ]),
    "question_result": a.model({
        id: a.string().required(),
        template_question_id: a.string().required(),
        result_photo_value: a.string(),
        result_option_value: a.string(),
        result_date_value: a.datetime(),
        gps_lat: a.float(),
        gps_long: a.float(),
        what2words: a.string(),
        created: a.datetime().required(),
        created_by: a.integer().required()
    }).identifier([
        "id"
    ]),
    "template": a.model({
        id: a.string().required(),
        division_id: a.string().required(),
        title: a.string().required(),
        description: a.string(),
        pre_load_page_attributes: a.string(),
        post_load_page_attributes: a.string(),
        live_date: a.date(),
        prod_date: a.date(),
        deactive_date: a.datetime(),
        notes: a.string(),
        created: a.datetime().required(),
        created_by: a.integer().required()
    }).identifier([
        "id"
    ]),
    "template_permissions": a.model({
        id: a.string().required(),
        template_id: a.string().required(),
        user_id: a.string().required(),
        enabled_date: a.datetime(),
        verified_date: a.datetime(),
        created: a.datetime().required(),
        created_by: a.integer().required()
    }).identifier([
        "id"
    ]),
    "template_question": a.model({
        id: a.string().required(),
        template_id: a.string().required(),
        question_order: a.integer(),
        pre_load_attributes: a.string(),
        title: a.string().required(),
        description: a.string(),
        question_type: a.enum([
            "photo",
            "dropdown",
            "multiple_dropdown",
            "radiobox",
            "input",
            "text",
            "datepicker"
        ]),
        question_values: a.string(),
        post_load_attributes: a.string(),
        optional_flag: a.integer(),
        actions_flag: a.integer(),
        notes: a.string(),
        created: a.datetime().required(),
        created_by: a.integer().required()
    }).identifier([
        "id"
    ]).authorization((allow) => [allow.publicApiKey()]),
    "user": a.model({
        id: a.string().required(),
        division_id: a.string().required(),
        email_address: a.string().required(),
        first_name: a.string().required(),
        last_name: a.string().required(),
        middle_name: a.string(),
        active_date: a.date(),
        deactive_date: a.datetime(),
        notes: a.string(),
        created: a.datetime().required(),
        created_by: a.integer().required()
    }).identifier([
        "id"
    ])
});
