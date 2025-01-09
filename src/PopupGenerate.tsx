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
  const [divisionId, setDivisionId] = useState('');
  const client = generateClient<Schema>();
  var isProfile = false;
  var isTemplate = false;

  const createTemplate = async(timer) => {
    if (isTemplate) {
      return;
    }
    isTemplate = true;
    if (!props.hasTemplate) {
      setAlertMessage('Bypassing Template(Logging App) Creation.');
      setTheSeverity('success');
      setIsAlert(true);
      return;
    }
		const now = new Date();
		const { errors, data: template } = await client.models.template.create({
			id: uuidv4(),
			division_id: divisionId,
			title: props.title,
			description: props.description,
			live_date:  now.toISOString().slice(0, 10),
			prod_date:  now.toISOString().slice(0, 10),
			notes: '',
			created: now,
			created_by: props.userId,
			use_pagination: 1,
			auto_space:  1,
			box_controls:  0		
		});
		if (errors) {
			setAlertMessage(errors[0].message);
      setTheSeverity('error');
			setIsAlert(true);
      clearInterval(timer);
		} else {
      setAlertMessage('Setup Template(Logging App) Record.');
      setTheSeverity('success');
      setIsAlert(true);

      var numAdded = 0;
      for (var indx = 0; indx < props.templateQuestions.length; indx++) {
        const { errors, data: newQuestion } = await client.models.template_question.create({
          id: uuidv4(),
          template_id: template.id,
          question_order: props.templateQuestions[indx].question_order,
          pre_load_attributes: props.templateQuestions[indx].pre_load_attributes,
          title: props.templateQuestions[indx].title,
          description: props.templateQuestions[indx].description,
          question_type: props.templateQuestions[indx].question_type,
          question_values: props.templateQuestions[indx].question_values,
          post_load_attributes: props.templateQuestions[indx].post_load_attributes,
          optional_flag: props.templateQuestions[indx].optional_flag,
          notes: '',
          created: now,
          created_by: props.userId,
          trigger_value: props.templateQuestions[indx].trigger_value
        });
        if (errors) {
          setAlertMessage(errors[0].message);
          setTheSeverity('error');
          setIsAlert(true);
          clearInterval(timer);
        } else {
          numAdded++;
        }
      }
      if (numAdded > 0) {
        setAlertMessage('Setup ' + numAdded + ' Questions for Logging App.');
        setTheSeverity('success');
        setIsAlert(true);

        const firstLastName = props.contact.split(' ');
        const { errors, data: user } = await client.models.user.create({
          id: uuidv4(),
          division_id: divisionId,
          email_address: props.userId,
          first_name: firstLastName[0],
          last_name: firstLastName.length > 1 ? firstLastName[1] : firstLastName[0],
          middle_name: '',
          active_date: now.toISOString().slice(0, 10),
          notes: '',
          created: now,
          created_by: props.userId			
        });			
        if (errors) {
          setAlertMessage(errors[0].message);
          setTheSeverity('error');
          setIsAlert(true);
          clearInterval(timer);
        } else {
          setAlertMessage('Setup User Record for Admin.');
          setTheSeverity('success');
          setIsAlert(true);

          const { errors, data: newTemplatePermission } = await client.models.template_permissions.create({ 
            id: uuidv4(),
            template_id: template.id,
            user_id: user.id,
            enabled_date: now,
            created: now,
            created_by: props.userId
          });
          if (errors) {
            setAlertMessage(errors[0].message);
            setTheSeverity('error');
            setIsAlert(true);
            clearInterval(timer);
          } else {
            setAlertMessage('Setup Admin/User Permission for Logging App.');
            setTheSeverity('success');
            setIsAlert(true);
          }
        }
      }
    }
  }

  const createCompanyDivisionAdminRow = async(timer) => {
    if (isProfile) {
      return;
    }
    isProfile = true;
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
      clearInterval(timer);
		} else {
      setAlertMessage('Setup Company Record.');
      setTheSeverity('success');
      setIsAlert(true);
      
      const { errors, data: division } = await client.models.division.create({
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
        clearInterval(timer);
      } else {
        setAlertMessage('Setup Division Record.');
        setTheSeverity('success');
        setIsAlert(true);
        setDivisionId(division.id);
        const firstLastName = props.contact.split(' ');
        const { errors, data: admin } = await client.models.admin.create({
          id: uuidv4(),
          company_id: item.id,
          email_address: props.userId,
          first_name: firstLastName[0],
          last_name: firstLastName.length > 1 ? firstLastName[1] : firstLastName[0],
          middle_name: '',
          active_date: now.toISOString().slice(0, 10),
          created: now,
          created_by: props.userId			
        });			
        if (errors) {
          setAlertMessage(errors[0].message);
          setTheSeverity('error');
          setIsAlert(true);
          clearInterval(timer);
        } else {
          setAlertMessage('Setup Admin Record.');
          setTheSeverity('success');
          setIsAlert(true);
        }
      }    
    }
	}

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress + 10));
    }, 800);
    if (progress == 10) {
      createCompanyDivisionAdminRow(timer);
    } else if (progress == 30) {
      createTemplate(timer);
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