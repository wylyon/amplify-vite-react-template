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
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import Button from "@mui/material/Button";
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { v4 as uuidv4 } from 'uuid';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function PopupGenerate(props) {
  const [progress, setProgress] = React.useState(10);
  const [open, setOpen] = useState(true);
  const [isAlert, setIsAlert] = useState(false);
  const [theSeverity, setTheSeverity] = useState('error');
  const [alertMessage, setAlertMessage] = useState('');
  const client = generateClient<Schema>();

  const createCompanyDivisionRow = async() => {
		const now = new Date();
		const { errors, data: item } = await client.models.company.create({
			id: uuidv4(),
			name: props.name, 
			email: props.userId,
			address1: '',
			address2: '',
			city: '',
			state: '',
			zipcode: '',
			ref_department: props.contact,
			notes: '',
			created: now,
			created_by: props.userId		
		});
		if (errors) {
			setAlertMessage(errors[0].message);
      setTheSeverity('error');
			setIsAlert(true);
		} else {
      setAlertMessage('Setup Company Record.');
      setTheSeverity('success');
      setIsAlert(true);
      
      const { errors, data: divisions } = await client.models.division.create({
        id: uuidv4(),
        company_id: item.id,
        name: props.name, 
        email: props.userId,
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipcode: '',
        ref_department: props.contact,
        notes: '',
        created: now,
        created_by: props.userId		
      });
      if (errors) {
        setAlertMessage(errors[0].message);
        setTheSeverity('error');
        setIsAlert(true);
      } else {
        setAlertMessage('Setup Division Record.');
        setTheSeverity('success');
        setIsAlert(true);
      }    
    }
	}

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress + 10));
    }, 800);
    if (progress == 10) {
      createCompanyDivisionRow();
    } else if (progress >= 100) {
      clearInterval(timer);
      handleCloseValues();
    }
    return () => {
      clearInterval(timer);
    };
  }, [progress]);

  const handleCloseValues = () => {
    setOpen(false);
    props.onClose(false);
  }

  const handleOnAlert = (e) => {
    setIsAlert(false);
    setAlertMessage('');
    setTheSeverity("error");
  }

  return (
    <React.Fragment>
    <CssBaseline />
    <Dialog
      open={open}
      onClose={handleCloseValues}
    >
    <DialogTitle>Generating Profile/Template/Users</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Generating content...please wait.
      </DialogContentText>
      {isAlert && theSeverity == 'success' &&
        <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">{alertMessage}</Alert> }
      {isAlert && theSeverity == 'error' && 
        <Alert severity="error" onClose={handleOnAlert}>{alertMessage}</Alert>}
      <Box sx={{ width: '100%' }}>
        <LinearProgressWithLabel value={progress} />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button disabled={progress < 100} onClick={handleCloseValues}>Close</Button>
    </DialogActions>
  </Dialog>
</React.Fragment>
  );
}