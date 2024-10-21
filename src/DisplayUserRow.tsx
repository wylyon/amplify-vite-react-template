
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
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function DisplayUserRow(props) {
  const [source, setSource] = useState('');
  const [view, setView] = useState('list');
  const [other, setOther] = useState(false);
  const [heading, setHeading] = useState('');
  const [comboName, setComboName] = useState<string[]>([]);

  const handleChangeMultiple = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { options } = event.target;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
        if (options[i].value == "Other") {
          setHeading("Animal Type");
          setOther(true);
        }
      }
    }
    setComboName(value);
  };

  const handleOtherClose = () => {
    setOther(false);
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
    if (nextView == "Other") {
      setHeading("Animal");
      setOther(true);
    }
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
      <Dialog
        open={other}
        onClose={handleOtherClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const otherAnimal = formJson.other;
            console.log(otherAnimal);
            handleOtherClose();
          },
        }}
      >
        <DialogTitle>Other</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter Other {heading}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="other"
            name="other"
            label={heading}
            type="other"
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleOtherClose}>Cancel</Button>
          <Button color="success" onClick={handleOtherClose}>Ok</Button>
        </DialogActions>
      </Dialog>
    { props.questionType == 'toggle_button' ?
      <div>
      {props.useBoxControls==1 &&
        <Box component="section" sx={{ p: 2, border: '1px dashed grey'}}>
          <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
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
          <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
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
          <Box component="section">
            <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
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
          : props.questionType == 'multiple_dropdown' ?
            <div>
              <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
              <FormControl sx={{ m: 1, minWidth: 120, maxWidth: 300 }}>
                <InputLabel shrink htmlFor="select-multiple-native">
                Values
                </InputLabel>
                <Select<string[]>
                  multiple
                  native
                  value={comboName}
                  // @ts-ignore Typings are not considering `native`
                  onChange={handleChangeMultiple}
                  label="Values"
                  inputProps={{
                    id: 'select-multiple-native',
                  }}
                >
                  {props.question.question_values.split("|").map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </div>
          :
          <DisplayQuestion props={props} question = {props.question} isPreview={false} useBox={props.useBoxControls} useSpacing={props.useAutoSpacing} /> }
    </React.Fragment>
  );
}
