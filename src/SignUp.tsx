
// @ts-nocheck
import React, { FormEvent } from "react";
import { useState, useEffect  } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import { Amplify } from "aws-amplify"
import { signUp } from "aws-amplify/auth";
import outputs from "../amplify_outputs.json";
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

interface SignUpFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
}

interface SignUpForm extends HTMLFormElement {
  readonly elements: SignUpFormElements
}

export default function SignUp(props) {
  const [open, setOpen] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState('');

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
    setOpen(false);
  };

  const handleCloseError = () => {
		setOpenError(false);
		setError('');
	};

  async function handleSubmit(event: FormEvent<SignUpForm>) {
    event.preventDefault()
    const form = event.currentTarget
    // ... validate inputs
    try {
      const user = await signUp({
        username: props.email,
        password: form.elements.password.value,
        autoSignIn: {
          enabled: true
        }
      })
    } catch (error) {
      setError(error);
      setOpenError(true);
      return;
    }
    props.onSubmitChange(false);
  }

  return (
    <Dialog
    open={open}
    onClose={handleOnCancel}
    PaperProps={{
      component: 'form',
      onSubmit: (event: FormEvent<SignUpForm>) => {
        event.preventDefault();
        handleSubmit(event);
      }
    }}
  >
  <DialogTitle>Enroll User</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Enter Following Fields:
    </DialogContentText>
    <Box sx={{ minWidth: 300 }}>
    {isWaiting && <CircularProgress />}
    {openError &&  <Alert severity="error" onClose={handleCloseError}>
          {error}
        </Alert>}
      <Typography variant="caption">UserName/Email = {props.email}</Typography>
      <TextField
          autoFocus
          required
          margin="dense"
          id="password"
          name="password"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
        />
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleOnCancel} variant="contained" color="error">Cancel</Button>
    <Button type="submit" variant="contained" color="primary">Save</Button>
  </DialogActions>
</Dialog>
)
}