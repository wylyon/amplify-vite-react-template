// @ts-nocheck
import { useState, useEffect } from "react";
import React from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { v4 as uuidv4 } from 'uuid';
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
import DisplayQuestion from "../src/DisplayQuestion";
import { AuthType } from "aws-cdk-lib/aws-stepfunctions-tasks";

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

  const [theSeverity, setTheSeverity] = useState('error');
  const client = generateClient<Schema>({
    authMode: 'apiKey',
  });
  const [filtered, setFiltered] = useState('');
  const [isValuesDisabled, setIsValuesDisabled] = useState(true);
  const [templateQuestion, setTemplateQuestion] = useState<Schema["template_question"]["type"][]>([]);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);
  const [open, setOpen] = useState(false);
  const [whichControl, setWhichControl] = useState('');
  const [dialogResult, setDialogResult] = useState('');
  const [dialogPrompt, setDialogPrompt] = useState('');
  const [preview, setPreview] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isDeleteActive, setIsDeleteActive] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

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
    
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpenPreview = () => {
    setPreview(true);
  }

  const handlePreviewClose = () => {
    setPreview(false);
  }

  const getQuestionsByTemplate = async (tempId) => {
    const { data: items, errors } = await client.queries.listQuestionsByTemplateId({
      templateId: tempId
    });
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlert(true);
      return;
    }
    if (items.length < 1) {
      setIsPreviewActive(false);
    } else {
      setIsPreviewActive(true);
    }
    setTemplateQuestion(items);
  };

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
    setTheSeverity("error");
  }

  const handleControls = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [questionType]: value,
    }));
  }
  
  function resetQuestions () {
    setFormData({
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
    setWhichControl('');
  }

  const deleteQuestions = async(questionId) => {
    const { errors, data: deletedQuestions } = await client.models.template_question.delete(      
      {
        id: questionId
      });
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlert(true);
      return;
    }  
  }

  const updateQuestions = async() => {
    const { errors, data: updateQuestions } = await client.models.template_question.update({
      id: formData.id,
      question_order: formData.questionOrder,
      pre_load_attributes: formData.preLoadAttributes,
      title: formData.title,
      description: formData.description,
      question_type: formData.questionType,
      question_values: formData.questionValues,
      post_load_attributes: formData.postLoadAttributes,
      optional_flag: (!formData.optionalFlag ? 0 : 1)     
    });
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlert(true);
      return;
    }
    getQuestionsByTemplate(props.templateId);
    setAlertMessage("Question " + formData.title + " Updated");
    setTheSeverity("success");
    setIsAlert(true);
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
      optional_flag: (!formData.optionalFlag ? 0 : 1),
      notes: '',
      created: now,
      created_by: 0});
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlert(true);
      return;
    }
    getQuestionsByTemplate(props.templateId);
    setAlertMessage("Question " + formData.title + " Added");
    setTheSeverity("success");
    setIsAlert(true);
    resetQuestions();
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
    if (isUpdate) {
      updateQuestions();
    } else {
      const filterTitle = templateQuestion.filter(comp => comp.title.includes(formData.title));
      if (filterTitle.length > 0) {
        setAlertMessage("Question title already used.");
        setIsAlert(true);
        return;       
      }
      const filterSeq = templateQuestion.filter(comp => comp.question_order == formData.questionOrder);
      if (filterTitle.length > 0) {
        setAlertMessage("Question sequence already used.");
        setIsAlert(true);
        return;       
      }   
      createQuestions();  
    }
  }

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

  function handleDelete () {
    for (var i = 0; i < selectedRows.length; i++) {
      deleteQuestions(selectedRows[i]);
    }
    getQuestionsByTemplate(props.templateId);  
  }

  function handleRowClick (params, event, details) {
  }

  function handleRowSelection (rowSelectionModel, details) {
    // called on checkbox for row.   
    if (rowSelectionModel.length == 0) {
      setIsUpdate(false);
      resetQuestions();
      setIsPreviewActive(true);
      setIsDeleteActive(false);
      setSelectedRows([]);
    } else {
      if (rowSelectionModel.length == 1) {
        setIsPreviewActive(true);
        setIsDeleteActive(true);
        setSelectedRows([ { id: rowSelectionModel[0]}]);
        const filtered = templateQuestion.filter(comp => comp.id.includes(rowSelectionModel[0]));
        if (filtered.length == 1 ) {
          setFormData({
            id: filtered[0].id,
            templateId: props.template_id,
            questionOrder: filtered[0].question_order,
            preLoadAttributes: filtered[0].pre_load_attributes,
            title: filtered[0].title,
            description: filtered[0].description,
            questionType: filtered[0].question_type,
            questionValues: filtered[0].question_values,
            postLoadAttributes: filtered[0].post_load_attributes,
            optionalFlag: filtered[0].optional_flag,
            actionsFlag: false,
            notes: '',
          });
          if (filtered[0].question_type == 'photo' || filtered[0].question_type == 'datepicker') {
            setWhichControl('');
            setDialogResult('');
          } else {
            setWhichControl(filtered[0].question_type);
            setDialogResult(filtered[0].question_values);
          }
          setIsUpdate(true);
          setIsValuesDisabled(false);
        }
      } else {
        setIsPreviewActive(true);
        setIsDeleteActive(true);
        var rowIds = [];
        for (var i = 0; i < rowSelectionModel.length; i++) {
          rowIds.push({ id: rowSelectionModel[i]});
        }
        setSelectedRows(rowIds);
      }
    }
  }

  useEffect(() => {
    getQuestionsByTemplate(props.templateId);
  }, []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Question', width: 130 },
    { field: 'question_type', headerName: 'Type', width: 130 },
    {
      field: 'question_order',
      headerName: 'Order',
      type: 'number',
      width: 90,
    },
  ];

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
    });
  }

  function createMarkup(dirty) {
    return { __html: dirty };
    }

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <React.Fragment>
      <CssBaseline />
      <Dialog
        open={preview}
        onClose={handlePreviewClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Preview of Template and Questions"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description"
          sx={{height: '500px', width: '350px'}}>
            <div className="startPreview" dangerouslySetInnerHTML={createMarkup(props.preLoadAttributes)} />
              {templateQuestion.map(comp => <DisplayQuestion props={props} question = {comp} />)}
            <div dangerouslySetInnerHTML={createMarkup(props.postLoadAttributes)} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewClose} autoFocus>
            Close
          </Button>
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
            const text = formJson.textValues;
            const textArr = text.split(/\r?\n/);
            if (textArr.length < 1) {
              setDialogResult(text);
              setQuestionValues(text);
            } else {
              if (textArr.length == 1) {
                setDialogResult(textArr[0]);
                setQuestionValues(textArr[0]);
              } else {
                var newText = textArr[0];
                for (var i = 1; i < textArr.length; i++) {
                  newText = newText + "|" + textArr[i];
                }
                setDialogResult(newText);
                setQuestionValues(newText);
              }
            }
            handleClose();
          },
        }}
      >
        <DialogTitle>{whichControl == '' ? 'Default' : whichControl} Values</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter each {whichControl == '' ? 'Default' : whichControl} value:
          </DialogContentText>
          <TextField
            autoFocus
            defaultValue={dialogPrompt}
            required
            margin="dense"
            id="name"
            name="textValues"
            label="Values"
            multiline
            rows={8}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
      <Container fixed>
        <div>
          {isAlert &&  <Alert severity={theSeverity} onClose={handleOnAlert}>
            {alertMessage}
          </Alert>}
          <Box sx={{ bgcolor: '#C6DEFF', width: '600px', height: '500px', float: 'left', 
              borderStyle: 'solid', borderWidth: '2px' }} >
            <h3>Add Questions: 
              <ButtonGroup variant="contained" aria-label="Question Input group" 
                sx={{ float: 'right'}}>
                <Button variant="contained" color="success" onClick={resetQuestions}>New</Button>
                <Button variant="contained" color="success" onClick={handleOnSave}>Save</Button>
                <Button variant="contained" color="error" onClick={handleOnCancel}>Cancel</Button>
              </ButtonGroup>
            </h3>
            <FormControl>
              <div>
              <div style={{ float: 'left'}}>
                <Tooltip title="These are UI controls for your Template" placement="top">
                <FormLabel id="question-group-label">Controls</FormLabel></Tooltip>
                <RadioGroup
                  aria-labelledby="question-group-label"
                  name="questionType" >
                    <Tooltip title="Select this to input a photo" placement="top">
                    <FormControlLabel value="photo" 
                      control={(formData.questionType=="" || formData.questionType=="photo") ? <Radio checked="true"/> : <Radio />} 
                      label="Photo" 
                      onClick={handlePhotoClick} onChange={handleChange}/></Tooltip>
                    <Tooltip title="Select this to input a dropdown for a single input" placement="right">
                    <FormControlLabel value="dropdown" 
                      control={(formData.questionType=="dropdown") ? <Radio checked="true"/> : <Radio />} 
                      label="Dropdown" 
                      onClick={handleDropDownClick} onChange={handleChange}/></Tooltip>
                    <Tooltip title="Select this to input a dropdown for multiple inputs" placement="right">
                    <FormControlLabel value="multiple_dropdown" 
                      control={formData.questionType=="multiple_dropdown" ? <Radio checked="true"/> : <Radio />} 
                      label="Multiple Dropdown" onClick={handleDropDownClick} onChange={handleChange}/></Tooltip>
                    <Tooltip title="Select this to input radio boxes for different input" placement="right">
                    <FormControlLabel value="radiobox" 
                      control={formData.questionType=="radiobox" ? <Radio checked="true" /> : <Radio />} 
                      label="Radio" 
                      onClick={handleRadioClick} onChange={handleChange}/></Tooltip>
                    <Tooltip title="Select this to input an input box for data" placement="right">
                    <FormControlLabel value="input" 
                      control={formData.questionType=="input" ? <Radio checked="true"/> : <Radio />} 
                      label="Input" 
                      onClick={handleInputClick} onChange={handleChange}/></Tooltip>
                    <Tooltip title="Select this to input text input for data" placement="right">
                    <FormControlLabel value="text" 
                      control={formData.questionType=="text" ? <Radio checked="true"/> : <Radio />} 
                      label="Text" 
                      onClick={handleTextClick} onChange={handleChange}/></Tooltip>
                    <Tooltip title="Select this to input date data" placement="right">
                    <FormControlLabel value="datepicker" 
                      control={formData.questionType=="datepicker" ? <Radio checked="true"/> : <Radio />} 
                      label="Date Picker" 
                      onClick={handleDateClick} onChange={handleChange}/></Tooltip>
                </RadioGroup>
              </div>
              <div style={{ marginLeft: '200px'}}>
                <Tooltip title="Enter here a title of what this question is about." placement="top">
                <TextField id="question_title" name="title" value={formData.title} 
                  label="Question Title" variant="outlined" required="true" size="small" 
                  sx={{ width: '250px'}} onChange={handleChange}/></Tooltip>
                <FormLabel id="filler1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</FormLabel>
                <Tooltip title="Enter here the order of this question relative to others." placement="right">
                <TextField id="question_order" name="questionOrder" value={formData.questionOrder} 
                  label="Order#" variant="outlined" size="small" 
                  sx={{ width: '80px' }} required="true" onChange={handleChange}/></Tooltip>
                <br />
                <Tooltip title="Enter here a fuller description of what this question is for and about." placement="right">
                <TextField id="question_desc" name="description" value={formData.description} 
                  label="Description" variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} onChange={handleChange}/></Tooltip>
                <br /><br />
                <Tooltip title="Enter here any special HTML formatting, or text you want processed BEFORE control is rendered." placement="right">
                <TextField id="question_pre" name="preLoadAttributes" value={formData.preLoadAttributes} 
                  label="control pre-attributes i.e. label" variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} onChange={handleChange}/></Tooltip>
                <br />  
                <Tooltip title="Enter here any special HTML formatting, or text you want processed AFTER control is rendered." placement="right">    
                <TextField id="question_post" name="postLoadAttributes" value={formData.postLoadAttributes} 
                  label="control post attributes (optional)" variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} onChange={handleChange}/></Tooltip> 
                <br /><br />
                <Tooltip title="Enter here control values (ie. dropdown or radio values)." placement="right">
                <TextField id="question_values" name="questionValues" value={dialogResult} 
                  label="dropdown/input/text/radio values" 
                  disabled={isValuesDisabled} variant="outlined" size="small" multiline
                  maxRows={4} sx={{ width: "350px"}} onClick={handleClickOpen} onChange={handleChange}/></Tooltip>   
                <br />
                <FormGroup>
                <Tooltip title="Check this if input for this control is optional." placement="right">
                  <FormControlLabel value={formData.optionalFlag} name="optionalFlag" 
                    control={formData.optionalFlag ? <Checkbox checked /> : <Checkbox />} 
                    label="Optional control" 
                    onChange={handleChange} /></Tooltip>
                </FormGroup>                  
              </div>
              </div>
            </FormControl>
          </Box>
          <Box sx={{ bgcolor: '#52B2BF', width: '500px', height: '500px', marginLeft: '620px',
              borderStyle: 'solid', borderWidth: '2px'}} >
            <h3>{props.name} Questions 
              <ButtonGroup variant="contained" aria-label="Question View group"  sx={{ float: 'right'}}>
                <Button variant="contained" disabled={!isDeleteActive} color="error" onClick={handleDelete}>Delete</Button>
                <Button variant="contained" disabled={!isPreviewActive} color="success" onClick={handleClickOpenPreview}>Preview</Button>
              </ButtonGroup>
            </h3>
             <Paper sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={templateQuestion}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
                onRowClick={handleRowClick}
                onRowSelectionModelChange={handleRowSelection}
                sx={{ border: 0 }}
              />
            </Paper>
          </Box>
        </div>
      </Container>
    </React.Fragment>
  );
}