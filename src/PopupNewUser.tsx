// @ts-nocheck
import React from "react";
import { useState, useEffect  } from "react";
import { Amplify } from "aws-amplify"
import { signUp } from "aws-amplify/auth";
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

export default function PopupNewUser(props) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [open, setOpen] = useState(true);
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState(true);
  const [arrayDivisions, setArrayDivisions] = useState([{}]);
  const [selectDivision, setSelectDivision] = useState(props.arrayDivisions[0].id);

  const client = generateClient<Schema>();

  const handleChange = (event: SelectChangeEvent) => {
    setSelectDivision(event.target.value as string);
  };

  useEffect(() => {
    setArrayDivisions(props.arrayDivisions);
	}, []);

  const handleChangeBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

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

  const signThemUp = async(username, password) => {

    try {
      const  user  = await signUp({
        username,
        password,
        autoSignIn: {
          enabled: true
        }
      });
    } catch (error) {
      setError(error);
      setOpenError(true);
      return;
    }
  }

  const handleAddRow = async(email, firstName, middleName, lastName, notes, activeDate, password, isAddCognito) => {
		const now = new Date();
    setIsWaiting(true);
    const id = uuidv4();
		const { errors, data: item } = await client.models.user.create({
			id: id,
			division_id: selectDivision,
			email_address: email, 
			first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
			active_date: activeDate == null || activeDate == '' ? null : getDate(activeDate).toISOString().slice(0, 10),
			notes: notes,
			created: now,
			created_by: 0,
		});
		if (errors) {
      setIsWaiting(false);
			setError(errors[0].message);
			setOpenError(true);
      return false;
		}
    if (isAddCognito && password != null) {
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
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const email = formJson.email;
          const firstName = formJson.firstName;
          const middleName = formJson.middleName;
          const lastName = formJson.lastName;
          const notes = formJson.notes;
          const activeDate = formJson.activeDate;
          const password = checked ? formJson.password : null;
          const filterEmail = props.rows.filter(comp => comp.email == email);
          if (filterEmail != null && filterEmail.length > 0) {
            setError("Email " + email + " already exists.   Please choose another.");
            setOpenError(true);
            return false;
          }
          return handleAddRow(email, firstName, middleName, lastName, notes, activeDate, password, checked);
        },
      }}
    >
    <DialogTitle>Create New User</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Enter Following Fields:
      </DialogContentText>
      <Box sx={{ minWidth: 300 }}>
      {isWaiting && <CircularProgress />}
      {openError &&  <Alert severity="error" onClose={handleCloseError}>
            {error}
          </Alert>}
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
           <FormControlLabel control={<Checkbox defaultChecked checked={checked} onChange={handleChangeBox} inputProps={{ 'aria-label': 'controlled'}}/>} label="Add User to AWS Cloud?" />
           {checked &&         
           <TextField
            margin="dense"
            id="password"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
          />}
          <Typography variant="caption" gutterBottom>Active Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker 
                name="activeDate"
                key="activeDate"
              />
            </LocalizationProvider>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseValues}>Cancel</Button>
      <Button type="submit">Save</Button>
    </DialogActions>
  </Dialog>
</React.Fragment>
  );
}