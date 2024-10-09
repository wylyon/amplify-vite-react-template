
// @ts-nocheck
import * as React from "react";
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import DisplayQuestion from '../src/DisplayQuestion';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import { Box } from "@mui/material";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Label } from "@mui/icons-material";
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default function DisplayUser(props) {
  const client = generateClient<Schema>();
	const [templateQuestion, setTemplateQuestion] = useState<Schema["template_question"]["type"][]>([]);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [theSeverity, setTheSeverity] = useState('error');
  const [source, setSource] = useState('');

  const handleCapture = (target) => {
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];
        const newUrl = URL.createObjectURL(file);
        setSource(newUrl);
      }
    }
  }
  
  const handleCancel = (e) => {
  
    props.onSubmitChange(false);
  }

  const handleOnAlert = (e) => {
    setIsAlert(false);
    setAlertMessage('');
    setTheSeverity("error");
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    // get all name/value pairs
    const nameValuePairs = Object.entries(formJson);

    props.onSubmitChange(false);
  };

  const clickPhoto = () => {
    document.getElementById("icon-button-photo").click();
  }

  useEffect(() => {
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
        {props.templateQuestions.map(comp => 
          (comp.question_type == 'photo') ?
          <div><br/><br/><br/><br/>
            <Stack direction="row" spacing={2} >
              <Paper elevation={2}>
                <Typography variant="caption" gutterBottom>{comp.pre_load_attributes}</Typography>
                <IconButton aria-label="upload picture" onClick={() => clickPhoto()}> 
                  <CameraAltIcon fontSize="large"/>
                </IconButton>
                <input type="file" id="icon-button-photo" name={"icon-button-photo" + comp.question_order} 
                  capture="environment" style={{ display: "none"}} onChange={(e) => handleCapture(e.target)}/>
              </Paper>
              {source && <Paper elevation={2} sx={{ width: 100, height: 100, borderRadius: 1}}>
                <Box sx={{ width: 100, height: 100, borderRadius: 1}}>
                  <img src={source} alt={"snap"} style={{ height: "inherit", maxWidth: "inherit"}}></img>
                </Box> 
              </Paper> }
            </Stack>
          </div>
          :
          <DisplayQuestion props={props} question = {comp} isPreview={false} />)}
        <br/><br/>
        <Stack spacing={2} direction="row">
          <Button variant="contained" type="submit">Save</Button>
          <Button variant="contained" color="error" onClick={handleCancel}>Cancel</Button>
        </Stack>
      </form>
      <div key="postLoadAttributes" dangerouslySetInnerHTML={createMarkup(props.postLoadAttributes)} />
    </React.Fragment>
  );
}
