
// @ts-nocheck
import * as React from 'react';
import { useState, useEffect  } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
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
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import Accordion from '@mui/material/Accordion';
import Stack from '@mui/material/Stack';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { cleanUpTextArray, countNumOfTabs, setTitle, setLabel } from '../src/utils.js';

export default function SetupQuestion(props) {
  const [formData, setFormData] = useState({
    id: '',
    templateId: props.template_id,
    questionOrder: props.nextOrder,
    preLoadAttributes: '',
    title: '',
    description: '',
    questionType: 'photo',
    questionValues: '',
    postLoadAttributes: '',
    optionalFlag: false,
    actionsFlag: false,
    notes: '',
    triggerValue: '',
  });
  const [open, setOpen] = useState(true);
  const [openValues, setOpenValues] = useState(false);
  const [whichControl, setWhichControl] = useState('');
  const [isValuesDisabled, setIsValuesDisabled] = useState(true);
  const [openPreAttributes, setOpenPreAttributes] = useState(false);
  const [dialogPrompt, setDialogPrompt] = useState('');
  const [dialogControls, setDialogControls] = useState({});
  const [isAdvanced, setIsAdvanced] = useState(false);

  const handleOnSignOut = (e) => {
    props.onSubmitChange(false);
  };

  const handleClickOpen = () => {
    if (formData.questionValues == '') {
      setDialogPrompt('');
    } else {
      const textArr = formData.questionValues.split("|");
      var newText = textArr[0];
      for (var i = 1; i < textArr.length; i++)
      {
        newText = newText + "\n" + textArr[i];
      }
      setDialogPrompt(newText);
    }
    
    setOpenValues(true);
  };

  const handlePreClose = () => {
    setOpenPreAttributes(false);
  };

  const handleClickOpenPre = () => {
    if (formData.preLoadAttributes == '') {
      setDialogPrompt('');
      setDialogControls({
        lines: 0,
        tabs: 0,
        tabsAfter: 0
      });
    } else {
      const preLoadText = formData.preLoadAttributes;
      var nlines = 0;
      if (preLoadText.indexOf("<br><br><br><br><br><br><br><br><br><br>") < 0) {
        if (preLoadText.indexOf("<br><br><br><br><br><br><br><br><br>") < 0) {
          if (preLoadText.indexOf("<br><br><br><br><br><br><br><br>") < 0) {
            if (preLoadText.indexOf("<br><br><br><br><br><br><br>") < 0) {
              if (preLoadText.indexOf("<br><br><br><br><br><br>") < 0) {
                if (preLoadText.indexOf("<br><br><br><br><br>") < 0) {
                  if (preLoadText.indexOf("<br><br><br><br>") < 0) {
                    if (preLoadText.indexOf("<br><br><br>") < 0) {
                      if (preLoadText.indexOf("<br><br>") < 0) {
                        if (preLoadText.indexOf("<br>") < 0) {
                          nlines = 0;
                        } else {
                          nlines = 1;
                        }
                      } else {
                        nlines = 2;
                      }
                    } else {
                      nlines = 3;
                    }
                  } else {
                    nlines = 4;
                  }
                } else {
                  nlines = 5;
                }
              } else {
                nlines = 6;
              }
            } else {
              nlines = 7;
            }
          } else {
            nlines = 8;
          }
        } else {
          nlines = 9;
        }
      } else {
        nlines = 10;
      }
      const preLoadTextNoLines = preLoadText.replace(/<br>/g, "");
      const ntabs  = countNumOfTabs(preLoadTextNoLines);
      if (preLoadTextNoLines.indexOf("&emsp;") == 0) {
        const preLoadTextNoLinesNoTabs = preLoadTextNoLines.replace(/&emsp;/g, "");
        setDialogPrompt(preLoadTextNoLinesNoTabs);
        setDialogControls({
          lines: nlines,
          tabs: ntabs,
          tabsAfter: 0
        });
      } else {
        if (preLoadTextNoLines.indexOf("&emsp;") > 0) {
          const preLoadTextNoLinesNoTabs = preLoadTextNoLines.replace(/&emsp;/g, "");
          setDialogPrompt(preLoadTextNoLinesNoTabs);
          setDialogControls({
            lines: nlines,
            tabs: 0,
            tabsAfter: ntabs
          });        
        } else {
          setDialogPrompt(preLoadTextNoLines);
          setDialogControls({
            lines: nlines,
            tabs: 0,
            tabsAfter: ntabs
          });              
        }
      }
    }
    setOpenPreAttributes(true);
  }

  const handleClose = (event: object, reason: string) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      return;
    }
    setOpen(false);
    props.onSubmitChange(formData);
  };

  const handleCloseValues = () => {
    setOpenValues(false);
  };

  const handlePhotoClick = () => {
    setIsValuesDisabled(true);
    setWhichControl('');
  }

  const handleDropDownClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Dropdown');
  }

  const handleRadioClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('RadioGroup');
  }

  const handleInputClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Default Input Value');
  }

  const handleTextClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Text value');
  }

  const handleDateClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('');
  }

  const handleButtonClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Button label');
  }

  const handleColorButtonClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Color Button label');
  }

  const handleSwitchClick = () => {
    setIsValuesDisabled(true);
    setWhichControl('Switch');
  }
  const handleToggleButtonClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Toggle Button labels');
  }
  
  const handleDialogInputClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Dialog Input');
  }


  const handleAdvanced = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsAdvanced(event.target.checked);
	  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  function setQuestionValues (textValue) {
    setFormData({
      id: formData.id,
      templateId: props.template_id,
      questionOrder: formData.questionOrder,
      preLoadAttributes: formData.preLoadAttributes,
      title: formData.title,
      description: formData.description,
      questionType: formData.questionType,
      questionValues: textValue,
      postLoadAttributes: formData.postLoadAttributes,
      optionalFlag: formData.optionalFlag,
      actionsFlag: false,
      notes: '',
      triggerValue: textValue,
    });
  }

  function setPreAttributes (textValue) {
    setFormData({
      id: formData.id,
      templateId: props.template_id,
      questionOrder: formData.questionOrder,
      preLoadAttributes: textValue,
      title: formData.title,
      description: formData.description,
      questionType: formData.questionType,
      questionValues: formData.questionValues,
      postLoadAttributes: formData.postLoadAttributes,
      optionalFlag: formData.optionalFlag,
      actionsFlag: false,
      notes: '',
      triggerValue: formData.triggerValue
    });
  }

  const marks = [
    { value: 0, label: '0'},
    { value: 1, label: '1'},
    { value: 2, label: '2'},
    { value: 3, label: '3'},
    { value: 10, label: '10'}
  ];

  function valuetext(value: number) {
    return `${value}°C`;
  }

  useEffect(() => {
	}, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <Dialog
        open={openValues}
        onClose={handleCloseValues}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const text = formJson.textValues;
            if (whichControl.startsWith("Button") || whichControl.startsWith("Color")) {
              const labelText = formJson.labelValues;
              if (text.length < 1) {
                setQuestionValues(labelText);
              } else {
                setQuestionValues(text + "|" + labelText);               
              }
            } else {
              const textArr = text.split(/\r?\n/);
              if (textArr.length < 1) {
                setQuestionValues(text);
              } else {
                if (textArr.length == 1) {
                  setQuestionValues(textArr[0]);
                } else {
                  var newText = textArr[0];
                  for (var i = 1; i < textArr.length; i++) {
                    newText = newText + "|" + textArr[i];
                  }
                  setQuestionValues(newText);
                }
              }
            }
            handleCloseValues();
          },
        }}
      >
        <DialogTitle>{whichControl == '' ? 'Default' : whichControl} Values</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {whichControl.startsWith('Dialog') ? "Enter trigger value:" :
            "Enter each " + whichControl == '' ? 'Default' : whichControl + " value"}
          </DialogContentText>
          {whichControl.startsWith("Button") || whichControl.startsWith("Color") ?
            <TextField
              autoFocus 
              defaultValue={whichControl.startsWith("Color") ? dialogPrompt.split("|")[0] : null}
              disabled = {whichControl.startsWith("Button")}
              margin="dense"
              id="name"
              name="textValues"
              label="Color"
            />
          :
          <TextField
            autoFocus
            defaultValue={dialogPrompt}
            required
            margin="dense"
            id="name"
            name="textValues"
            label={whichControl.startsWith('Dialog') ? "Value" : "Values"}
            multiline={whichControl.startsWith('Dialog') ? false : true}
            rows={whichControl.startsWith('Dialog') ? 1 : 8}
          /> }
          {whichControl.startsWith("Button") || whichControl.startsWith("Color") ?
            <TextField
            autoFocus
            required
            defaultValue={whichControl.startsWith("Button") ? dialogPrompt : dialogPrompt.split("|")[1]}
            margin="dense"
            id="name"
            name="labelValues"
            label="Label"
            /> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseValues}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openPreAttributes}
        onClose={handlePreClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const label = formJson.labelValue;
            const lines = formJson.linesValue;
            const tabs = formJson.tabValue;
            if (label == "" && lines == "0" && tabs == "0") {
              // case where nothing was entered.
              setPreAttributes("");
            } else {
              // we have something to render here
              var preAttributes = "";
              const numLines = Number(lines);
              const numTabs = Number(tabs);
              // lets do lines first
              for (var i = 0; i < numLines; i++) {
                preAttributes = preAttributes + "<br>";
              }
              // lets do tabs next
              for (var i = 0; i < numTabs; i++) {
                preAttributes = preAttributes + "&emsp;";
              }    
              if (label != "") {
                preAttributes = preAttributes + label;
              }       
              setPreAttributes(preAttributes);  
            }
            handlePreClose();
          },
        }}
      >
        <DialogTitle>Enter any control attributes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please select any relevant characteristics you want:
          </DialogContentText>
          <TextField
            autoFocus
            id="control_label"
            name="labelValue"
            label="Any label before the control"
            defaultValue={dialogPrompt}
            variant="outlined"
            fullWidth
          />
          {!props.isWizard ? 
          <Paper>
          <Typography variant="caption" gutterBottom>Number Lines From Prior Control</Typography>
          <Slider aria-label="Always visible"
            defaultValue={dialogControls.lines}
            getAriaValueText={valuetext}
            name="linesValue"
            step={1}
            marks={marks}
            valueLabelDisplay="auto"
            min={0}
            max={10}
          />
          <Typography variant="caption" gutterBottom>Number Tabs before label or control</Typography>
          <Slider aria-label="Always visible"
            defaultValue={dialogControls.tabs}
            getAriaValueText={valuetext}
            name="tabValue"
            step={1}
            marks={marks}
            valueLabelDisplay="auto"
            min={0}
            max={10}
          />
          </Paper> : null }
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            handleClose();
          },
        }}
      >
        <DialogTitle>New Question Wizard</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please select any relevant characteristics you want
          </DialogContentText>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                Step #1: Question Description
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>
                    Please enter a title for this question that will uniquely identify it.
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                <br /> 
                </Typography>
                <Tooltip title="Enter here a title of what this question is about." placement="top">
                  <TextField id="question_title" name="title" value={formData.title} 
                    label="Question Title" variant="outlined" required="true" size="small" 
                    sx={{ width: '250px'}} onChange={handleChange}/></Tooltip>
                  <FormLabel id="filler1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</FormLabel>
                  <br />
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                Step #2: Question Controls
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>
                      Please select the desired control type for this question.
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                  <br /> 
                  </Typography>
                  <FormControlLabel control={<Checkbox id='easyOrAdvanced' checked={isAdvanced} onClick={handleAdvanced}/>} label="Advanced Controls" 
                  />
                  {isAdvanced ?
                    <RadioGroup
                      aria-labelledby="question-group-label"
                      name="questionType" >
                        <Tooltip title="Select this to input a photo" placement="top">
                        <FormControlLabel value="photo" 
                          control={(formData.questionType=="" || formData.questionType=="photo") ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                          label="Photo" 
                          onClick={handlePhotoClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input a dropdown for a single input" placement="right">
                        <FormControlLabel value="dropdown" 
                          control={(formData.questionType=="dropdown") ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                          label="Dropdown" 
                          onClick={handleDropDownClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input a dropdown for multiple inputs" placement="right">
                        <FormControlLabel value="multiple_dropdown" 
                          control={formData.questionType=="multiple_dropdown" ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                          label="Multiple Dropdown" onClick={handleDropDownClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input radio boxes for different input" placement="right">
                        <FormControlLabel value="radiobox" 
                          control={formData.questionType=="radiobox" ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                          label="Radio" 
                          onClick={handleRadioClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input an input box for data" placement="right">
                        <FormControlLabel value="input" 
                          control={formData.questionType=="input" ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                          label="Input" 
                          onClick={handleInputClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input text input for data" placement="right">
                        <FormControlLabel value="text" 
                          control={formData.questionType=="text" ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                          label="Text" 
                          onClick={handleTextClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input date data" placement="right">
                        <FormControlLabel value="datepicker" 
                          control={formData.questionType=="datepicker" ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                          label="Date Picker" 
                          onClick={handleDateClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to select by button" placement="right">
                        <FormControlLabel value="button" 
                          control={formData.questionType=="button" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                          label="Button" 
                          onClick={handleButtonClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to select by color button" placement="right">
                        <FormControlLabel value="contained_button_color" 
                          control={formData.questionType=="contained_button_color" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                          label="Color Button" 
                          onClick={handleColorButtonClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this for a switch" placement="right">
                        <FormControlLabel value="switch" 
                          control={formData.questionType=="switch" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                          label="Switch" 
                          onClick={handleSwitchClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this for a toggle button" placement="right">
                        <FormControlLabel value="toggle_button" 
                          control={formData.questionType=="toggle_button" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                          label="Toggle Button" 
                          onClick={handleToggleButtonClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this for a multi-select toggle button" placement="right">
                        <FormControlLabel value="checkbox_button" 
                          control={formData.questionType=="checkbox_button" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                          label="Multi-Toggle Button" 
                          onClick={handleToggleButtonClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this for a dialog input (triggered by previous question)" placement="right">
                        <FormControlLabel value="dialog_input" 
                          control={formData.questionType=="dialog_input" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                          label="Dialog Input" 
                          onClick={handleDialogInputClick} onChange={handleChange}/></Tooltip>
                    </RadioGroup>
                  : 
                  <RadioGroup
                  aria-labelledby="question-group-label"
                  name="questionType" >
                    <Tooltip title="Select this to input a photo" placement="top">
                    <FormControlLabel value="photo" 
                      control={(formData.questionType=="" || formData.questionType=="photo") ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                      label="Photo" 
                      onClick={handlePhotoClick} onChange={handleChange}/></Tooltip>
                    <Paper elevation={3}>
                      <Typography variant='caption'>Single Input Controls<br/></Typography>
                      <Tooltip title="Select this to select by button" placement="right">
                      <FormControlLabel value="button" 
                        control={formData.questionType=="button" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                        label="A Button" 
                        onClick={handleButtonClick} onChange={handleChange}/></Tooltip>             
                      <br/>        
                      <Tooltip title="Select this to input an input box for data" placement="right">
                      <FormControlLabel value="input" 
                        control={formData.questionType=="input" ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                        label="Simple Input Control" 
                        onClick={handleInputClick} onChange={handleChange}/></Tooltip>
                    </Paper>
                    <br/>
                    <Paper elevation={3}>
                      <Typography variant='caption'>Single Selection from List Controls</Typography>
                      <br/>
                      <Tooltip title="Select this to input a dropdown for a single input" placement="right">
                      <FormControlLabel value="dropdown" 
                        control={(formData.questionType=="dropdown") ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                        label="Dropdown To Select Answer" 
                        onClick={handleDropDownClick} onChange={handleChange}/></Tooltip>
                        <br/>
                      <Tooltip title="Select this for a toggle button" placement="right">
                      <FormControlLabel value="toggle_button" 
                        control={formData.questionType=="toggle_button" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                        label="Series of Buttons of which you can select one" 
                        onClick={handleToggleButtonClick} onChange={handleChange}/></Tooltip>
                        <br/>
                      <Tooltip title="Select this to input radio boxes for different input" placement="right">
                      <FormControlLabel value="radiobox" 
                          control={formData.questionType=="radiobox" ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                          label="Radio buttons to select one" 
                          onClick={handleRadioClick} onChange={handleChange}/></Tooltip>
                    </Paper>
                    <br/>
                    <Paper elevation={3}>
                      <Typography variant='caption'>Multiple Selections from List Controls</Typography>
                      <br/>
                      <Tooltip title="Select this for a multi-select toggle button" placement="right">
                        <FormControlLabel value="checkbox_button" 
                          control={formData.questionType=="checkbox_button" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                          label="Series of Buttons of which you can select multiple answers" 
                          onClick={handleToggleButtonClick} onChange={handleChange}/></Tooltip>
                      <br/>
                      <Tooltip title="Select this to input a dropdown for multiple inputs" placement="right">
                        <FormControlLabel value="multiple_dropdown" 
                          control={formData.questionType=="multiple_dropdown" ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                          label="Dropdown to Select Multiple answers" onClick={handleDropDownClick} onChange={handleChange}/></Tooltip>
                    </Paper>
                </RadioGroup>
                  }
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3-content"
                id="panel3-header"
              >
                Step #3:  Question Attributes and Values
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>
                {props.isWizard ? "Please select any control titles(headers) and values" : "Please select any attributes and values you want on this control."}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                <br /> 
                </Typography>
                <Stack spacing={2} direction="row">
                  <Tooltip title="Click here any special HTML formatting, or text you want processed BEFORE control is rendered." placement="right">
                    <Button variant='contained' onClick={handleClickOpenPre}>{props.isWizard ? "Set Headers" : "Set Attributes"}</Button>
                  </Tooltip>
                  <Tooltip title="Enter here control values (ie. dropdown or radio values)." placement="right">
                    <Button variant='contained' disabled={isValuesDisabled} onClick={handleClickOpen}>Set Values</Button>
                  </Tooltip>  
                </Stack>
              </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='contained' color='error'>Cancel</Button>
          <Button type="submit" variant='contained' color='primary'>Save</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
