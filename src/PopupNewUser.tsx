// @ts-nocheck
import React from "react";
import { useState, useEffect  } from "react";
import { Amplify } from "aws-amplify";
import { signUp, resetPassword } from "aws-amplify/auth";
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
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { IconButton } from "@mui/material";
import ConfirmPassword from "../src/ConfirmPassword";
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function PopupNewUser(props) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [open, setOpen] = useState(true);
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [arrayDivisions, setArrayDivisions] = useState([{}]);
  const [selectDivision, setSelectDivision] = useState(props.arrayDivisions[0].id);
  const [textType, setTextType] = useState('password');

  const client = generateClient<Schema>();

  const handleChange = (event: SelectChangeEvent) => {
    setSelectDivision(event.target.value as string);
  };

  useEffect(() => {
    setArrayDivisions(props.arrayDivisions);
	}, []);

  const handleCloseValues = (event: object, reason: string) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      return;
    }
    props.onClose();
    setOpen(false);
  }

  const handlePasswordConfirm = (event) => {
    event.preventDefault();
    setPassword(event.target.value as string);
    setConfirm(true);
  }

  const handlePasswordVisibility = (event) => {
    setTextType(textType == 'password' ? 'text' : 'password');
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

  const signThemUp = async(username, password) => {

    try {
      const  user  = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email: username
          }, 
        },
      });
    } catch (error) {
      setError("Warning...could not signup on cloud...could already be defined.");
      setOpenError(true);
      return;
    }
    try {
      const reset = await resetPassword({
        username,
      });
    } catch (error) {
      setError("Warning...could not reset password.");
      setOpenError(true);
      return;
    }

  }

  const handleAddRow = async(email, firstName, middleName, lastName, notes, password) => {
		const now = new Date();
    setIsWaiting(true);
    const id = uuidv4();
		const { errors, data: item } =
      props.props.isAdmin ?
        await client.models.admin.create({
          id: id,
          email_address: email,
          company_id: props.company.id,
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          active_date: now.toISOString().slice(0, 10),
          created: now,
          created_by: props.userId,         
        }) : 
        await client.models.user.create({
          id: id,
          division_id: selectDivision,
          email_address: email, 
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          active_date: now.toISOString().slice(0, 10),
          notes: notes,
          created: now,
          created_by: props.userId,
        }) ;
		if (errors) {
      setIsWaiting(false);
			setError("Can't create user...could be a duplicate email.");
			setOpenError(true);
      return false;
		}
    if (password != null) {
      signThemUp(email, password);
    }
    setIsWaiting(false);
    handleSubmitValues(item);
	}

  return (
    <React.Fragment>
    <CssBaseline />
    <Dialog
      open={open}
      onClose={handleCloseValues}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (confirm) {
            setConfirm(false);
            return false;
          }
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const email = formJson.email;
          const firstName = formJson.firstName;
          const middleName = formJson.middleName;
          const lastName = formJson.lastName;
          const notes = formJson.notes;
          const password = formJson.password;
          const filterEmail = props.rows.filter(comp => comp.email == email);
          if (filterEmail != null && filterEmail.length > 0) {
            setError("Email " + email + " already exists.   Please choose another.");
            setOpenError(true);
            return false;
          }
          return handleAddRow(email, firstName, middleName, lastName, notes, password);
        },
      }}
    >
    <DialogTitle>{props.props.isAdmin ? "Create a New Admin" : "Create a New User"}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Enter Following Fields:
      </DialogContentText>
      <Box sx={{ minWidth: 300 }}>
      {isWaiting && <CircularProgress />}
      {openError &&  <Alert severity="error" onClose={handleCloseError}>
            {error}
          </Alert>}
      {confirm && <ConfirmPassword props={props} password={password} onGoodPassword={handleGoodPassword} onBadPassword={handleBadPassword} />}
        <FormControl fullWidth>
          <Typography variant="caption">Division: </Typography>
          <Select fullWidth
            required
            labelId="select-division-name"
            id="demo-simple-select"
            defaultValue={props.arrayDivisions == null || props.arrayDivisions.length < 1 ? "need division" : props.arrayDivisions[0].id}
            label="Division"
            onChange={handleChange}
          >
          {arrayDivisions.map(comp => 
            <MenuItem key={comp.id} value={comp.id}>{comp.name}</MenuItem>
          )}
          </Select>
        </FormControl>
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
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseValues} variant="contained" color="error">Cancel</Button>
      <Button type="submit" variant="contained" color="primary">Save</Button>
    </DialogActions>
  </Dialog>
</React.Fragment>
  );
}