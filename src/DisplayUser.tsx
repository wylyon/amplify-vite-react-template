
// @ts-nocheck
import * as React from "react";
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import DisplayQuestion from '../src/DisplayQuestion';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

export default function DisplayUser(props) {
  const client = generateClient<Schema>();
	const [templateQuestion, setTemplateQuestion] = useState<Schema["template_question"]["type"][]>([]);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [theSeverity, setTheSeverity] = useState('error');

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

  const handleOnAlert = (e) => {
    setIsAlert(false);
    setAlertMessage('');
    setTheSeverity("error");
  }

  const handleSubmit = (e) => {
    setIsAlertMessage("Saved Data");
    setTheSeverity("success");
   // setIsAlert(true);
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    // get all name/value pairs
    const nameValuePairs = Object.entries(formJson);

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
      {isAlert &&  <Alert severity={theSeverity} onClose={handleOnAlert}>
            {alertMessage}
          </Alert>}
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
