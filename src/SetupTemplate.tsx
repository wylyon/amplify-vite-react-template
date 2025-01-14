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
import SetupQuestion from "../src/SetupQuestion";
import { AuthType } from "aws-cdk-lib/aws-stepfunctions-tasks";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import PopupReview from "../src/PopupPreview";
import { min } from "moment";

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
    triggerValue: '',
  });

  const [theSeverity, setTheSeverity] = useState('error');
  const client = generateClient<Schema>({
    authMode: 'apiKey',
  });
  const [filtered, setFiltered] = useState<Schema["template_question"]["type"][]>([]);
  const [isValuesDisabled, setIsValuesDisabled] = useState(true);
  const [templateQuestion, setTemplateQuestion] = useState<Schema["template_question"]["type"][]>([]);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);
  const [open, setOpen] = useState(false);
  const [openPreAttributes, setOpenPreAttributes] = useState(false);
  const [whichControl, setWhichControl] = useState('');
  const [dialogResult, setDialogResult] = useState('');
  const [dialogPrompt, setDialogPrompt] = useState('');
  const [preview, setPreview] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isDeleteActive, setIsDeleteActive] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dialogControls, setDialogControls] = useState({});
  const [isWizard, setIsWizard] = useState(false);
  const [openSetup, setOpenSetup] = useState(true);

  const handleClickOpen = () => {
    if (formData.questionValues == '') {
      setDialogPrompt('');
    } else {
      if (whichControl.startsWith("Button") || whichControl.startsWith("Color")) {
        setDialogPrompt(formData.questionValues);
      } else {
        const textArr = formData.questionValues.split("|");
        var newText = textArr[0];
        for (var i = 1; i < textArr.length; i++)
        {
          newText = newText + "\n" + textArr[i];
        }
        setDialogPrompt(newText);
      }
    }
    
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpenPreview = () => {
    setPreview(true);
  }

  const handlePreClose = () => {
    setOpenPreAttributes(false);
  };

  function countNumOfTabs(text) {
    if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
      if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
        if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
          if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
            if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
              if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
                if (text.indexOf("&emsp;&emsp;&emsp;&emsp;") < 0) {
                  if (text.indexOf("&emsp;&emsp;&emsp;") < 0) {
                    if (text.indexOf("&emsp;&emsp;") < 0) {
                      if (text.indexOf("&emsp;") < 0) {
                        return 0;
                      } else {
                        return 1;
                      }
                    } else {
                      return 2;
                    }
                  } else {
                    return 3;
                  }
                } else {
                  return 4;
                }
              } else {
                return 5;
              }
            } else {
              return 6;
            }
          } else {
            return 7;
          }
        } else {
          return 8;
        }
      } else {
        return 9;
      }
    } else {
      return 10;
    }
  }

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

  const handlePreviewClose = () => {
    setPreview(false);
  }

  function setFormDataFields (value, field) {
    setFormData({
      id: formData.id,
      templateId: props.template_id,
      questionOrder: field == 'order' ? value : formData.questionOrder,
      preLoadAttributes: field == 'pre' ? value : formData.preLoadAttributes,
      title: formData.title,
      description: formData.description,
      questionType: formData.questionType,
      questionValues: field == 'values' ? value : formData.questionValues,
      postLoadAttributes: formData.postLoadAttributes,
      optionalFlag: formData.optionalFlag,
      actionsFlag: false,
      notes: '',
      triggerValue: formData.triggerValue,
    });
  }

  const getQuestionsByTemplate = async (tempId) => {
    if (props.isWizard) {
      setTemplateQuestion(props.templateQuestions);
      setFormDataFields(props.templateQuestions == [] ? 1 : props.templateQuestions.length + 1, 'order');
      setFiltered(props.templateQuestions.filter(comp => !comp.question_type.includes('dialog_input')));
      return;
    }
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
      setFormDataFields(1, 'order');
    } else {
      setIsPreviewActive(true);
      // get next order#
      const nextOrder = items[items.length-1].question_order + 1;
      setFormDataFields(nextOrder, 'order');
    }
    setTemplateQuestion(items);
    setFiltered(items.filter(comp => !comp.question_type.includes('dialog_input')));
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
  
  function resetQuestions (questionOrder) {
    setFormData({
      id: '',
      templateId: props.template_id,
      questionOrder: questionOrder == null ? 0 : questionOrder,
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
    setWhichControl('');
  }

  const mapTemplateQuestions = (isUpdate, deleteId) => {
    var newTemplateQuestion = [];
    for (var indx = 0; indx < templateQuestion.length; indx++) {
      if (deleteId != null && templateQuestion[indx].id == deleteId) {

      } else if (isUpdate && templateQuestion[indx].id == formData.id) {
        newTemplateQuestion.push({
          id: formData.id,
          question_order: formData.questionOrder,
          pre_load_attributes: formData.preLoadAttributes,   
          title: formData.title,
          description: formData.description,
          question_type: formData.questionType,
          question_values: formData.questionValues,
          post_load_attributes: formData.postLoadAttributes,
          optional_flag: (!formData.optionalFlag ? 0 : 1),
          trigger_value: formData.questionType == 'dialog_input' ? formData.questionValues : ''
        });
      } else {
          newTemplateQuestion.push({
            id: templateQuestion[indx].id,
            question_order: templateQuestion[indx].question_order,
            pre_load_attributes: templateQuestion[indx].pre_load_attributes,   
            title: templateQuestion[indx].title,
            description: templateQuestion[indx].description,
            question_type: templateQuestion[indx].question_type,
            question_values: templateQuestion[indx].question_values,
            post_load_attributes: templateQuestion[indx].post_load_attributes,
            optional_flag: templateQuestion[indx].optional_flag,
            trigger_value: templateQuestion[indx].trigger_value   
          });
      }
    }
    if (!isUpdate && deleteId == null) {
      newTemplateQuestion.push({
        id: uuidv4(),
        question_order: formData.questionOrder,
        pre_load_attributes: formData.preLoadAttributes,   
        title: formData.title,
        description: formData.description,
        question_type: formData.questionType,
        question_values: formData.questionValues,
        post_load_attributes: formData.postLoadAttributes,
        optional_flag: (!formData.optionalFlag ? 0 : 1),
        trigger_value: formData.questionType == 'dialog_input' ? formData.questionValues : ''
      });
    }
    setTemplateQuestion(newTemplateQuestion);
    setFiltered(newTemplateQuestion.filter(comp => !comp.question_type.includes('dialog_input')));
  }


  // For now, lets "mark" as deleted until we can officially delete
  const deleteQuestions = async(questionId) => {
    if (props.isWizard) {
      mapTemplateQuestions(false, questionId.id);
    } else {
      const now = new Date();
      const qId = questionId.id;
      const { errors, data } = await client.mutations.deleteQuestionById({
        questionId: qId
      });
    }
  }

  const updateQuestions = async() => {
    if (props.isWizard) {
      mapTemplateQuestions(true, null);
    } else {
      const { errors, data: updateQuestions } = await client.models.template_question.update({
        id: formData.id,
        question_order: formData.questionOrder,
        pre_load_attributes: formData.preLoadAttributes,
        title: formData.title,
        description: formData.description,
        question_type: formData.questionType,
        question_values: formData.questionValues,
        post_load_attributes: formData.postLoadAttributes,
        optional_flag: (!formData.optionalFlag ? 0 : 1),
        trigger_value: formData.questionType == 'dialog_input' ? formData.questionValues : ''
      });
      if (errors) {
        setAlertMessage(errors[0].message);
        setIsAlert(true);
        return;
      }
      getQuestionsByTemplate(props.templateId);
  }
    setAlertMessage("Question " + formData.title + " Updated");
    setTheSeverity("success");
    setIsAlert(true);
  }

  const createQuestions = async() => {
    const now = new Date();
    const nextOrder = formData.questionOrder + 1;
    const currentDateTime = now.toLocaleString();
    if (props.isWizard) {
      mapTemplateQuestions(false, null);
    } else {
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
        created_by: props.userId,
        trigger_value: formData.questionType == 'dialog_input' ? formData.questionValues : ''
      });
      if (errors) {
        setAlertMessage(errors[0].message);
        setIsAlert(true);
        return;
      }
      getQuestionsByTemplate(props.templateId);
    }
    setAlertMessage("Question " + formData.title + " Added");
    setTheSeverity("success");
    setIsAlert(true);
    resetQuestions(props.isWizard ? nextOrder : null);
  }


  const handleOnCancel = (event: object, reason: string) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      return;
    }
    setOpenSetup(false);
    props.onSubmitChange(
      props.isWizard ?
        templateQuestion
      : false
    );
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

  function handleOnNew() {
    setIsWizard(true);
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

  const handleButtonClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Button label');
  }

  const handleToggleButtonClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Toggle Button labels');
  }

  const handleDialogInputClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Dialog Input');
  }

  const handleColorButtonClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Color Button label');
  }

  const handleSwitchClick = () => {
    setIsValuesDisabled(true);
    setWhichControl('Switch');
  }

  function handleDelete () {
    for (var i = 0; i < selectedRows.length; i++) {
      deleteQuestions(selectedRows[i]);
    }
    if (!props.isWizard) {
      getQuestionsByTemplate(props.templateId); 
    }
  }

  function handleRowClick (params, event, details) {
  }

  function handleRowSelection (rowSelectionModel, details) {
    // called on checkbox for row.         
    if (rowSelectionModel.length == 0) {
      setIsUpdate(false);
      resetQuestions(templateQuestion.length + 1);
      setIsPreviewActive(true);
      setIsDeleteActive(false);
      setSelectedRows([]);
    } else {
      if (rowSelectionModel.length == 1) {
        setIsPreviewActive(true);
        setIsDeleteActive(true);
        setSelectedRows([ { id: rowSelectionModel[0]}]);
        const filteredId = templateQuestion.filter(comp => comp.id.includes(rowSelectionModel[0]));
        if (filteredId.length == 1 ) {
          setFormData({
            id: filteredId[0].id,
            templateId: props.template_id,
            questionOrder: filteredId[0].question_order,
            preLoadAttributes: filteredId[0].pre_load_attributes,
            title: filteredId[0].title,
            description: filteredId[0].description,
            questionType: filteredId[0].question_type,
            questionValues: filteredId[0].question_values,
            postLoadAttributes: filteredId[0].post_load_attributes,
            optionalFlag: filteredId[0].optional_flag,
            actionsFlag: false,
            notes: '',
            triggerValue: filteredId[0].trigger_value
          });
          if (filteredId[0].question_type == 'photo' || filteredId[0].question_type == 'datepicker' || filteredId[0].question_type == 'switch') {
            setWhichControl('');
            setDialogResult('');
            setIsValuesDisabled(true);
            setIsUpdate(true);
            return;
          } else {
            if (filteredId[0].question_type == 'button' || filteredId[0].question_type == 'contained_button_color') {
              setWhichControl(filteredId[0].question_type == 'button' ? 'Button label' : 'Color Button label');
              setDialogResult(filteredId[0].question_values);              
            } else {
              setWhichControl(filteredId[0].question_type);
              setDialogResult(filteredId[0].question_values);
            }
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

  function newQuestionSubmit (e) {
    setIsWizard(false);
    setFormData({
      id: e.id,
      templateId: props.template_id,
      questionOrder: e.questionOrder,
      preLoadAttributes: e.preLoadAttributes,
      title: e.title,
      description: e.description,
      questionType: e.questionType,
      questionValues: e.questionValues,
      postLoadAttributes: e.postLoadAttributes,
      optionalFlag: e.optionalFlag,
      actionsFlag: false,
      notes: '',
      triggerValue: e.triggerValue
    });
    if (e.questionType != 'photo' && e.questionType != 'datepicker') {
      setIsValuesDisabled(false);
    }
  }

  const paginationModel = { page: 0, pageSize: 5 };
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

  return (
    <React.Fragment>
      <CssBaseline />
      {isWizard && <SetupQuestion props={props} isWizard={props.isWizard}
        onSubmitChange={newQuestionSubmit} 
        nextOrder={templateQuestion.length+1}
      />}
      {preview && <PopupReview props={props} 
        onSubmitClose={handlePreviewClose}
        preLoadAttributes={props.preLoadAttributes}
        usePages={props.usePages}
        name={props.name}
        filtered={filtered}
        postLoadAttributes={props.postLoadAttributes}
      />}
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
              setFormDataFields("", 'pre');
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
              setFormDataFields(preAttributes, 'pre');  
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
          {props.isWizard ? null : 
          <Paper elevation={2}>
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
          </Paper> }
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreClose} variant="contained" color="error">Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
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
            if (whichControl.startsWith("Button") || whichControl.startsWith("Color")) {
              const labelText = formJson.labelValues;
              if (text == null || text.length < 1) {
                setDialogResult(whichControl.startsWith("Color") ? "|" + labelText : labelText);
                setFormDataFields(whichControl.startsWith("Color") ? "|" + labelText : labelText, 'values');
              } else {
                setDialogResult(text + "|" + labelText)
                setFormDataFields(text + "|" + labelText, 'values');               
              }
            } else {
              const textArr = text.split(/\r?\n/);
              if (textArr.length < 1) {
                setDialogResult(text);
                setFormDataFields(text, 'values');
              } else {
                if (textArr.length == 1) {
                  setDialogResult(textArr[0]);
                  setFormDataFields(textArr[0], 'values');
                } else {
                  var newText = textArr[0];
                  for (var i = 1; i < textArr.length; i++) {
                    newText = newText + "|" + textArr[i];
                  }
                  setDialogResult(newText);
                  setFormDataFields(newText, 'values');
                }
              }
            }
            handleClose();
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
          <Button onClick={handleClose} variant="contained" color="error">Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openSetup}
        fullWidth
        keepMounted
        maxWidth='lg'
        onClose={handleOnCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {props.name} Template Questions
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
      <Container>
        <div>
          {isAlert &&  <Alert severity={theSeverity} onClose={handleOnAlert}>
            {alertMessage}
          </Alert>}
          <Box sx={{ bgcolor: '#C6DEFF', width: '600px', height: '520px', float: 'left', 
              borderStyle: 'solid', borderWidth: '2px' }} >
            <h3>Add Questions/Controls: 
              <ButtonGroup variant="contained" aria-label="Question Input group" 
                sx={{ float: 'right'}}>
                <Button variant="contained" color="success" onClick={handleOnNew}>Add Wizard</Button>
                <Button variant="contained" color="success" onClick={handleOnSave}>Save</Button>
              </ButtonGroup>
            </h3>
            <FormControl>
              <Stack direction="row" spacing={2}>
                <Box>
                  <RadioGroup
                    aria-labelledby="question-group-label"
                    defaultValue="photo"
                    value={formData.questionType}
                    name="questionType" >
                      {props.isWizard ? 
                      <Paper elevation={3}>
                        <Typography variant="h6" alignContent="center">Step 1: Select Control</Typography>
                        <Tooltip title="Select this to input a photo" placement="top">
                        <FormControlLabel value="photo"
                          control={(formData.questionType=="photo") ? <Radio checked="true" size="small"/> : <Radio size="small"/>} 
                          label="Add a Photo" 
                          onClick={handlePhotoClick} onChange={handleChange}/></Tooltip>
                        <Stack direction="column" spacing={3}>
                          <Paper elevation={3}>
                            <Typography variant="caption">Single Input Controls</Typography>
                            <Tooltip title="Select this to input a dropdown for a single input" placement="right">
                            <FormControlLabel value="dropdown" 
                              control={(formData.questionType=="dropdown") ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                              label="Add a Dropdown of Values" 
                              onClick={handleDropDownClick} onChange={handleChange}/></Tooltip>
                            <Tooltip title="Select this for a toggle button" placement="right">
                            <FormControlLabel value="toggle_button" 
                              control={formData.questionType=="toggle_button" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                              label="Add a List of Buttons" 
                              onClick={handleToggleButtonClick} onChange={handleChange}/></Tooltip>
                          </Paper>
                          <Paper elevation={3}>
                            <Typography variant="caption">Multiple Input Controls</Typography>
                            <Tooltip title="Select this to input a dropdown for multiple inputs" placement="right">
                            <FormControlLabel value="multiple_dropdown" 
                              control={formData.questionType=="multiple_dropdown" ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                              label="Add a Dropdown for multiple selections" onClick={handleDropDownClick} onChange={handleChange}/></Tooltip>
                            <Tooltip title="Select this for a multi-select toggle button" placement="right">
                            <FormControlLabel value="checkbox_button" 
                              control={formData.questionType=="checkbox_button" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                              label="Add a List of Buttons with multiple selections" 
                              onClick={handleToggleButtonClick} onChange={handleChange}/></Tooltip>
                          </Paper>
                        </Stack>
                      </Paper>
                      :
                      <Box>
                        <Tooltip title="Select this to input a photo" placement="top">
                        <FormControlLabel value="photo"
                          control={(formData.questionType=="photo") ? <Radio checked="true" size="small"/> : <Radio size="small"/>} 
                          label="Photo" 
                          onClick={handlePhotoClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input a dropdown for a single input" placement="right">
                        <FormControlLabel value="dropdown" 
                          control={(formData.questionType=="dropdown") ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                          label="Dropdown" 
                          onClick={handleDropDownClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input a dropdown for multiple inputs" placement="right">
                        <FormControlLabel value="multiple_dropdown" 
                          control={formData.questionType=="multiple_dropdown" ? <Radio checked="true" size="small"/> : <Radio size="small" />} 
                          label="Multiple Dropdown" onClick={handleDropDownClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input radio boxes for different input" placement="right">
                        <FormControlLabel value="radiobox" 
                          control={formData.questionType=="radiobox" ? <Radio checked="true"  size="small"/> : <Radio  size="small"/>} 
                          label="Radio" 
                          onClick={handleRadioClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input an input box for data" placement="right">
                        <FormControlLabel value="input" 
                          control={formData.questionType=="input" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                          label="Input" 
                          onClick={handleInputClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input text input for data" placement="right">
                        <FormControlLabel value="text" 
                          control={formData.questionType=="text" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                          label="Text" 
                          onClick={handleTextClick} onChange={handleChange}/></Tooltip>
                        <Tooltip title="Select this to input date data" placement="right">
                        <FormControlLabel value="datepicker" 
                          control={formData.questionType=="datepicker" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
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
                        <Stack direction="row">
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
                        </Stack>
                        <Stack direction="row">
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
                        </Stack>
                      </Box> }
                  </RadioGroup>
                </Box>
                <Paper elevation={3}>
                  {props.isWizard ?
                  <Typography variant="h6" alignContent="center">Step 2: Enter Details</Typography>
                   : null}
                  <Tooltip title="Enter here a title of what this question is about." placement="top">
                  <TextField id="question_title" name="title" value={formData.title} 
                    label="Question Title" variant="outlined" required="true" size="small" 
                    sx={{ width: '250px'}} onChange={handleChange}/></Tooltip>
                  <FormLabel id="filler1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</FormLabel>
                  {props.isWizard && formData.questionOrder > 0 && !isUpdate ? null
                   :
                  <Tooltip title="Enter here the order of this question relative to others." placement="right">
                  <TextField id="question_order" name="questionOrder" value={formData.questionOrder} 
                    label="Order" variant="outlined" size="small" 
                    sx={{ width: '80px' }} required="true" onChange={handleChange}/></Tooltip> }
                  <br />
                  {props.isWizard ? null :
                  <Tooltip title="Enter here a fuller description of what this question is for and about." placement="right">
                  <TextField id="question_desc" name="description" value={formData.description} 
                    label="Description" variant="outlined" size="small" multiline
                    maxRows={4} sx={{ width: "350px"}} onChange={handleChange}/></Tooltip> }
                  <br />
                  {props.isWizard ? 
                  <Box>
                    <Tooltip title="Enter here any special HTML formatting, or text you want processed BEFORE control is rendered." placement="right">
                    <TextField id="question_pre" name="preLoadAttributes" value={formData.preLoadAttributes} 
                      label="Enter any label before your control" variant="outlined" size="small" multiline
                      maxRows={4} sx={{ width: "350px"}} 
                      onClick={handleClickOpenPre} onChange={handleChange}/></Tooltip>
                    <br />  
                    <Tooltip title="Enter here control values (ie. dropdown or radio values)." placement="right">
                    <TextField id="question_values" name="questionValues" value={formData.questionValues} 
                      label="dropdown/button list values" 
                      disabled={isValuesDisabled} variant="outlined" size="small" multiline
                      maxRows={4} sx={{ width: "350px"}} onClick={handleClickOpen} onChange={handleChange}/></Tooltip>   
                    <br />
                  </Box>
                  :
                  <Box>
                    <Tooltip title="Enter here any special HTML formatting, or text you want processed BEFORE control is rendered." placement="right">
                    <TextField id="question_pre" name="preLoadAttributes" value={formData.preLoadAttributes} 
                      label="control pre-attributes i.e. label" variant="outlined" size="small" multiline
                      maxRows={4} sx={{ width: "350px"}} 
                      onClick={handleClickOpenPre} onChange={handleChange}/></Tooltip>
                    <br />  
                    <Tooltip title="Enter here any special HTML formatting, or text you want processed AFTER control is rendered." placement="right">    
                    <TextField id="question_post" name="postLoadAttributes" value={formData.postLoadAttributes} 
                      label="control post attributes (optional)" variant="outlined" size="small" multiline
                      maxRows={4} sx={{ width: "350px"}} onChange={handleChange}/></Tooltip> 
                    <br /><br />
                    <Tooltip title="Enter here control values (ie. dropdown or radio values)." placement="right">
                    <TextField id="question_values" name="questionValues" value={formData.questionValues} 
                      label="dropdown/button list values" 
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
                  </Box> }               
                </Paper>
              </Stack>
            </FormControl>
          </Box>
          <Box sx={{ bgcolor: '#52B2BF', width: '500px', height: '500px', marginLeft: '620px',
              borderStyle: 'solid', borderWidth: '2px'}} >
            <h3>{(props.name.length > 18) ? props.name.substring(0, 18) + "... Questions" : props.name + " Questions"}
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
      </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOnCancel} autoFocus variant="contained" color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}