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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FormGroup from '@mui/material/FormGroup';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import { v4 as uuidv4 } from 'uuid';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { FormLabel, IconButton } from "@mui/material";
import ConfirmPassword from "../src/ConfirmPassword";
import VisibilityIcon from '@mui/icons-material/Visibility';
import SubjectIcon from '@mui/icons-material/Subject';

export default function PopupAddUsers(props) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState('');
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState(true);
  const [isAdd, setIsAdd] = useState(false);
  const [tabValue, setTabValue] = useState('1');
  const [confirm, setConfirm] = useState(false);
  const [isDeleteActive, setIsDeleteActive] = useState(false);
  const [password, setPassword] = useState('');
  const [arrayDivisions, setArrayDivisions] = useState([{}]);
  const [selectDivision, setSelectDivision] = useState('');
  const [textType, setTextType] = useState('password');
  const [addedUsers, setAddedUsers] = useState([])
  const [selectedRows, setSelectedRows] = useState([]);
  const [verificationSubject, setVerificationSubject] = useState("Welcome to " + props.title + " App!");
  const [verificationBody, setVerificationBody] = useState('');
  const [invitationSubject, setInvitationSubject] = useState("Welcome to " + props.title + " App!");
  const [invitationBody, setInvitationBody] = useState('');

  const client = generateClient<Schema>();

  const handleChange = (event: SelectChangeEvent) => {
    setSelectDivision(event.target.value as string);
  };

  useEffect(() => {
    setArrayDivisions(props.arrayDivisions);
    setAddedUsers(props.addedUsers);
	}, []);

  const handleCloseValues = (event: object, reason: string) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      return;
    }
    props.onClose(addedUsers);
    setOpen(false);
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleOnChange = (event) => {
    setIsAdd(true);
    setEmail(event.target.value as string);
  }

  const handleVerificationSubjectChange = (event) => {
    setVerificationSubject(event.target.value as string);
  }

  const handleInvitationSubjectChange = (event) => {
    setInvitationSubject(event.target.value as string);
  }

  const handleVerificationBodyChange = (event) => {
    setVerificationBody(event.target.value as string);
  }

  const handleInvitationBodyChange = (event) => {
    setInvitationBody(event.target.value as string);
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
        autoSignIn: {
          enabled: true
        }
      });
    } catch (error) {
      setError("Warning...could not signup on cloud...could already be defined.");
      setOpenError(true);
      return;
    }
  }

  const handleAddEmail = (event) => {
    const existing = addedUsers.filter(comp => comp.email == email);
    if (email == '') {
      setError("Need a valid email address");
      setOpenError(true);
      return;
    }
    if (existing && existing.length > 0) {
      setError("Email address " + email + " Already Exists.");
      setOpenError(true);
      return;
    }
    setAddedUsers([...addedUsers, {
      id: uuidv4(),
      email: email
    }]);
    setEmail('');
    setIsAdd(false);
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'email', headerName: 'Email Address', width: 230 },
  ];

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
          created_by: 0,         
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
          created_by: 0,
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

  const deleteUsers = (rowId) => {
    const newUserArray = [];
    for (var indx = 0; indx < addedUsers.length; indx++) {
      if (addedUsers[indx].id == rowId.id) {
      } else {
        newUserArray.push({
          id: addedUsers[indx].id,
          email: addedUsers[indx].email
        })
      }
    }
    setAddedUsers(newUserArray);
  }

  function handleDelete () { 
    for (var i = 0; i < selectedRows.length; i++) {
      deleteUsers(selectedRows[i]);
    }
  }

  function handleRowClick (params, event, details) {
  }

  function handleRowSelection (rowSelectionModel, details) {
    // called on checkbox for row.   
    if (rowSelectionModel.length == 0) {
      setIsDeleteActive(false);
      setSelectedRows([]);
    } else {
      if (rowSelectionModel.length == 1) {
        setIsDeleteActive(true);
        setSelectedRows([ { id: rowSelectionModel[0]}]);
      } else {
        setIsDeleteActive(true);
        var rowIds = [];
        for (var i = 0; i < rowSelectionModel.length; i++) {
          rowIds.push({ id: rowSelectionModel[i]});
        }
        setSelectedRows(rowIds);
      }
    }
  }

  const handleCheckedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

	const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
		id: false,
	  });

  const paginationModel = { page: 0, pageSize: 5 };
  const marks = [
    { value: 0, label: '0'},
    { value: 1, label: '1'},
    { value: 2, label: '2'},
    { value: 3, label: '3'},
    { value: 10, label: '10'}
  ];

  return (
    <React.Fragment>
    <CssBaseline />
    <Dialog
      open={open}
      maxWidth="lg"
      onClose={handleCloseValues}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          handleCloseValues();
        },
      }}
    >
    <DialogTitle>{props.props.isAdmin ? "Create a New Admin" : "Create a New User"}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Enter Following Fields:
      </DialogContentText>
      <Box>
      {isWaiting && <CircularProgress />}
      {openError &&  <Alert severity="error" onClose={handleCloseError}>
            {error}
          </Alert>}
      {confirm && <ConfirmPassword props={props} password={password} onGoodPassword={handleGoodPassword} onBadPassword={handleBadPassword} />}
        <Stack direction="row" spacing={3} >
          <Stack direction="column" spacing={2} >
            <Paper elevation={3} sx={{ height: '130px', width: '300px'}}>
              <br />
              <TextField
                  autoFocus
                  margin="dense"
                  id="email"
                  name="email"
                  value={email}
                  label="User Email Address"
                  type="email"
                  fullWidth
                  onChange={handleOnChange}
                  variant="standard"
              />
              <br />
              <Button variant="contained" color="primary" onClick={handleAddEmail} 
                disabled={!isAdd}>Add User</Button>
            </Paper>
            <Paper elevation={3} sx={{ height: '440px', width: '600px'}}>
              <Typography variant="caption">Email Options...</Typography><br/>
              <FormControlLabel control={<Checkbox defaultChecked checked={checked} onChange={handleCheckedChange} />} label="Default email settings" /> <br/>
              {!checked ?
              <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                    <Tab label="User Invitation-Email" value="1" />
                  </TabList>
                </Box>
                <TabPanel value="1">
                <TextField 
                    margin="dense"
                    id="invitationSubject"
                    name="invitationSubject"
                    value={invitationSubject}
                    onChange={handleInvitationSubjectChange}
                    label="Invitation Subject"
                    type="text"
                    fullWidth
                    variant="standard"
                  />
                  <TextField 
                    margin="dense"
                    id="invitationBody"
                    name="invitationBody"
                    value={invitationBody}
                    onChange={handleInvitationBodyChange}
                    multiline
                    maxRows={4}
                    rows={4}
                    label="Invitation Body"
                    type="text"
                    fullWidth
                    variant="outlined"
                  />
                  <Typography variant="caption">NOTE:  Invitation body will automatically include "You can now login with email ### and temp password ###."</Typography>
                </TabPanel>
              </TabContext> : null }
            </Paper>
          </Stack>
          <Box sx={{ bgcolor: '#52B2BF', width: '300px', height: '590px', 
              borderStyle: 'solid', borderWidth: '2px'}} >
            <h3>{"Added Users"}
              <Button variant="contained" color="error" disabled={!isDeleteActive} onClick={handleDelete}>Delete</Button>
            </h3>
             <Paper sx={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={addedUsers}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
                onRowClick={handleRowClick}
                onRowSelectionModelChange={handleRowSelection}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newRow) =>
                  setColumnVisibilityModel(newRow)
                }
                sx={{ border: 0 }}
              />
            </Paper>
          </Box>
        </Stack>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button type="submit" variant="contained" color="error">Close</Button>
    </DialogActions>
  </Dialog>
</React.Fragment>
  );
}