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
import SetupQuestion from "../src/SetupQuestion";
import BuildIcon from '@mui/icons-material/Build';
import { IconButton } from "@mui/material";
import ConfirmPassword from "../src/ConfirmPassword";
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function PopupWelcome(props) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState(true);
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  const [isWizard, setIsWizard] = useState(false);
  const [textType, setTextType] = useState('password');
  const [confirm, setConfirm] = useState(false);
  const [password, setPassword] = useState('');

  const client = generateClient<Schema>();
  const steps = ['Select your Profile', 'Build a Template', 'Setup Users for that Template'];
  const descriptions = ['The first step is to create for you a profile.   This profile will identify the main email address and contact information. ' +
    'Normally, this profile information is your company, personal contact information', 'Step 2 is to create a template of an application to collect your data that you want captured.  ' +
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
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
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
    setActiveStep(0);
  };

  const handleChange = (event: SelectChangeEvent) => {
    setSelectDivision(event.target.value as string);
  };

  const handleChangeBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  useEffect(() => {
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

  const handleTemplateWizard = () => {
    setIsWizard(true);
  }

  const handleStateOnChange = (v) => {
  }

  function newQuestionSubmit (e) {
    setIsWizard(false);
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

  return (
    <Dialog
      open={open}
      onClose={handleCloseValues}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const title = formJson.title;
          const description = formJson.description;
          const liveDate = formJson.liveDate;
          const prodDate = formJson.prodDate;
          const notes = formJson.notes;
          const filterTitle = props.rows.filter(comp => comp.title == title);
          if (filterTitle != null && filterTitle.length > 0) {
            setError("Title " + title + " already exists.   Please choose another.");
            setOpenError(true);
            return false;
          }
          return handleAddRow(title, description, liveDate, prodDate, notes, checked);
        },
      }}
    >
    <DialogTitle>Welcome to logitNow.com!</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Lets walk you through setting up logitNow.com features.
        <br /><br />
      </DialogContentText>
      {openError &&  <Alert severity="error" onClose={handleCloseError}>
            {error}
          </Alert>}
      { isWizard && <SetupQuestion props={props} 
              isWizard={true}
              onSubmitChange={newQuestionSubmit} 
              nextOrder={1}
            />}
      {confirm && <ConfirmPassword props={props} password={password} onGoodPassword={handleGoodPassword} onBadPassword={handleBadPassword} />}
      <TextField
              margin="dense"
              required
              id="email"
              name="email"
              defaultValue={props.userId}
              label="Email Address"
              type="email"
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
                margin="dense"
                required
                id="name"
                name="name"
                label="Contact Name"
                type="text"
                fullWidth
                variant="standard"
              />
          </Box> : activeStep == 1 ? 
          <Box>
            <TextField
                autoFocus
                required
                margin="dense"
                id="title"
                name="title"
                label="Template Title"
                type="text"
                fullWidth
                variant="standard"
              />
            <TextField
                margin="dense"
                id="description"
                name="description"
                label="Description"
                type="text"
                fullWidth
                variant="standard"
              />
            <TextField
                margin="dense"
                id="notes2"
                name="notes2"
                label="Notes"
                type="text"
                fullWidth
                multiline
                maxRows={3}
                variant="standard"
              />
            <Button variant="contained" onClick={handleTemplateWizard} startIcon={<BuildIcon />}>Build App</Button>
          </Box>
          : activeStep == 2 ?
          <Box>
            <TextField
              autoFocus
              required
              margin="dense"
              id="email"
              name="email"
              label="User Email Address"
              type="email"
              fullWidth
              variant="standard"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                margin="dense"
                required
                id="password"
                name="password"
                label="Password"
                type={textType}
                fullWidth
                variant="standard"
                onBlur={handlePasswordConfirm}
              />
              <IconButton aria-label="show password" onClick={handlePasswordVisibility}><VisibilityIcon /></IconButton>
            </Stack>
            <TextField
              margin="dense"
              required
              id="firstName"
              name="firstName"
              label="First Name"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
                margin="dense"
                id="middleName"
                name="middleName"
                label="Middle Name"
                type="text"
                fullWidth
                variant="standard"
            />
            <TextField
              margin="dense"
              id="lastName"
              required
              name="lastName"
              label="Last Name"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
              margin="dense"
              id="notes"
              name="notes"
              label="Notes"
              type="text"
              fullWidth
              multiline
              maxRows={3}
              variant="standard"
            />    
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
  </DialogContent>
</Dialog>
  );
}