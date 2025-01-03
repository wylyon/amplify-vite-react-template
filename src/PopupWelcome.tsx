// @ts-nocheck
import React from "react";
import { useState, useEffect  } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from "@mui/material/Button";
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import { v4 as uuidv4 } from 'uuid';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { generateClient } from 'aws-amplify/data';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import SelectState from '../src/SelectState';
import SetupTemplate from '../src/SetupTemplate';
import PopupAddUsers from "../src/PopupAddUsers";
import BuildIcon from '@mui/icons-material/Build';
import { IconButton } from "@mui/material";
import ConfirmPassword from "../src/ConfirmPassword";
import VisibilityIcon from '@mui/icons-material/Visibility';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

export default function PopupWelcome(props) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [open, setOpen] = useState(true);
  const [openName, setOpenName] = useState(false);
  const [checked, setChecked] = useState(true);
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  const [isWizard, setIsWizard] = useState(false);
  const [isUserWizard, setIsUserWizard] = useState(false);
  const [textType, setTextType] = useState('password');
  const [confirm, setConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [prevent, setPrevent] = useState(false);
  const [num, setNum] = useState(0);
  const [numUsers, setNumUsers] = useState(0);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    templateName: '',
    templateDescription: '',
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

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const client = generateClient<Schema>();
  const steps = ['Select your Profile', 'Build a Template', 'Setup Users for that Template'];
  const descriptions = ['The first step is to complete your profile.   We have your email and company name.   Please give us a contact name', 'Step 2 is to create a template of an application to collect your data that you want captured.  ' +
    'This is an optional step, as you can also create this template later.',
    'Step 3 is define any users you want to run your application (template) and capture their data.   Please note, this wizard will automatically add your email to this template, ' +
    'so you would only need to add other contributors.  This is an optional step at this point, as you can create and assign users later once you have created a template.'];

  const isStepOptional = (step: number) => {
    return step === 2 || step === 1;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    setPrevent(false);
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setPrevent(false);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    setPrevent(false);
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setPrevent(false);
    setActiveStep(0);
  };

  const handleChange = (event: SelectChangeEvent) => {
    setSelectDivision(event.target.value as string);
  };

  const handleChangeBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  useEffect(() => {
    if (props.companyName === null || props.companyName === '') {
      setOpenName(true);
    } else {
      setName(props.companyName);
    }
	}, []);

  const handleCloseValues = () => {
    props.onClose();
    setOpen(false);
  }

  const handleSubmitValues = (item) => {
    props.onSubmit(item);
    setOpen(false);
  }

	const handleCloseError = () => {
		setOpenError(false);
		setError('');
	};

  function getDate(value) {
		if (value == null || value == '') {
			return null
		}
		return new Date(value);
	  }

  const handleAddRow = async(title, description, liveDate, prodDate, notes, isPagination) => {
		const now = new Date();
    setIsWaiting(true);
    const id = uuidv4();
		const { errors, data: item } = await client.models.template.create({
			id: id,
			division_id: selectDivision,
			title: title, 
			description: description,
			live_date: now.toISOString().slice(0, 10),
			prod_date: now.toISOString().slice(0, 10),
			notes: notes,
			created: now,
			created_by: 0,
			use_pagination: isPagination ? 1 : 0,
			auto_space: 1,
			box_controls: 0		
		});
		if (errors) {
      setIsWaiting(false);
			setError(errors[0].message);
			setOpenError(true);
      return false;
		}
    setIsWaiting(false);
    handleSubmitValues(item);
	}

  const handleTemplateWizard = (e) => {
    e.preventDefault();
    setPrevent(true);
    setIsWizard(true);
  }

  const handleUserWizard = (e) => {
    e.preventDefault();
    setPrevent(true);
    setIsUserWizard(true);
    setNumUsers(2);
  }

  const handleStateOnChange = (v) => {
  }

  function addedUsersClose (e) {
    setIsUserWizard(false);
  }

  function newQuestionSubmit (e) {
    setIsWizard(false);
    setNum(num + 1);
    setFormData({
      id: e.id,
      name: formData.name,
      templateName: formData.templateName,
      templateDescription: formData.templateDescription,
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
  }

  const handlePasswordVisibility = (event) => {
    setTextType(textType == 'password' ? 'text' : 'password');
  }

  const handlePasswordConfirm = (event) => {
    event.preventDefault();
    setPassword(event.target.value as string);
    setConfirm(true);
  }

  const handleGoodPassword = (event) => {
    event.preventDefault();
    setError('');
    setOpenError(false);
  }

  const handleBadPassword = (event) => {
    event.preventDefault();
    setError("Passwords don't match, please try again.")
    setOpenError(true);
  }

  const handleCloseName = () => {
    setOpenName(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <React.Fragment>
      <Dialog
        open={openName}
        onClose={handleCloseName}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            setName(formJson.name);
            handleCloseName();
          },
        }}
      >
        <DialogTitle>Need Name</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a company name or personal name
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Company (or Personal Name)"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseValues}>Cancel</Button>
          <Button type="submit">Ok</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open}
        onClose={handleCloseValues}
        fullScreen
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (prevent) {
              return;
            }
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const title = formJson.title;
            const description = formJson.description;
            const filterTitle = props.rows.filter(comp => comp.title == title);
            if (filterTitle != null && filterTitle.length > 0) {
              setError("Title " + title + " already exists.   Please choose another.");
              setOpenError(true);
              return false;
            }
//            return handleAddRow(title, description, liveDate, prodDate, notes, checked);
          },
        }}
      >
      <DialogTitle>Welcome to logit.pro!</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Lets walk you through setting up logit.pro and create your first data capture application (template)
          <br /><br />
        </DialogContentText>
        {openError &&  <Alert severity="error" onClose={handleCloseError}>
              {error}
            </Alert>}
        { isWizard && <SetupTemplate props={props} 
                isWizard={true}
                onSubmitChange={newQuestionSubmit} 
                onSubmitAdd={newQuestionSubmit}
                nextOrder={1}
                name={formData.templateName}
                templateId={formData.templateId}
                divisionId={props.divisionId}
                preLoadAttributes={''}
                postLoadAttributes={''}
                usePages={true}
              />}
        { isUserWizard && <PopupAddUsers props={props} onClose={addedUsersClose} />}
        {confirm && <ConfirmPassword props={props} password={password} onGoodPassword={handleGoodPassword} onBadPassword={handleBadPassword} />}
        <Stack direction="row" spacing={3}>
          <Paper elevation={3}>
            <TextField
                    margin="dense"
                    id="primary"
                    name="primary"
                    defaultValue={props.userId}
                    label="Primary Email Address"
                    type="email"
                    fullWidth
                    variant="standard"
                  />
            <TextField
                    margin="dense"
                    id="company"
                    name="company"
                    label="Company Name"
                    type="text"
                    value={name}
                    fullWidth
                    variant="standard"
                  />             
            <Box sx={{ width: '100%', border: '1px dashed grey' }}>
              <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                  const stepProps: { completed?: boolean } = {};
                  const labelProps: {
                    optional?: React.ReactNode;
                  } = {};
                  if (isStepOptional(index)) {
                    labelProps.optional = (
                      <Typography variant="caption">Optional</Typography>
                    );
                  }
                  if (isStepSkipped(index)) {
                    stepProps.completed = false;
                  }
                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
              {activeStep === steps.length ? (
              <React.Fragment>
                <Typography sx={{ mt: 2, mb: 1 }}>
                  All steps completed - you&apos;re finished
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Box sx={{ flex: '1 1 auto' }} />
                  <Button onClick={handleReset}>Reset</Button>
                </Box>
              </React.Fragment>
              ) : (
              <React.Fragment>
                <Typography sx={{ mt: 2, mb: 1 }}>{descriptions[activeStep]}</Typography>
                {activeStep == 0 ?
                <Box>
                  <TextField
                      autoFocus
                      margin="dense"
                      required
                      id="name"
                      name="name"
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                      label="Contact Name"
                      type="text"
                      value={formData.name}
                      onChange={handleFormChange}
                      fullWidth
                      variant="standard"
                    />
                </Box> : activeStep == 1 ? 
                <Box>
                  <TextField
                      autoFocus
                      required
                      margin="dense"
                      id="templateName"
                      name="templateName"
                      label="Template Title"
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                      type="text"
                      value={formData.templateName}
                      onChange={handleFormChange}
                      fullWidth
                      variant="standard"
                    />
                  <TextField
                      margin="dense"
                      id="templateDescription"
                      name="templateDescription"
                      label="Description"
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                      type="text"
                      onChange={handleFormChange}
                      value={formData.templateDescription}
                      fullWidth
                      variant="standard"
                    />
                    <Badge badgeContent={num} color="primary">
                      <Button variant="contained" onClick={handleTemplateWizard} startIcon={<BuildIcon />}>Build App</Button>
                  </Badge>
                </Box>
                : activeStep == 2 ?
                <Box>
                  <Badge badgeContent={numUsers} color="primary">
                    <Button variant="contained" onClick={handleUserWizard} startIcon={<PersonAddAltIcon />}>Add Users</Button> 
                  </Badge>
                </Box>
                : null
                }
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Button
                    color="inherit"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  <Box sx={{ flex: '1 1 auto' }} />
                  {isStepOptional(activeStep) && (
                    <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                      Skip
                    </Button>
                  )}
                  <Button onClick={handleNext}>
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </Box>
              </React.Fragment>
            )}
          </Box>
        </Paper>
        <Paper elevation={3}>
          <Box sx={{ width: '400px' }}>
            <Typography variant="caption">Preview</Typography>
          </Box>
        </Paper>
      </Stack>
    </DialogContent>
  </Dialog>
</React.Fragment>
  );
}