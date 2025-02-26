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
import CryptoJS from 'crypto-js';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

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
  const [progress, setProgress] = React.useState(0);
  const [open, setOpen] = useState(true);
  const [isAlert, setIsAlert] = useState(false);
  const [theSeverity, setTheSeverity] = useState('error');
  const [alertMessage, setAlertMessage] = useState('');
  const client = generateClient<Schema>();
  const [addedUsers, setAddedUsers] = useState([]);
  const [access, setAccess] = useState('');
  const [secret, setSecret] = useState('');
  const [region, setRegion] = useState('');
  const [ourWord, setOurWord] = useState('');
  const [userPoolId, setUserPoolId] = useState('');

  var isProfile = false;
  var isTemplate = false;
  var isLogins = false;

  const getAppSettings = async() => {
    const { data: items, errors } = await client.models.app_settings.list();
    if (errors) {
      alert(errors[0].message);
    } else {
      const what3words = items.filter(map => map.code.includes('WHAT3WORDS_API_KEY0'));
      if (what3words.length < 1) {
        setError("Cant get credentials for Admin.");
        setOpenError(true);    
        return;   
      }
      setOurWord(what3words[0].value + what3words[0].value);
      const domain = window.location.hostname;
      const userPool = domain.includes('localhost') ? items.filter(map => map.code.includes('USERPOOLID-DEV')) : items.filter(map => map.code.includes('USERPOOLID-PRD'));
      if (userPool.length < 1) {
        setError("Cant get userPool for Admin.");
        setOpenError(true);    
        return;   
      }
      setUserPoolId(userPool[0].value);
      const creds = items.filter(map => map.code.includes('ACCESS'));
      if (creds.length < 1) {
        setError("Cant get access credentials for Admin.");
        setOpenError(true);
      } else {
        const accessId = creds[0].value;
        const secret = items.filter(map => map.code.includes('SECRET'));
        if (secret.length < 1) {
          setError("Cant get secret credentials for Admin.");
          setOpenError(true);
        } else {
          const secretId = secret[0].value;
          const region = items.filter(map => map.code.includes('REGION'));
          if (region.length < 1) {
            setError("Cant get region credentials for Admin.");
            setOpenError(true);
          } else {
            const regionId = region[0].value;
            setAccess(accessId);
            setSecret(secretId);
            setRegion(regionId);
          }
        }
      }
    }
  }

  const handleCloseValues = () => {
    setOpen(false);
    props.onClose(false);
  }

  const createTemplate = async(divisionId) => {
    if (isTemplate) {
      return;
    }
    isTemplate = true;
    if (!props.hasTemplate) {
      setProgress(80);
      setAlertMessage('Bypassing Template(Logging App) Creation.');
      setTheSeverity('success');
      setIsAlert(true);
      createNewLogins();
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
      console.log("template.create." + errors[0].message);
      setTheSeverity('error');
			setIsAlert(true);
      setProgress(100);
		} else {
      setProgress(40);
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
          console.log("template_question.create." + errors[0].message);
          setTheSeverity('error');
          setIsAlert(true);
          setProgress(100);
        } else {
          numAdded++;
        }
      }
      if (numAdded > 0) {
        setProgress(50);
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
          console.log("user.create." + errors[0].message);
          setTheSeverity('error');
          setIsAlert(true);
          setProgress(100);
        } else {
          setProgress(60);
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
            console.log("template_permission.create." + errors[0].message);
            setTheSeverity('error');
            setIsAlert(true);
            setProgress(100);
          } else {
            setProgress(70);
            if (props.addedUsers && props.addedUsers.length > 0) {
              // need to add additional users and link up their template(s)
              for (var i = 0; i < props.addedUsers.length; i++) {
                const { errors, data: user } = await client.models.user.create({
                  id: props.addedUsers[i].id,
                  division_id: divisionId,
                  email_address: props.addedUsers[i].email,
                  first_name: 'unknown',
                  last_name: 'unknown',
                  middle_name: '',
                  active_date: now.toISOString().slice(0, 10),
                  notes: '',
                  created: now,
                  created_by: props.userId			
                });	
                if (errors) {
                  setAlertMessage(errors[0].message);
                  console.log("user.create." + errors[0].message);
                  setTheSeverity('error');
                  setIsAlert(true);
                  setProgress(100);
                  i = props.addedUsers.length;
                } else {
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
                    console.log("template_permissions.create." + errors[0].message);
                    setTheSeverity('error');
                    setIsAlert(true);
                    setProgress(100);
                    i = props.addedUsers.length;
                  }
                }
              }
            }
            setProgress(80);
            setAlertMessage('Setup Admin/User Permission for Logging App.');
            setTheSeverity('success');
            setIsAlert(true);
            createNewLogins();
          }
        }
      }
    }
  }

  const createNewLogins = async() => {
    // this will create the new login's IF there was at least one template...otherwise adding them makes no sense.
    if (isLogins) {
      return;
    }
    isLogins = true;
    if (!props.addedUsers || props.addedUsers.length < 1) {
      setProgress(100);
      setAlertMessage('Bypassing User(Logging App) Creation.');
      setTheSeverity('success');
      setIsAlert(true);
      handleCloseValues();
      return;
    }
    if (!props.hasTemplate) {
      setProgress(100);
      setAlertMessage('Bypassing User(Logging App) Creation, since no templates');
      setTheSeverity('success');
      setIsAlert(true);
      handleCloseValues();
      return;
    }
    const cognito = new CognitoIdentityProvider({
      region: region,
      credentials: {
        accessKeyId: CryptoJS.AES.decrypt(access, ourWord).toString(CryptoJS.enc.Utf8),
        secretAccessKey: CryptoJS.AES.decrypt(secret, ourWord).toString(CryptoJS.enc.Utf8),
      }
    });
    // now lets add the Cognito logins
    var anyErrors = false;
    for (var i = 0; i < props.addedUsers.length; i++) {
      try {
        const response = await cognito.adminCreateUser({
          UserPoolId: userPoolId,
          Username: props.addedUsers[i].email,
          UserAttributes: [{
            Name: 'email',
            Value: props.addedUsers[i].email
          }],
          TemporaryPassword: 'tempPassword@123',
        }).promise();
  
      } catch (error) {
      }
    }
    if (!anyErrors) {
      setProgress(100);
      setAlertMessage('Setup Admin/User Permission for Logging App.');
      setTheSeverity('success');
      setIsAlert(true);
      handleCloseValues();
    }
  }

  const createCompanyDivisionAdminRow = async() => {
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
      console.log("company.create." + errors[0].message);
      setTheSeverity('error');
			setIsAlert(true);
      setProgress(100);
		} else {
      setProgress(10);
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
        console.log("division.create." + errors[0].message);
        setTheSeverity('error');
        setIsAlert(true);
        setProgress(100);
      } else {
        setProgress(20);
        setAlertMessage('Setup Division Record.');
        setTheSeverity('success');
        setIsAlert(true);
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
          console.log("admin.create." + errors[0].message);
          setTheSeverity('error');
          setIsAlert(true);
          setProgress(100);
        } else {
          setProgress(30);
          setAlertMessage('Setup Admin Record.');
          setTheSeverity('success');
          setIsAlert(true);
          createTemplate(division.id);
        }
      }    
    }
	}

  useEffect(() => {
    setAddedUsers(props.addedUsers);
    getAppSettings();
    createCompanyDivisionAdminRow();
  }, []);

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
      {progress < 100 && <Box sx={{ width: '100%' }}>
        <LinearProgressWithLabel value={progress} />
      </Box> }
    </DialogContent>
    <DialogActions>
      <Button disabled={progress < 100} onClick={handleCloseValues}>Close</Button>
    </DialogActions>
  </Dialog>
</React.Fragment>
  );
}