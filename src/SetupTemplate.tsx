// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
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
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  MRT_TableContainer,
  MRT_RowSelectionState
} from 'material-react-table';
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
import DisplayQuestion from "../src/DisplayQuestion";
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import PopupReview from "../src/PopupPreview";
import MoveUpIcon from '@mui/icons-material/MoveUp';
import { min } from "moment";
import { IconButton } from "@mui/material";
import { HexColorPicker } from 'react-colorful';
import { cleanUpTextArray, countNumOfTabs, setTitle, setLabel } from '../src/utils.js';

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
  const [isFirst, setIsFirst] = useState(true);
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [page, setPage] = useState(1);
  const [openPreAttributes, setOpenPreAttributes] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [whichControl, setWhichControl] = useState('');
  const [dialogResult, setDialogResult] = useState('');
  const [dialogPrompt, setDialogPrompt] = useState('');
  const [isDeleteActive, setIsDeleteActive] = useState(false);
  const [dialogControls, setDialogControls] = useState({});
  const [isWizard, setIsWizard] = useState(false);
  const [openSetup, setOpenSetup] = useState(true);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isValueFocus, setIsValueFocus] = useState(false);
  const [sortDirection, setSortDirection] = useState('none');
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [openCancel, setOpenCancel] = useState(false);
  const [isAnyChanges, setIsAnyChanges] = useState(false);
  const [color, setColor] = useState ("#b32aa9");

  const handleClickOpen = () => {
    if (formData.questionValues == '') {
      setDialogPrompt('');
    } else {
      if (whichControl.startsWith("Button") || whichControl.startsWith("Color")) {
        setDialogPrompt(formData.questionValues);
        const textArr = formData.questionValues.split("|");
        if (textArr.length > 1) {
          setColor(textArr[0]);
        }
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

  const handleButtonAttributeClick = () => {
    setDialogPrompt(formData.questionValues);
    const textArr = formData.questionValues.split("|");
    if (textArr.length > 1) {
      setColor(textArr[0]);
    }
    setOpen(true);
  }

  const handleClose = (event: object, reason: string) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      return;
    }
    setOpen(false);
  };

  const handleCloseNow = () => {
    setOpen(false);
  }

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

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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

  const getQuestionsByTemplate = async (tempId, isAdd) => {
    if (props.isWizard) {
      setTemplateQuestion(props.templateQuestions);
      resetQuestionsRefresh(props.templateQuestions == [] ? 1 : props.templateQuestions.length + 1, props.templateQuestions);
      setFiltered(props.templateQuestions.filter(comp => !comp.question_type.includes('dialog_input')));
      return;
    }
    setIsWaiting(true);
    var nextOrder;
    const { data: items, errors } = await client.queries.listQuestionsByTemplateId({
      templateId: tempId
    });
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlert(true);
      setIsWaiting(false);
      return;
    }
    if (items.length < 1) {
      nextOrder = 1;
    } else {
      // get next order#
      nextOrder = items[items.length-1].question_order + 1;
    }
    setTemplateQuestion(items);
    setFiltered(items.filter(comp => !comp.question_type.includes('dialog_input')));
    resetQuestionsRefresh(nextOrder, items);
    if (isAdd) {
      setPage(items.length);
      setIsUpdate(false);
    }
    setIsWaiting(false);
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

  function resetQuestionsRefresh (questionOrder, items) {
    setFormData({
      id: '',
      templateId: props.template_id,
      questionOrder: questionOrder == null ? 0 : questionOrder,
      preLoadAttributes: setLabel("Please take a photo", items),
      title: setTitle("Photo", items),
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

  function resetQuestions (questionOrder) {
    setFormData({
      id: '',
      templateId: props.template_id,
      questionOrder: questionOrder == null ? 0 : questionOrder,
      preLoadAttributes: setLabel("Please take a photo", templateQuestion),
      title: setTitle("Photo", templateQuestion),
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

  const mapTemplateQuestions = (isUpdate, listToDelete) => {
    var newTemplateQuestion = [];
    for (var indx = 0; indx < templateQuestion.length; indx++) {
      if (listToDelete != null) {
        var foundIt = false;
        for (var i = 0; i < listToDelete.length; i++) {
          if (templateQuestion[indx].id == listToDelete[i].original.id) {
            // match
            foundIt = true;
            i = listToDelete.length;
          }
        }
        if (!foundIt) {
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
    if (!isUpdate && listToDelete == null) {
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
        notes: props.isWizard ? '' : 'new',
        trigger_value: formData.questionType == 'dialog_input' ? formData.questionValues : ''
      });
    }
    setTemplateQuestion(newTemplateQuestion);
    setPage(newTemplateQuestion.length);
    setFiltered(newTemplateQuestion.filter(comp => !comp.question_type.includes('dialog_input')));
    if (listToDelete != null) {
      resetQuestions(newTemplateQuestion.length);
    }
  }

  const updateQuestions = async() => {
    mapTemplateQuestions(true, null);
    setIsUpdate(false);
    setRowSelection({});
    setIsAnyChanges(true);

    setAlertMessage("Question " + formData.title + " Updated");
    setTheSeverity("success");
    setIsAlert(true);
  }

  const createQuestions = async() => {
    const now = new Date();
    const nextOrder = formData.questionOrder + 1;
    mapTemplateQuestions(false, null);
    setAlertMessage("Question " + formData.title + " Added");
    setTheSeverity("success");
    setIsAlert(true);
    setIsAnyChanges(true);
    resetQuestions(nextOrder);
    setRowSelection({});
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

  const handleSaveAll = async() => {
    if (props.isWizard || !isAnyChanges) {
      setOpenSetup(false);
      props.onSubmitChange(
        props.isWizard ?
          templateQuestion
        : false
      );
      return;
    }
    setIsWaiting(true);
    // first delete all existing questions...then add new ones
    try {
      await client.mutations.deleteQuestionByTemplateId({
        templateId: props.templateId
      });
    } catch (errors) {
      setAlertMessage("Cant delete App questions.  " + errors );
      setIsAlert(true);
      setIsWaiting(false);
      return;
    }

    const now = new Date();
    const currentDateTime = now.toLocaleString();
    for (var indx = 0; indx < templateQuestion.length; indx++) {
      const { errors: createErrors, data: newQuestions } = await client.models.template_question.create({
        id: templateQuestion[indx].id == null ? uuidv4() : templateQuestion[indx].id,
        template_id: props.templateId,
        question_order: indx,
        pre_load_attributes: templateQuestion[indx].pre_load_attributes,
        title: templateQuestion[indx].title,
        description: templateQuestion[indx].description,
        question_type: templateQuestion[indx].question_type,
        question_values: templateQuestion[indx].question_values,
        post_load_attributes: templateQuestion[indx].post_load_attributes,
        optional_flag: (!templateQuestion[indx].optional_flag ? 0 : 1),
        notes: '',
        created: now,
        created_by: props.userId,
        trigger_value: templateQuestion[indx].question_type == 'dialog_input' ? templateQuestion[indx].question_values : ''
      });
      if (createErrors) {
        setAlertMessage(createErrors[0].message);
        setIsAlert(true);
        setIsWaiting(false);
        return;
      }
    }
    setIsWaiting(false);
    setOpenSetup(false);
    props.onSubmitChange(
      props.isWizard ?
        templateQuestion
      : false
    );
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
      const filterTitle = templateQuestion.filter(comp => comp.title == formData.title);
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
  
  function setDefaultText (proposedTitle, proposedLabel) {
    setFormData({
      id: formData.id,
      templateId: formData.templateId,
      questionOrder: formData.questionOrder,
      preLoadAttributes: setLabel(proposedLabel, templateQuestion),
      title: setTitle(proposedTitle, templateQuestion),
      description: formData.description,
      questionType: formData.questionType,
      questionValues: formData.questionValues,
      postLoadAttributes: formData.postLoadAttributes,
      optionalFlag: formData.optionalFlag,
      actionsFlag: formData.actionsFlag,
      notes: '',
      triggerValue: '',
    });
  }

  const handlePhotoClick = () => {
    setIsValuesDisabled(true);
    setWhichControl('');
    setDefaultText("Photo", "Please take a photo");
  }

  const handleDropDownClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Dropdown');
    setDefaultText("Dropdown", "Please select from one of options below");
  }

  const handleMultipleDropDownClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Dropdown');
    setDefaultText("Dropdown Multiple", "Please select one or more options below");
  }

  const handleRadioClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('RadioGroup');
    setDefaultText("Radio", "Please select from one of options below");
  }

  const handleInputClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Default Input Value');
    setDefaultText("Input", "Input");
  }

  const handleTextClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Text value');
    setDefaultText("Text", "Text Value");
  }

  const handleDateClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('');
    setDefaultText("Date", "Please select date");
  }

  const handleButtonClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Button label');
    setDefaultText("Button", "Select Option");
  }

  const handleToggleButtonClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Toggle Button labels');
    setDefaultText("List", "Please select from one of options below");
  }

  const handleMultipleToggleButtonClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Toggle Button labels');
    setDefaultText("List", "Please select one or more options below");
  }

  const handleDialogInputClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Dialog Input');
    setDefaultText("Dialog", "Enter");
  }

  const handleColorButtonClick = () => {
    setIsValuesDisabled(false);
    setWhichControl('Color Button label');
    setDefaultText("Color-Button", "Select Option");
  }

  const handleSwitchClick = () => {
    setIsValuesDisabled(true);
    setWhichControl('Switch');
    setDefaultText("Switch", "Select Option");
  }

  function handleDelete () {
    setOpenDelete(false);
    setIsAnyChanges(true);
    const theRows = table.getSelectedRowModel().rows;
    mapTemplateQuestions(false, theRows);
    setIsUpdate(false);
    setRowSelection({});
  }

  function handleRowClick (params, event, details) {
  }

  function handleRowSelection (newSelectedRows) {
    setRowSelection(newSelectedRows);
  }

  function checkRowSelections (theSelectedRows) {
    if (theSelectedRows.length == 0) {
      setIsUpdate(false);
      resetQuestions(templateQuestion.length + 1);
      setPage(1);
    } else if (theSelectedRows.length < 2) {
      // update mode.
      var whichIndex = 0;
      const filteredId = templateQuestion.filter((comp, index) => {
        if (comp.id.includes(theSelectedRows[0].original.id)) {
          whichIndex = index;
          return true;
        }
        return false;
      });
      if (filteredId.length == 1 ) {
        setPage(whichIndex+1);
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
      setIsUpdate(false);
      resetQuestions(templateQuestion.length + 1);
      setPage(1);
      var rowIds = [];
      for (var i = 0; i < theSelectedRows.length; i++) {
        rowIds.push({ id: theSelectedRows[i].original.id});
      }
    }
  }

  const handleAdvanced = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAdvanced(event.target.checked);
  }

  useEffect(() => {
    if (isFirst) {
      getQuestionsByTemplate(props.templateId, false);
      setIsFirst(false);
    } else {
      const stuff = table.getState().rowSelection;
      const selectedRows = table.getSelectedRowModel().rows;
      if (Object.keys(stuff).length === 0) {
        setIsDeleteActive(false)
      } else {
        setIsDeleteActive(true);
      }
      checkRowSelections(table.getSelectedRowModel().rows);
    }
  }, [rowSelection]);

  const columns = useMemo<MRT_ColumnDef<Schema["template_question"]["type"][]>>(
    () => [
      {
        accessorKey: 'title',
        header: 'Question',
        size: 130,
      },
      {
        accessorKey: 'question_type',
        header: 'Type',
        size: 130,
      }
    ],
    [],
  );

  const handleShuffleUp = (row: MRT_Row) => {
    if (row.index == 0) {
      return;
    }
    setIsAnyChanges(true);
    var newTemplateQuestion = [];
    const swapFrom = row.index;
    const swapTo = row.index - 1;
    for (var indx = 0; indx < templateQuestion.length; indx++) {
      if (indx == swapFrom || indx == swapTo) {
        if (indx == swapTo) {
          newTemplateQuestion.push({
            id: templateQuestion[swapFrom].id,
            question_order: templateQuestion[swapFrom].question_order,
            pre_load_attributes: templateQuestion[swapFrom].pre_load_attributes,   
            title: templateQuestion[swapFrom].title,
            description: templateQuestion[swapFrom].description,
            question_type: templateQuestion[swapFrom].question_type,
            question_values: templateQuestion[swapFrom].question_values,
            post_load_attributes: templateQuestion[swapFrom].post_load_attributes,
            optional_flag: templateQuestion[swapFrom].optional_flag,
            trigger_value: templateQuestion[swapFrom].trigger_value   
          }); 
          newTemplateQuestion.push({
            id: templateQuestion[swapTo].id,
            question_order: templateQuestion[swapTo].question_order,
            pre_load_attributes: templateQuestion[swapTo].pre_load_attributes,   
            title: templateQuestion[swapTo].title,
            description: templateQuestion[swapTo].description,
            question_type: templateQuestion[swapTo].question_type,
            question_values: templateQuestion[swapTo].question_values,
            post_load_attributes: templateQuestion[swapTo].post_load_attributes,
            optional_flag: templateQuestion[swapTo].optional_flag,
            trigger_value: templateQuestion[swapTo].trigger_value   
          }); 
        }
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
    setTemplateQuestion(newTemplateQuestion);
  }

  const table = useMaterialReactTable({
    columns,
    data: templateQuestion,
    enableFullScreenToggle: false,
    autoResetPageIndex: false,
    enableRowOrdering: true,
    enableRowNumbers: true,
    rowNumberDisplayMode: 'static',
    enableSorting: false,
    enableDensityToggle: false,
    density: 'compact',
    muiPaginationProps: {
      color: 'primary',
      shape: 'rounded',
      showRowsPerPage: false,
      variant: 'outlined',
    },
    paginationDisplayMode: 'pages',
    enableSelectAll: false,
    enableRowSelection: true,
    enableRowActions: true,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: '', //change header text
        size: 50, //make actions column wider
      },
      'mrt-row-select' : {
        header: '',
        size: 30,
      },
      'mrt-row-drag' : {
        header: '',
        size: 30,
      }
    },
    renderRowActions: ({ row }) => (
      <Box>
        <Tooltip title="Will move question up, swapping positions" placement="top">
          <IconButton disabled={row.index == 0} onClick={() => handleShuffleUp(row)}><MoveUpIcon /></IconButton>
        </Tooltip>
      </Box>
    ),
    positionActionsColumn: 'last',
    enableBatchRowSelection: true,
    muiSelectCheckboxProps: { color: 'secondary'},
    initialState: { pagination: { pageSize: 6, pageIndex: 0,}, density: 'compact'},
    onRowSelectionChange: handleRowSelection,
    state: { rowSelection },
    renderTopToolbarCustomActions: ({ table }) => (
      <ButtonGroup variant="contained" aria-label="Action button group">
        <Button disabled={!isDeleteActive} color="error"
          onClick={() => {
            setOpenDelete(true);
          }}
        >
          Delete
        </Button>
      </ButtonGroup>
    ),
    muiRowDragHandleProps: ({ table }) => ({
      onDragEnd: () => {
        const { draggingRow, hoveredRow } = table.getState();
        if (hoveredRow && draggingRow) {
          templateQuestion.splice(
            (hoveredRow as MRT_Row<["template_question"]["type"][]>).index, 0, templateQuestion.splice(draggingRow.index, 1)[0],);
          setIsAnyChanges(true);
          setTemplateQuestion([...templateQuestion]);
        }
        }
    }),
  });

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

  const handleSort = (e) => {
    if (e.target.checked) {
      setSortDirection('ascending');
    } else {
      setSortDirection('none');
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

  function createMarkup(dirty) {
    return { __html: dirty };
  }

  const handleCloseDelete = (event: object, reason: string) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      return;
    }
		setOpenDelete(false);
	};

  const handleCloseCancel = (event: object, reason: string) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      return;
    }
		setOpenCancel(false);
	};

  const handleCloseThrow = (event: object, reason: string) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      return;
    }
		setOpenCancel(false);
    setOpenSetup(false);
    props.onSubmitChange(
      props.isWizard ?
      props.templateQuestions
      : false
    );
	};

  const confirmDelete = () => {
    setOpenDelete(true);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      {isWizard && <SetupQuestion props={props} isWizard={props.isWizard}
        onSubmitChange={newQuestionSubmit} 
        nextOrder={templateQuestion ? templateQuestion.length+1 : 1}
      />}
      <Dialog
        open={openDelete}
        onClose={handleCloseDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are You Sure?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this question?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
			    <Button variant='contained' color='success' onClick={handleDelete}>Delete</Button>
          <Button variant='contained' color='error' onClick={handleCloseDelete} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openCancel}
        onClose={handleCloseCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are You Sure?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to cancel any changes you made?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
			    <Button variant='contained' color='success' onClick={handleCloseThrow}>Yes</Button>
          <Button variant='contained' color='error' onClick={handleCloseCancel} autoFocus>Cancel</Button>
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
                  const cleanedTextArr = cleanUpTextArray(textArr);
                  const textArray = (sortDirection == 'none') ? cleanedTextArr : cleanedTextArr.sort();
                  var newText = textArray[0];
                  for (var i = 1; i < textArray.length; i++) {
                    newText = newText + "|" + textArray[i];
                  }
                  setDialogResult(newText);
                  setFormDataFields(newText, 'values');
                  setSortDirection('none');
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
          {whichControl.startsWith("Color") ?
            <Stack direction="column" spacing={2}>
              <HexColorPicker color={color} onChange={setColor} />
              <TextField
                autoFocus 
                value={color}
                disabled = {whichControl.startsWith("Button")}
                margin="dense"
                id="name"
                name="textValues"
                label="Color"
              />
            </Stack>
          : whichControl.startsWith("Button") ? null :
          <Stack direction="row" spacing={2}>
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
            />
            <FormControlLabel control={<Checkbox onClick={handleSort} />} label="Sort(asc)" />
          </Stack> }
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
        maxWidth='xl'
        onClose={handleOnCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {props.name} Logging App Questions
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          {isAlert &&  <Alert severity={theSeverity} onClose={handleOnAlert}>{alertMessage}</Alert>}  
          {isWaiting && <CircularProgress />}
            {props.isWizard ?
            <Typography variant="body1">NOTE:  In this step you will be adding the questions that your end user will complete for you.</Typography> : null }
            <Stack direction="row" spacing={3}>      
          <Box sx={{ bgcolor: '#C6DEFF', width: '600px', height: '540px', 
              borderStyle: 'solid', borderWidth: '2px' }} >
            <h4>Add Questions/Controls: <br/>
            {props.isWizard ? null :
            <FormControlLabel control={<Checkbox checked={isAdvanced} onChange={handleAdvanced} inputProps={{ 'aria-label' : 'controlled'}} />} label="Show Advanced Controls" /> }
            {props.isWizard ? null :
              <Button variant="contained" color="success" onClick={handleOnNew}>Add Wizard</Button> }
            </h4>
            <FormControl>
              <Stack direction="row" spacing={2}>
                <Box sx={{ width: '200px'}}>
                  <RadioGroup
                    aria-labelledby="question-group-label"
                    defaultValue="photo"
                    value={formData.questionType}
                    name="questionType" >
                      {props.isWizard || !isAdvanced ? 
                      <Paper elevation={3}>
                        <Tooltip title="Select a Control here.   A control is the type of input you want your user to use." placement="top">
                        <Typography variant="h6" alignContent="center">Step 1: Select Control</Typography>
                        </Tooltip>
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
                              label="Add a Dropdown for multiple selections" onClick={handleMultipleDropDownClick} onChange={handleChange}/></Tooltip>
                            <Tooltip title="Select this for a multi-select toggle button" placement="right">
                            <FormControlLabel value="checkbox_button" 
                              control={formData.questionType=="checkbox_button" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                              label="Add a List of Buttons with multiple selections" 
                              onClick={handleMultipleToggleButtonClick} onChange={handleChange}/></Tooltip>
                          </Paper>
                        </Stack>
                      </Paper>
                      :
                      <Box>
                        <Tooltip title="Select this to input radio boxes for different input" placement="right">
                        <FormControlLabel value="radiobox" 
                          control={formData.questionType=="radiobox" ? <Radio checked="true"  size="small"/> : <Radio  size="small"/>} 
                          label="Radio" 
                          onClick={handleRadioClick} onChange={handleChange}/></Tooltip><br/>
                        <Tooltip title="Select this to input text input for data" placement="right">
                        <FormControlLabel value="text" 
                          control={formData.questionType=="text" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                          label="Input/Text" 
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
                          <Tooltip title="Select this for a switch" placement="right">
                          <FormControlLabel value="switch" 
                            control={formData.questionType=="switch" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                            label="Switch" 
                            onClick={handleSwitchClick} onChange={handleChange}/></Tooltip>
                          <Tooltip title="Select this for a dialog input (triggered by previous question)" placement="right">
                          <FormControlLabel value="dialog_input" 
                            control={formData.questionType=="dialog_input" ? <Radio checked="true" size="small"/> : <Radio  size="small"/>} 
                            label="Dialog Input" 
                            onClick={handleDialogInputClick} onChange={handleChange}/></Tooltip>
                      </Box> }
                  </RadioGroup>
                </Box>
                <Paper elevation={3} >
                  {props.isWizard || !isAdvanced ?
                  <Typography variant="h6" alignContent="center">Step 2: Enter Details</Typography>
                   : null}
                  <Stack direction="row" spacing={3}>
                    <Tooltip title="Enter here a title of what this question is about." placement="top">
                      <TextField id="question_title" name="title" value={formData.title} 
                        label="Question Title" variant="outlined" required="true" size="small" 
                        sx={{ width: '200px'}} onChange={handleChange}/>
                    </Tooltip>
                    <Button variant="contained" color="success" 
                      disabled={(formData.title == '' && whichControl == '') ||
                        (whichControl == 'Dropdown' && (formData.title == '' || formData.questionValues == '' ) ||
                        (whichControl.startsWith('Toggle') && (formData.title == '' || formData.questionValues == '')))
                      } 
                      onClick={handleOnSave}>{isUpdate ? 'Update' : 'Add'}</Button>
                  </Stack>
                  <FormLabel id="filler1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</FormLabel>
                  <br />
                  {props.isWizard || !isAdvanced ? 
                  <Box>
                    <Tooltip 
                      title={props.isWizard ? "Enter instructions, label, or text you want before this control" : "Enter here any special HTML formatting, or text you want shown BEFORE control is rendered."}
                      placement="right">
                    <TextField id="question_pre" name="preLoadAttributes" value={formData.preLoadAttributes} 
                      label="Enter any instruction/label before your control" variant="outlined" size="small" multiline
                      maxRows={4} sx={{ width: "300px"}} 
                      onChange={handleChange}/></Tooltip>
                    <br />  <br /> 
                    {whichControl == '' ? null :
                      <Tooltip title="Click here to set values (ie. dropdown or radio values)." placement="right">
                        <Button variant="contained" disabled={isValuesDisabled} color="primary" onClick={handleClickOpen}>Set Values</Button>
                      </Tooltip>  }
                      {formData.questionValues == '' ? null :
                      <Stack direction="column" spacing={0}>
                        <br />
                        <TextField id="question_values" name="questionValues" value={formData.questionValues.split("|")} 
                          label="dropdown/button list values" 
                          slotProps={{
                            input: {
                              readOnly: true,
                            },
                          }}
                          disabled={isValuesDisabled} variant="filled" size="small" multiline
                          maxRows={4} />
                      </Stack>
                      }  
                  </Box>
                  :
                  <Box>
                    <Tooltip title="Enter here any special HTML formatting, or text you want (i.e. label) BEFORE control is rendered." placement="right">
                    <TextField id="question_pre" name="preLoadAttributes" value={formData.preLoadAttributes} 
                      label="label" variant="outlined" size="small" multiline
                      maxRows={4} sx={{ width: "350px"}} 
                      onChange={handleChange}/></Tooltip>
                    <br /> <br />  
                    {(whichControl.startsWith("Button") || whichControl.startsWith("Color")) ?
                      <Tooltip title="Click here to set button attribues, like color and button label." placement="right">
                        <Button variant="contained" color="primary" onClick={handleButtonAttributeClick}>Set Button Values</Button>
                      </Tooltip> 
                    : whichControl == "Dropdown" || whichControl == "Multiple Dropdown" || whichControl == "RadioGroup" || whichControl.startsWith("Toggle") ?
                      <Tooltip title="Click here to set values (ie. dropdown or radio values)." placement="right">
                        <Button variant="contained" disabled={isValuesDisabled} color="primary" onClick={handleClickOpen}>Set Values</Button>
                      </Tooltip>  
                    : whichControl == "Default Input Value" || whichControl == "Text value" ? null 
                    : whichControl.startsWith("Dialog") ?
                    <Tooltip title="Click here to enter trigger value for a Dialog box on prior control." placement="right">
                      <Button variant="contained" disabled={isValuesDisabled} color="primary" onClick={handleClickOpen}>Set Trigger</Button>
                    </Tooltip>  
                    : whichControl == ''  || whichControl == 'Switch' ? null : 
                    <Tooltip title="Enter here control values (ie. dropdown or radio values)." placement="right">
                      <TextField id="question_values" name="questionValues" value={formData.questionValues} 
                        label="dropdown/button list values" 
                        disabled={isValuesDisabled} variant="outlined" size="small" multiline
                        maxRows={4} sx={{ width: "350px"}}  onChange={handleChange}/>
                    </Tooltip>  } 
                    {formData.questionValues == '' ? null :
                      <Stack direction="column" spacing={0}>
                        <br />
                        <TextField id="question_values" name="questionValues" value={formData.questionValues.split("|")} 
                          label="dropdown/button list values" 
                          slotProps={{
                            input: {
                              readOnly: true,
                            },
                          }}
                          disabled={isValuesDisabled} variant="filled" size="small" multiline
                          maxRows={4} />
                      </Stack>
                      }  
                  </Box> }               
                </Paper>
              </Stack>
            </FormControl>
          </Box>
          <Box sx={{ bgcolor: '#52B2BF', width: '450px', height: '545px', 
              borderStyle: 'solid', borderWidth: '2px'}} >
            <h3>{(props.name.length > 18) ? props.name.substring(0, 30) + "... Questions" : props.name + " Questions"}</h3>
             <Paper sx={{ height: 400, width: '100%' }}>
              <MaterialReactTable table={table} muiToolbarAlertBannerProps={{
                  color: 'info'
                }} positionToolbarAlertBanner="head-overlay" renderToolbarAlertBannerContent={({
                  selectedAlert,
                  table
                }) => <Typography variant="caption">{selectedAlert}</Typography>} />
            </Paper>
          </Box>
          <Box sx={{  width: '400px' }}>
            <Typography variant="caption">Preview (This is a preview of what your app will look like on phone)</Typography>
            <div className="startPreview" dangerouslySetInnerHTML={createMarkup(props.preLoadAttributes)} /><br/><br/><br/>
            {templateQuestion == null || templateQuestion.length == 0 ?
              <Typography variant="h4">No Preview Available</Typography>
            :
              <Stack spacing={2}>
                <Typography variant="h6">
                  {props.name}
                </Typography>
                <Box component="section" sx={{ p: 2, border: '1px dashed grey'}}>
                  <Stack direction="row" spacing={1} >
                    <Paper elevation={0}>
                      <DisplayQuestion props={props} question = {templateQuestion[page-1]}  useBox={false}  useSpacing={false} isPreview = {true}/>
                    </Paper>
                    <Paper elevation={0}>
                      <Typography variant="caption" gutterBottom>{"<---" + templateQuestion[page-1].title}</Typography>
                    </Paper>
                  </Stack>
                </Box>
                <Pagination count={templateQuestion.length} 
                  page={page} 
                  onChange={handlePageChange} 
                  showFirstButton 
                  showLastButton
                  color="primary"
                />
              </Stack>       }     
          </Box>
        </Stack>
      </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveAll} autoFocus variant="contained" color="primary">Save</Button>
          <Button onClick={() => isAnyChanges ? setOpenCancel(true) : handleOnCancel()} autoFocus variant="contained" color="error">Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}