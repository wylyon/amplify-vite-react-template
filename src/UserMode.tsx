
// @ts-nocheck
import React from "react";
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import DisplayUser from '../src/DisplayUser';
import PopupTemplate from "../src/PopupTemplate";
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import LogoDevIcon from '@mui/icons-material/LogoDev';
import Tooltip from '@mui/material/Tooltip';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import usePagination from "@mui/material/usePagination/usePagination";
import { downloadData } from 'aws-amplify/storage';
import { AddToHomeScreen } from 'react-pwa-add-to-homescreen';
import { v4 as uuidv4 } from 'uuid';

export default function UserMode(props) {

	const [userData, setUserData] = useState([{
		id: '',   
		templateUserId: '',
		preLoadPageAttributes: '',
		postLoadPageAttributes: '',
		enabledDate: '',
		verifiedDate: '',
		emailAddress: props.userId,
		title: '',
		usePagination: false,
		useAutoSpacing: false,
		useBoxControls: false
	}]);
	
	const [templateQuestion, setTemplateQuestion] = useState<Schema["template_question"]["type"][]>([]);
	const [reload, setReload] = useState(false);
	const client = generateClient<Schema>();
	const [filtered, setFiltered] = useState('');
	const [isDefaultPage, setIsDefaultPage] = useState(true);
	const [isMultiTemplates, setIsMultiTemplates] = useState(false);
	const [preLoadPage, setPreLoadPage] = useState('');
	const [postLoadPage, setPostLoadPage] = useState('');
	const [templates, setTemplates] = useState('');
	const [tempId, setTempId] = useState('');
	const [isMulti, setIsMulti] = useState(false);
	const [isDefaultPage2, setIsDefaultPage2] = useState(true);
	const [foundTemplate, setFoundTemplate] = useState(false);
	const [install, setInstall] = useState(false);
	const [iconURL, setIconURL] = useState('');
	const [loggedIn, setLoggedIn] = useState(false);
	
	const handleLogIn = async() => {
		if (loggedIn) {
			return;
		}
		const now = new Date();
		const { data: items, errors } = await client.models.Log.create ({
			userName: props.userId,
			content: 'Logging App Login',
			detail: '',
			refDoc: null,
			transactionDate: now,
			refDate: now,
		});
		if (errors) {
			console.log('Cant create login log entry: ', errors);
		}
	}

	const handleLogOut = async() => {
		const now = new Date();
		const { data: items, errors } = await client.models.Log.create ({
			userName: props.userId,
			content: 'Logging App Logout',
			detail: '',
			refDoc: null,
			transactionDate: now,
			refDate: now,
		});
		if (errors) {
			console.log('Cant create logout log entry: ', errors);
		}
	}

	const handleTemplateAssign = async(loggingApp, tempId) => {

		const now = new Date();
		const { data: items, errors } = await client.models.Log.create ({
			userName: props.userId,
			content: 'Logging App Assignment',
			detail: loggingApp,
			refDoc: tempId,
			transactionDate: now,
			refDate: now,
		});
		if (errors) {
			console.log('Cant create logApp assignment log entry: ', errors);
		}
	}

	const handleVerifiedDate = async(id) => {
		const now = new Date();
		const currentDateTime = now.toLocaleString();
	
	   const { errors, data: updatedTemplatePermission} = await client.models.template_permissions.update({ 
			id: id,
			verified_date: now });
		if (errors) {
		  alert(errors[0].message);
		}
	  }

	const handleInstall = () => {
		setInstall(true);
	}

	function translateUserTemplate (item) {
		const data = [{id: item.id, 
		  templateUserId: item.template_user_id,
		  templateId: item.template_id,
		  title: item.title,
		  preLoadPageAttributes: item.pre_load_page_attributes, 
		  postLoadPageAttributes: item.post_load_page_attributes,
		  enabledDate: item.enabled_date, 
		  verifiedDate: item.verified_date, 
		  emailAddress: props.userId,
		  usePagination: item.use_pagination,
		  useAutoSpacing: item.auto_space,
		  useBoxControls: item.box_controls}];
		return data;
	}
	
	function translateUserTemplates (items) {
		const item = JSON.parse(items[0]);
		var templateIdAndTitle = item.template_id + "!" + item.title;
		for (var i=1; i < items.length; i++) {
			const nextItem = JSON.parse(items[i]);
			templateIdAndTitle = templateIdAndTitle + "|" + nextItem.template_id + "!" + nextItem.title;
		}
		setTemplates(templateIdAndTitle);
	  }

	const getQuestionsByTemplate = async (tempId, isRefresh, templateName) => {
		const { data: items, errors } = await client.queries.listQuestionsByTemplateId({
		  templateId: tempId
		});
		if (errors) {
		  alert(errors[0].message);
		  return;
		}
		setTemplateQuestion(items);
		if (isRefresh) {
			setFoundTemplate(true);
			handleTemplateAssign(templateName, tempId);
		}
	};

	const getUserPageDetails = async (emailAddress) => {
		const { data: items, errors } = await client.queries.listUserTemplates({
		  email: emailAddress,
		})
		if (errors) {
			alert(errors[0].message);
		} else {
			if (Array.isArray(items) && items.length > 0) {
				const db = JSON.stringify(items);
				const userItems = JSON.parse(db);
				if (items.length < 2) {
				  const firstItem = JSON.parse(userItems[0]);
				// first update verified date if necessary..also this path is only one template
				  if (!firstItem.verified_date) {
					handleVerifiedDate(firstItem.template_user_id);
				  }
				  setPreLoadPage(firstItem.pre_load_page_attributes);
				  setPostLoadPage(firstItem.post_load_page_attributes);
				  setTempId(firstItem.template_id);
				  // note:  change view listuserTemplates to return live_date and use that field
				  setIsDefaultPage(false);
				  setIsDefaultPage2(true);
				  setUserData(translateUserTemplate (firstItem));
				  getQuestionsByTemplate(firstItem.template_id, false, firstItem.title);
				  setFoundTemplate(true);
				} else {
				// here we have multiple templates...need to show list of templates to choose.
				//  setUserData(translateUserTemplate (userItems))
				  const firstItem = JSON.parse(userItems[0]);
				  translateUserTemplates(userItems);
				  setIsMultiTemplates(true);
				  setIsMulti(true);
				  for (var i=0; i < items.length; i++) {
					const item = JSON.parse(items[i]);
					if (item.template_id == firstItem.template_id) {
						if (!item.verified_date) {
							handleVerifiedDate(item.template_user_id);
						}
						setPreLoadPage(item.pre_load_page_attributes);
						setPostLoadPage(item.post_load_page_attributes);
						setTempId(firstItem.template_id);
						// note:  change view listuserTemplates to return live_date and use that field
						setIsDefaultPage(false);
						setIsDefaultPage2(true);
						setUserData(translateUserTemplate (item))	
						getQuestionsByTemplate(firstItem.template_id, false, firstItem.title);
						return;						
					}
				  }
				}
			}
		}
	};

	const getUserPageDetailsByTemplate = async (emailAddress, templateId) => {
		const { data: items, errors } = await client.queries.listUserTemplatesByTemplateId({
		  email: emailAddress,
		  templateId: templateId
		})
		if (errors) {
			alert(errors[0].message);
		} else {
			if (Array.isArray(items) && items.length > 0) {
				const db = JSON.stringify(items);
				const userItems = JSON.parse(db);
				const item = JSON.parse(items[0]);
				if (!item.verified_date) {
					handleVerifiedDate(item.template_user_id);
				}
				setPreLoadPage(item.pre_load_page_attributes);
				setPostLoadPage(item.post_load_page_attributes);
				setTempId(templateId);
				// note:  change view listuserTemplates to return live_date and use that field
				setIsDefaultPage(false);
				setIsDefaultPage2(true);
				setUserData(translateUserTemplate (item))	
				getQuestionsByTemplate(templateId, true, item.title);				
			}
		}
	};

	const monitorDownloadIcon = async() => {
		const downloadResult = await downloadData({
				path: "picture-submissions/icon/Logit-Pro-Checkmark.png"
			}).result;
		const myFile = await downloadResult.body.blob();
		setIconURL(URL.createObjectURL(myFile));
	  }
	
	  const handleS3Icon = async() => {
		await monitorDownloadIcon();
	  }

	useEffect(() => {
	  handleLogIn();
	  setLoggedIn(true);
	  getUserPageDetails(props.userId);
	  handleS3Icon();
	  if (reload) {
		window.location.reload();
	  }
	}, [reload]);

  const handleOnSignOut = (e) => {
	handleLogOut();
    props.onSubmitChange(false);
  };

  const handleReload = () => {
	setReload(true);
  }
  
  const handleOnTemplate = (e) => {
	setFoundTemplate(false);
	setIsMultiTemplates(false);
	getUserPageDetailsByTemplate(props.userId, e);
  }

  const handleSubmit = (e) => {
	if (isDefaultPage && isDefaultPage2) {
		props.onSubmitChange(false);
		return;
	}
	if (!isDefaultPage) {
		setIsDefaultPage2(false);
		setIsDefaultPage(true);
	} else {
		setIsDefaultPage2(true);
		setIsDefaultPage(false);
	}
  }

  const handleSwitchProgram = (e) => {
	if (isMulti) {
		setIsMultiTemplates(true);
	}
  }

  return (
    <main>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
		<div className="topnav">
  	  		<a href="#home" className="active">
				<img src={iconURL} alt="Logit-app" width="30" height="30" onClick={handleReload}/>
				<IconButton aria-label="install" onClick={handleInstall}><InstallMobileIcon /></IconButton>
				{isMulti &&
				<Tooltip title="Pop up program selection dialog to change view." placement="bottom">
					<IconButton aria-label="programs" onClick={handleSwitchProgram}><ListAltIcon /></IconButton>
				</Tooltip>}User
	    		<div className="rightText">
				({props.userId}) 
				<Tooltip title="Log out of the program." placement="bottom"><IconButton aria-label="logout" onClick={handleOnSignOut}><LogoutIcon /></IconButton></Tooltip>
	   			</div>
	  		</a>
		</div>
		{install && <AddToHomeScreen skipFirstVisit={false} /> }
		{isMultiTemplates && <PopupTemplate theTemplates={templates} onSelectTemplate={handleOnTemplate}/> }
	  {	foundTemplate && !isDefaultPage && templateQuestion && templateQuestion.length > 0 && <DisplayUser 
	  		userId={props.userId} 
			templateId={tempId} 
			userData={userData} 
			transaction={uuidv4()}
			what3wordsAPI={props.what3words}
			templateQuestions={templateQuestion} 
	  	preLoadAttributes={preLoadPage} postLoadAttributes={postLoadPage} onSubmitChange={handleSubmit}/>}
		{foundTemplate && !isDefaultPage2 && templateQuestion && templateQuestion.length > 0 && <DisplayUser 
			userId={props.userId} 
			templateId={tempId} 
			userData={userData} 
			transaction={uuidv4()}
			what3wordsAPI={props.what3words}
			templateQuestions={templateQuestion} 
	  	preLoadAttributes={preLoadPage} postLoadAttributes={postLoadPage} onSubmitChange={handleSubmit}/>}
    </main> 
  );
}
