// @ts-nocheck
import React from "react";
import { useState, useEffect, useRef  } from "react";
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
import SelectGridState from '../src/SelectGridState';

export default function PopupNewDivision(props) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [open, setOpen] = useState(true);
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState('');
  const [textType, setTextType] = useState('password');

  const client = generateClient<Schema>();

  const handleChange = (event: SelectChangeEvent) => {
    setSelectDivision(event.target.value as string);
  };

  useEffect(() => {
	}, []);

  const handleCloseValues = (event: object, reason: string) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      return;
    }
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

  const handleAddRow = async(name, email, address1, address2, city, state, zipcode, notes, refDept) => {
		const now = new Date();
    setIsWaiting(true);
    const id = uuidv4();
		const { errors, data: item } =
        await client.models.division.create({
          id: id,
          company_id: props.company == null ? null : props.company.id,
          name: name,
          email: email,
          address1: address1,
          address2: address2,
          city: city,
          state: state,
          zipcode: zipcode,
          ref_department: refDept,
          notes: notes,
          created: now,
          created_by: props.userId,         
        }) ;
		if (errors) {
      setIsWaiting(false);
			setError("Can't create division.");
			setOpenError(true);
      return false;
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
          const name = formJson.name;
          const email = formJson.email;
          const address1 = formJson.address1;
          const address2 = formJson.address2;
          const city = formJson.city;
          const state = formJson.state;
          const zipcode = formJson.zipcode;
          const notes = formJson.notes;
          const refDept = formJson.refDept;
          const filterName = props.rows.filter(comp => comp.name == name);
          if (filterName != null && filterName.length > 0) {
            setError("Division Name " + name + " already exists.   Please choose another.");
            setOpenError(true);
            return false;
          }
          return handleAddRow(name, email, address1, address2, city, state, zipcode, notes, refDept);
        },
      }}
    >
    <DialogTitle>Add a new Division</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Enter Following Fields:
      </DialogContentText>
      <Box sx={{ minWidth: 300 }}>
      {isWaiting && <CircularProgress />}
      {openError &&  <Alert severity="error" onClose={handleCloseError}>
            {error}
          </Alert>}
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Division Name"
            type="text"
            fullWidth
            variant="standard"
          />
        <TextField
            margin="dense"
            id="email"
            name="email"
            label="Division Email Address"
            type="email"
            fullWidth
            variant="standard"
          />
        <TextField
            margin="dense"
            id="address1"
            name="address1"
            label="Address-1"
            type="text"
            fullWidth
            variant="standard"
          />
        <TextField
          margin="dense"
          id="address2"
          name="address2"
          label="Address-2"
          type="text"
          fullWidth
          variant="standard"
        />
        <Stack spacing={3} direction="row">
          <TextField
              margin="dense"
              id="city"
              name="city"
              label="City"
              type="text"
              variant="standard"
            />
          <Stack spacing={3} direction="row">
            <Typography variant="body2">State: </Typography>
            <SelectGridState />
          </Stack>
          <TextField
              margin="dense"
              id="zipcode"
              name="zipcode"
              label="Zipcode"
              type="text"
              variant="standard"
            />
        </Stack>
         <TextField
            margin="dense"
            id="refDept"
            name="refDept"
            label="Ref-Department"
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