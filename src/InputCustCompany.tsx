
// @ts-nocheck
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

export default function InputCustCompany(props) {
  const [formData, setFormData] = useState({
    id: props.company.id,
    name: props.company.name,
    email: props.company.email,
    address1: props.company.address1,
    address2: props.company.address2,
    city: props.company.city,
    state: props.company.state,
    zipcode: props.company.zipcode,
    ref_department: props.company.ref_department,
    notes: props.company.notes,
    isDivision: props.company.enable_divisions
  });

  const client = generateClient<Schema>();
  const [isNew, setIsNew] = useState(false);
  const [isGoAdd, setIsGoAdd] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isAlertError, setIsAlertError] = useState(false);
  const [isPrevent, setIsPrevent] = useState(true);

  const [access, setAccess] = useState('');
	const [secret, setSecret] = useState('');
	const [region, setRegion] = useState('');
	const [ourWord, setOurWord] = useState('');
	const [userPoolId, setUserPoolId] = useState('');
	const [isBackups, setIsBackups] = useState(true);
  const [isDivision, setIsDivision] = useState(props.isDivision);

  const getAppSettings = async() => {
		const { data: items, errors } = await client.models.app_settings.list();
		if (errors) {
		  alert(errors[0].message);
		} else {
			const backupDeletes = items.filter(map => map.code == 'BACKUP');
			if (backupDeletes.length < 1) {
				setIsBackups(false);
			} else {
				if (backupDeletes[0].value != 'true') {
					setIsBackups(false);
				}
			}
		  const what3words = items.filter(map => map.code.includes('WHAT3WORDS_API_KEY0'));
		  if (what3words.length < 1) {
        setAlertMessage("Cant get credentials for Admin.");
        setIsAlertError(true);
        setIsAlert(true);
        return;   
		  }
		  setOurWord(what3words[0].value + what3words[0].value);
		  const domain = window.location.hostname;
		  const userPool = domain.includes('localhost') ? items.filter(map => map.code.includes('USERPOOLID-DEV')) : items.filter(map => map.code.includes('USERPOOLID-PRD'));
		  if (userPool.length < 1) {
        setAlertMessage("Cant get userPool for Admin.");
        setIsAlertError(true);
        setIsAlert(true);
        return;   
		  }
		  setUserPoolId(userPool[0].value);
		  const creds = items.filter(map => map.code.includes('ACCESS'));
		  if (creds.length < 1) {
        setAlertMessage("Cant get access credentials for Admin.");
        setIsAlertError(true);
        setIsAlert(true);
		  } else {
        const accessId = creds[0].value;
        const secret = items.filter(map => map.code.includes('SECRET'));
        if (secret.length < 1) {
          setAlertMessage("Cant get secret credentials for Admin.");
          setIsAlertError(true);
          setIsAlert(true);
        } else {
          const secretId = secret[0].value;
          const region = items.filter(map => map.code.includes('REGION'));
          if (region.length < 1) {
            setAlertMessage("Cant get region credentials for Admin.");
            setIsAlertError(true);
            setIsAlert(true);
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

  useEffect(() => {
		getAppSettings();
	  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const deleteCompany = async() => {
    await client.mutations.deleteAdminByCompanyId({
      companyId: props.company.id
    });
    await client.models.company.delete({
      id: props.company.id
    });
    props.onSubmitChange(false);
  }

  const updateCompanyEnableDivisions = async(newIsDivision) => {
    const { data: updateData, errors } = await client.models.company.update ({
      id: props.company.id,
      enable_divisions: newIsDivision
    });
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlertError(true);
      setIsAlert(true);
      return;
    }
    setAlertMessage("Company record enable_division updated!");
    setIsAlertError(false);
    setIsAlert(true);
  }

  const handleDivisionTurnOn = () => {
    const newIsDivision = isDivision == 0 ? 1 : 0;
    updateCompanyEnableDivisions(newIsDivision);
    setIsDivision(newIsDivision);
    props.onTurnOnDivision(newIsDivision);
  }

  const verifyCompany = async() => {
    const { errors, data: items} = await client.queries.listAllDivisionsByCompanyId({
      companyId: props.company.id
    });
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlertError(true);
      setIsAlert(true);
      return;
    }
    if (items && items.length > 0) {
      setAlertMessage("Divisions exist.   Please DELETE all Divisions before deleting Company.");
      setIsAlertError(true);
      setIsAlert(true);
      return;
    }
    // here we can delete the company and admin rows
    if (isBackups) {
      await client.mutations.backupAdminByCompanyId({
				companyId: props.company.id
			});
      await client.mutations.backupCompanyById({
        id: props.company.id
      });
    }
    deleteCompany();
  }

  const updateCompany = async() => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();

    const { data: updateData, errors } = await client.models.company.update({ 
      id: props.company.id,
      name: formData.name, 
      email: formData.email,
      address1: formData.address1,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      zipcode: formData.zipcode,
      ref_department: formData.ref_department,
      notes: formData.notes,
      created: now,
      created_by: 0});
    if (errors) {
      setAlertMessage(errors[0].message);
      setIsAlertError(true);
      setIsAlert(true);
      return;
    }
    setAlertMessage("Company record updated!");
    setIsAlertError(false);
    setIsAlert(true);
  }

  const handleUpdate = (e) => {
    setIsPrevent(false);
    //handleSubmit(e);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPrevent) {
      return;
    }
    (props.isAddMode || isGoAdd) ? createCompany() : updateCompany();
    setIsPrevent(true);
  };

  const handleOnCancel = (e) => {
    setIsPrevent(true);
  };

  return (
    <div>
     <h1 align="center">Company Maintenance</h1>
      <form onSubmit={handleSubmit}>
      <label>
        Name: </label>
        <input
          type="text"
	  name="name"
	  placeholder="Company Name"
	  size="40"
          value={formData.name}
          onChange={handleChange} />
      <label>  Email:  </label>
        <input
          type="text"
	  name="email"
	  placeholder="Finance/Billing Email Address"
	  size="40"
          value={formData.email}
          onChange={handleChange}
        /><br /><br />
      <label>
        Address:</label><br />
        <input
          type="text"
	  name="address1"
	  placeholder="Physical mailing address"
	  size="45"
          value={formData.address1}
          onChange={handleChange}
        /><br />
        <input
          type="text"
	  name="address2"
	  placeholder="Additional address"
	  size="45"
          value={formData.address2}
          onChange={handleChange}
        /><br /><br />
	<label>City: </label>
        <input
          type="text"
	  name="city"
	  placeholder="City"
	  size="20"
          value={formData.city}
          onChange={handleChange}
        />
	<label>State: </label>
        <input
          type="text"
	  name="state"
	  placeholder="ST"
	  size="2"
          value={formData.state}
          onChange={handleChange}
        />
	<label>Zip: </label>
        <input
          type="text"
	  name="zipcode"
	  placeholder="Zipcode"
	  size="10"
          value={formData.zipcode}
          onChange={handleChange}
        /><br /><br />
	<label>Dept: </label>
        <input
          type="text"
	  name="ref_department"
	  placeholder="Reference Department"
	  size="40"
          value={formData.ref_department}
          onChange={handleChange}
        />
      <label>. Notes: </label>
	<input type="text" 
    name="notes" 
    placeholder="Notes for this entry" 
    size="80"
    value={formData.notes} 
    onChange={handleChange} 
	/>
  <br/><br/>
  <ButtonGroup variant="contained" aria-label="Basic button group">
    <Button color="primary" type="submit" onClick={handleUpdate}>Update</Button>
    <Button color="error" onClick={handleOnCancel}>Cancel</Button>
    <Button color="warning" onClick={verifyCompany}>Delete</Button>
    <Button color="info" onClick={handleDivisionTurnOn}>{isDivision == 0 ? "Enable Divisions" : "Disable Divisions"}</Button>
  </ButtonGroup>
      </form>
      {isAlert && <Alert severity={isAlertError ? "error" : "success"} onClose={() => {setIsAlert(false)}} >{alertMessage}</Alert>}
     </div>
  );
}