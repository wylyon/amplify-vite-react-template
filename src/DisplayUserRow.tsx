
// @ts-nocheck
import * as React from "react";
import { useState, useEffect } from "react";
import DisplayQuestion from '../src/DisplayQuestion';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Box } from "@mui/material";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Label } from "@mui/icons-material";
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function DisplayUserRow(props) {
  const [source, setSource] = useState('');
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('list');

  const handleClose = () => {
    setOpen(false);
    props.onSubmitChange(false);
  };

  const handleCapture = (target) => {
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];
        const newUrl = URL.createObjectURL(file);
        setSource(newUrl);
      }
    }
  }
  
  const handleToggleChange = (event: React.MouseEvent<HTMLElement>, nextView: string) => {
    setView(nextView);
  };

  const handleCancel = (e) => {
  
    props.onSubmitChange(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    // get all name/value pairs
    const nameValuePairs = Object.entries(formJson);
    setOpen(true);
    
  };

  const clickPhoto = (id) => {
    document.getElementById(id).click();
  }

  useEffect(() => {
	}, []);

  function createMarkup(dirty) {
	return { __html: dirty };
  }

  return (
    <React.Fragment>
    { props.questionType == 'toggle_button' ?
      <div>
      {props.useBoxControls==1 &&
        <Box component="section" sx={{ p: 2, border: '1px dashed grey'}}>
          <ToggleButtonGroup
            color="primary"
            value={view}
            exclusive
            onChange={handleToggleChange}
            orientation="vertical"
          >
          {props.question.question_values.split("|").map(comp => 
            <ToggleButton value={comp} aria-label={comp} sx={{backgroundColor: "dodgerblue"}}>{comp}</ToggleButton> )}
          </ToggleButtonGroup>
        </Box>
      }
      {props.useBoxControls==0 && props.useAutoSpacing==1 &&
        <Box component="section"  sx={{ p: 2, border: '1px'}}>
          <ToggleButtonGroup
            color="primary"
            value={view}
            exclusive
            onChange={handleToggleChange}
            orientation="vertical"
          >
          {props.question.question_values.split("|").map(comp => 
            <ToggleButton value={comp} aria-label={comp} sx={{backgroundColor: "dodgerblue"}}>{comp}</ToggleButton> )}
          </ToggleButtonGroup>
        </Box>
      }
      {props.useBoxControls==0 && props.useAutoSpacing==0 &&
          <ToggleButtonGroup
            color="primary"
            value={view}
            exclusive
            onChange={handleToggleChange}
            orientation="vertical"
          >
          {props.question.question_values.split("|").map(comp => 
            <ToggleButton value={comp} aria-label={comp} sx={{backgroundColor: "dodgerblue"}}>{comp}</ToggleButton> )}
        </ToggleButtonGroup>
      }
      </div>
    : props.questionType == 'photo' ?
      <div><br/><br/>
      {props.useBoxControls==1 && 
        <Box component="section" sx={{ p: 2, border: '1px dashed grey'}}>
          <Stack direction="row" spacing={2} >
            <Paper elevation={2}>
              <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
              <IconButton aria-label="upload picture" onClick={() => clickPhoto(props.questionType + props.questionOrder)}> 
                <CameraAltIcon fontSize="large"/>
              </IconButton>
              <input type="file" id={props.questionType + props.questionOrder} name={"icon-button-photo" + props.questionOrder} 
                capture="environment" style={{ display: "none"}} onChange={(e) => handleCapture(e.target)}/>
            </Paper>
            {source && <Paper elevation={2} sx={{ width: 100, height: 100, borderRadius: 1}}>
              <Box sx={{ width: 100, height: 100, borderRadius: 1}}>
                <img src={source} alt={"snap"} style={{ height: "inherit", maxWidth: "inherit"}}></img>
              </Box> 
            </Paper> }
          </Stack>
        </Box>}
        {props.useBoxControls==0 && props.useAutoSpacing==0 &&
          <Stack direction="row" spacing={2} >
            <Paper elevation={2}>
              <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
              <IconButton aria-label="upload picture" onClick={() => clickPhoto(props.questionType + props.questionOrder)}> 
                <CameraAltIcon fontSize="large"/>
              </IconButton>
              <input type="file" id={props.questionType + props.questionOrder} name={"icon-button-photo" + props.questionOrder} 
                capture="environment" style={{ display: "none"}} onChange={(e) => handleCapture(e.target)}/>
            </Paper>
            {source && <Paper elevation={2} sx={{ width: 100, height: 100, borderRadius: 1}}>
              <Box sx={{ width: 100, height: 100, borderRadius: 1}}>
                <img src={source} alt={"snap"} style={{ height: "inherit", maxWidth: "inherit"}}></img>
              </Box> 
            </Paper> }
          </Stack>}
          {props.useBoxControls==0 && props.useAutoSpacing==1 &&
          <Box component="section"  sx={{ p: 2, border: '1px'}}>
            <Stack direction="row" spacing={2} >
            <Paper elevation={2}>
              <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
              <IconButton aria-label="upload picture" onClick={() => clickPhoto(props.questionType + props.questionOrder)}> 
                <CameraAltIcon fontSize="large"/>
              </IconButton>
              <input type="file" id={props.questionType + props.questionOrder} name={"icon-button-photo" + props.questionOrder} 
                capture="environment" style={{ display: "none"}} onChange={(e) => handleCapture(e.target)}/>
            </Paper>
            {source && <Paper elevation={2} sx={{ width: 100, height: 100, borderRadius: 1}}>
              <Box sx={{ width: 100, height: 100, borderRadius: 1}}>
                <img src={source} alt={"snap"} style={{ height: "inherit", maxWidth: "inherit"}}></img>
              </Box> 
            </Paper> }
            </Stack>
          </Box> 
          }
          </div>
          :
          <DisplayQuestion props={props} question = {props.question} isPreview={false} useBox={props.useBoxControls} useSpacing={props.useAutoSpacing} /> }
    </React.Fragment>
  );
}
