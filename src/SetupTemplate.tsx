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

export default function SetupTemplate(props) {

  const [userDataArr, setUserDataArr] = useState([]);
  const client = generateClient<Schema>();
  const [filtered, setFiltered] = useState('');
  const [templatePermissions, setTemplatePermissions] = useState<Schema["template_permissions"]["type"][]>([]);

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleComplete = () => {
    alert("Form completed!");
  }

  useEffect(() => {
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container fixed>
        <div>
          <Box sx={{ bgcolor: '#0492C2', width: '600px', height: '500px', float: 'left', 
              borderStyle: 'solid', borderWidth: '2px' }} >
            <h3>Add Questions: <Button variant="contained" color="error" onClick={handleOnCancel} 
                sx={{ float: 'right'}}>Cancel</Button></h3>
            <FormControl>
              <div>
              <div style={{ float: 'left'}}>
                <Tooltip title="These are UI controls for your Template" placement="top">
                <FormLabel id="question-group-label">Controls</FormLabel></Tooltip>
                <RadioGroup
                  aria-labelledby="question-group-label"
                  defaultValue="input"
                  name="radio-question-group" >
                    <Tooltip title="Select this to input a photo" placement="top">
                    <FormControlLabel value="photo" control={<Radio />} label="Photo" /></Tooltip>
                    <Tooltip title="Select this to input a dropdown for a single input" placement="right">
                    <FormControlLabel value="dropdown" control={<Radio />} label="Dropdown" /></Tooltip>
                    <Tooltip title="Select this to input a dropdown for multiple inputs" placement="right">
                    <FormControlLabel value="multiple_dropdown" control={<Radio />} label="Multiple Dropdown" /></Tooltip>
                    <Tooltip title="Select this to input radio boxes for different input" placement="right">
                    <FormControlLabel value="radiobox" control={<Radio />} label="Radio" /></Tooltip>
                    <Tooltip title="Select this to input an input box for data" placement="right">
                    <FormControlLabel value="input" control={<Radio />} label="Input" /></Tooltip>
                    <Tooltip title="Select this to input text input for data" placement="right">
                    <FormControlLabel value="text" control={<Radio />} label="Text" /></Tooltip>
                    <Tooltip title="Select this to input date data" placement="right">
                    <FormControlLabel value="datepicker" control={<Radio />} label="Date Picker" /></Tooltip>
                </RadioGroup>
              </div>
              <div style={{ marginLeft: '200px'}}>
                <Tooltip title="Enter here a title of what this question is about." placement="top">
                <TextField id="question_title" label="Question Title" variant="outlined" size="small" 
                  sx={{ width: '250px'}}/></Tooltip>
                <FormLabel id="filler1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</FormLabel>
                <Tooltip title="Enter here the order of this question relative to others." placement="right">
                <TextField id="question_order" label="Order#" variant="outlined" size="small" 
                  sx={{ width: '80px' }}/></Tooltip>
                <br />
                <Tooltip title="Enter here a fuller description of what this question is for and about." placement="right">
                <TextField id="question_desc" label="Description" variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} /></Tooltip>
                <br />
                <Tooltip title="Enter here any special HTML formatting you want processed BEFORE control is rendered." placement="right">
                <TextField id="question_pre" label="pre-load-html" variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} /></Tooltip>
                <br />  
                <Tooltip title="Enter here any special HTML formatting you want processed AFTER control is rendered." placement="right">    
                <TextField id="question_post" label="post-load-html" variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} /></Tooltip> 
                <br /><br />
                <Tooltip title="Enter here control values (ie. dropdown or radio values)." placement="right">
                <TextField id="question_values" label="dropdown/input/text/radio values" variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} /></Tooltip>   
                <br />
                <FormGroup>
                <Tooltip title="Check this if input for this control is optional." placement="right">
                  <FormControlLabel value="optional" control={<Checkbox />} label="Optional control" /></Tooltip>
                  <Tooltip title="Check this if ?." placement="right">
                  <FormControlLabel value="actions" control={<Checkbox />} label="Actions" /></Tooltip>
                </FormGroup>   
                <Button variant="contained" color="success" onClick={handleOnCancel} 
                  sx={{ float: 'left'}}>Save</Button>               
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