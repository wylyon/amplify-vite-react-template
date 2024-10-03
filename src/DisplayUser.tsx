
// @ts-nocheck
import * as React from "react";
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import DisplayQuestion from '../src/DisplayQuestion';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function DisplayUser(props) {
  const client = generateClient<Schema>();
	const [templateQuestion, setTemplateQuestion] = useState<Schema["template_question"]["type"][]>([]);

  const getQuestionsByTemplate = async (tempId) => {
		const { data: items, errors } = await client.queries.listQuestionsByTemplateId({
		  templateId: tempId
		});
		if (errors) {
		  alert(errors[0].message);
		  return;
		}
		setTemplateQuestion(items);
	};
  
  const handleCancel = (e) => {
    props.onSubmitChange(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    props.onSubmitChange(false);
  };

  useEffect(() => {
	  getQuestionsByTemplate(props.templateId);
	}, []);

  function createMarkup(dirty) {
	return { __html: dirty };
  }

  return (
    <React.Fragment>
      <div key="preLoadAttributes" className="startProgram" dangerouslySetInnerHTML={createMarkup(props.preLoadAttributes)} />
      <form onSubmit={handleSubmit}>
        {templateQuestion.map(comp => <DisplayQuestion props={props} question = {comp} isPreview={false} />)}
        <Stack spacing={2} direction="row">
          <Button variant="contained" type="submit">Save</Button>
          <Button variant="contained" color="error" onClick={handleCancel}>Cancel</Button>
        </Stack>
      </form>
      <div key="postLoadAttributes" dangerouslySetInnerHTML={createMarkup(props.postLoadAttributes)} />
    </React.Fragment>
  );
}
