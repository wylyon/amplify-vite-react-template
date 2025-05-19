
// @ts-nocheck
import { useState, useEffect } from "react";
import AdminMain from '../src/AdminMain';
import AdminSuper from '../src/AdminSuper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

export default function AdminMode(props) {

	const [loggedIn, setLoggedIn] = useState(false);
	const client = generateClient<Schema>();

	const handleLogIn = async() => {
		if (loggedIn) {
			return;
		}
		const now = new Date();
		const { data: items, errors } = await client.models.Log.create ({
			userName: props.userId,
			content: 'Admin Login',
			transactionDate: now
		});
		if (errors) {
			console.log('Cant create login log entry: ', errors);
		}
	}

	const handleLogOut = async() => {
		const now = new Date();
		const { data: items, errors } = await client.models.Log.create ({
			userName: props.userId,
			content: 'Admin Logout',
			transactionDate: now
		});
		if (errors) {
			console.log('Cant create logout log entry: ', errors);
		}
	}

  	const handleOnSignOut = (e) => {
		handleLogOut();
    	props.onSubmitChange(false);
  	};

	useEffect(() => {
		handleLogIn();
		setLoggedIn(true);
	}, []);

  return (
    <main>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
		<div className="topnav">
		<a href="#home" className="active"><i className="fa fa-building" style={{fontSize:24}} />
		{props.isSuperAdmin ? "Super Admin" : "Admin"}
			<div className="rightText">
			({props.userId}) <i className="fa fa-sign-out" style={{fontSize:24}}  onClick={handleOnSignOut} />
			</div>
		</a>
		</div>
		<Stack>
			<Typography variant="h4" sx={{textAlign: 'center', bgcolor: 'background.paper'}}>Log/Report Capture Tool</Typography>
			{props.isSuperAdmin && <AdminSuper props={props} userId={props.userId} googleAPI={props.googleAPI} /> }
			{!props.isSuperAdmin && <AdminMain props={props} userId={props.userId} googleAPI={props.googleAPI} companyId={props.companyId} onSubmitChange={handleOnSignOut}/> }
		</Stack>
    </main> 
  );
}
