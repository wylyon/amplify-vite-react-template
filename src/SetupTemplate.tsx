// @ts-nocheck
import { useState, useEffect } from "react";
import React from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { v4 as uuidv4 } from 'uuid';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';

export default function SetupTemplate(props) {
  const [formData, setFormData] = useState({
    id: '',
    templateId: props.template_id,
    questionOrder: 0,
    preLoadAttributes: '',
    title: '',
    description: '',
    questionType: 'photo',
    questionValues: '',
    postLoadAttributes: '',
    optionalFlag: false,
    actionsFlag: false,
    notes: '',
  });

  const [userDataArr, setUserDataArr] = useState([]);
  const client = generateClient<Schema>();
  const [filtered, setFiltered] = useState('');
  const [isValuesDisabled, setIsValuesDisabled] = useState(true);
  const [templatePermissions, setTemplatePermissions] = useState<Schema["template_permissions"]["type"][]>([]);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleOnAlert = (e) => {
    setIsAlert(false);
    setAlertMessage('');
  }

  const handleControls = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [questionType]: value,
    }));
  }
  
  const createQuestions = async() => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();

    const { errors, data: newQuestions } = await client.models.template_question.create({
      id: uuidv4(),
      template_id: props.templateId,
      question_order: formData.questionOrder,
      pre_load_attributes: formData.preLoadAttributes,
      title: formData.title,
      description: formData.description,
      question_type: formData.questionType,
      question_values: formData.questionValues,
      post_load_attributes: formData.postLoadAttributes,
      optional_flag: formData.optionalFlag,
      notes: '',
      created: now,
      created_by: 0});
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlert(true);
      return;
    }
  }


  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleComplete = () => {
    alert("Form completed!");
  }

  const handleOnSave = () => {
    if (formData.title == "") {
      setAlertMessage("Please provide a title for this question.");
      setIsAlert(true);
      return;
    }
    createQuestions();
  }

  const handlePhotoClick = () => {
    setIsValuesDisabled(true);
  }

  const handleDropDownClick = () => {
    setIsValuesDisabled(false);
  }

  const handleRadioClick = () => {
    setIsValuesDisabled(false);
  }

  const handleInputClick = () => {
    setIsValuesDisabled(false);
  }

  const handleTextClick = () => {
    setIsValuesDisabled(false);
  }

  const handleDateClick = () => {
    setIsValuesDisabled(false);
  }

  useEffect(() => {
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container fixed>
        <div>
          {isAlert &&  <Alert severity="error" onClose={handleOnAlert}>
            {alertMessage}
          </Alert>}
          <Box sx={{ bgcolor: '#C6DEFF', width: '600px', height: '500px', float: 'left', 
              borderStyle: 'solid', borderWidth: '2px' }} >
            <h3>Add Questions: <Button variant="contained" color="success" onClick={handleOnSave} 
                  sx={{ float: 'right'}}>Save</Button><Button variant="contained" color="error" onClick={handleOnCancel} 
                sx={{ float: 'right'}}>Cancel</Button></h3>
            <FormControl>
              <div>
              <div style={{ float: 'left'}}>
                <Tooltip title="These are UI controls for your Template" placement="top">
                <FormLabel id="question-group-label">Controls</FormLabel></Tooltip>
                <RadioGroup
                  aria-labelledby="question-group-label"
                  defaultValue={"photo"}
                  name="radio-question-group" >
                    <Tooltip title="Select this to input a photo" placement="top">
                    <FormControlLabel value="photo" control={<Radio />} label="Photo" 
                      onClick={handlePhotoClick} onChange={handleControls}/></Tooltip>
                    <Tooltip title="Select this to input a dropdown for a single input" placement="right">
                    <FormControlLabel value="dropdown" control={<Radio />} label="Dropdown" 
                      onClick={handleDropDownClick} onChange={handleControls}/></Tooltip>
                    <Tooltip title="Select this to input a dropdown for multiple inputs" placement="right">
                    <FormControlLabel value="multiple_dropdown" control={<Radio />} 
                      label="Multiple Dropdown" onClick={handleDropDownClick} onChange={handleControls}/></Tooltip>
                    <Tooltip title="Select this to input radio boxes for different input" placement="right">
                    <FormControlLabel value="radiobox" control={<Radio />} label="Radio" 
                      onClick={handleRadioClick} onChange={handleControls}/></Tooltip>
                    <Tooltip title="Select this to input an input box for data" placement="right">
                    <FormControlLabel value="input" control={<Radio />} label="Input" 
                      onClick={handleInputClick} onChange={handleControls}/></Tooltip>
                    <Tooltip title="Select this to input text input for data" placement="right">
                    <FormControlLabel value="text" control={<Radio />} label="Text" 
                      onClick={handleTextClick} onChange={handleControls}/></Tooltip>
                    <Tooltip title="Select this to input date data" placement="right">
                    <FormControlLabel value="datepicker" control={<Radio />} label="Date Picker" 
                      onClick={handleDateClick} onChange={handleControls}/></Tooltip>
                </RadioGroup>
              </div>
              <div style={{ marginLeft: '200px'}}>
                <Tooltip title="Enter here a title of what this question is about." placement="top">
                <TextField id="question_title" name="title" label="Question Title" variant="outlined" required="true" size="small" 
                  sx={{ width: '250px'}} onChange={handleChange}/></Tooltip>
                <FormLabel id="filler1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</FormLabel>
                <Tooltip title="Enter here the order of this question relative to others." placement="right">
                <TextField id="question_order" name="questionOrder" label="Order#" variant="outlined" size="small" 
                  sx={{ width: '80px' }} required="true" onChange={handleChange}/></Tooltip>
                <br />
                <Tooltip title="Enter here a fuller description of what this question is for and about." placement="right">
                <TextField id="question_desc" name="description" label="Description" variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} onChange={handleChange}/></Tooltip>
                <br /><br />
                <Tooltip title="Enter here any special HTML formatting, or text you want processed BEFORE control is rendered." placement="right">
                <TextField id="question_pre" name="preLoadAttributes" label="control pre-attributes i.e. label" variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} onChange={handleChange}/></Tooltip>
                <br />  
                <Tooltip title="Enter here any special HTML formatting, or text you want processed AFTER control is rendered." placement="right">    
                <TextField id="question_post" name="postLoadAttributes" label="control post attributes (optional)" variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} onChange={handleChange}/></Tooltip> 
                <br /><br />
                <Tooltip title="Enter here control values (ie. dropdown or radio values)." placement="right">
                <TextField id="question_values" name="questionValues" label="dropdown/input/text/radio values" disabled={isValuesDisabled} variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} onChange={handleChange}/></Tooltip>   
                <br />
                <FormGroup>
                <Tooltip title="Check this if input for this control is optional." placement="right">
                  <FormControlLabel value="optional" name="optionalFlag" control={<Checkbox />} label="Optional control" 
                    onChange={handleChange} /></Tooltip>
                </FormGroup>                  
              </div>
              </div>
            </FormControl>
          </Box>
          <Box sx={{ bgcolor: '#52B2BF', width: '400px', height: '500px', marginLeft: '700px',
              borderStyle: 'solid', borderWidth: '2px'}} >
            <h3>{props.name} Questions <Button variant="contained" color="success" onClick={handleOnCancel} 
                sx={{ float: 'right'}}>Preview</Button></h3>
          </Box>
        </div>
      </Container>
    </React.Fragment>
  );
}