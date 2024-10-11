
// @ts-nocheck
import React from "react";
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import DisplayUser from '../src/DisplayUser';
import PopupTemplate from "../src/PopupTemplate";
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import LogoDevIcon from '@mui/icons-material/LogoDev';
import Tooltip from '@mui/material/Tooltip';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import usePagination from "@mui/material/usePagination/usePagination";

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

	const getQuestionsByTemplate = async (tempId) => {
		const { data: items, errors } = await client.queries.listQuestionsByTemplateId({
		  templateId: tempId
		});
		if (errors) {
		  alert(errors[0].message);
		  return;
		}
		setTemplateQuestion(items);
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
				// first update verified date if necessary..also this path is only one template
				  if (!userItems.verified_date) {
					handleVerifiedDate(userItems.template_user_id);
				  }
				  setPreLoadPage(userItems.pre_load_page_attributes);
				  setPostLoadPage(userItems.post_load_page_attributes);
				  setTempId(userItems.template_id);
				  // note:  change view listuserTemplates to return live_date and use that field
				  setIsDefaultPage(false);
				  setIsDefaultPage2(true);
				  setUserData(translateUserTemplate (userItems));
				  getQuestionsByTemplate(userItems.template_id);
				} else {
				// here we have multiple templates...need to show list of templates to choose.
				//  setUserData(translateUserTemplate (userItems))
				  const firstItem = JSON.parse(userItems[0]);
				  translateUserTemplates(userItems);
				  setIsMultiTemplates(true);
				  setIsMulti(true);
				  getUserPageDetailsByTemplate(props.userId, firstItem.template_id);
				}
			}
		}
	};

	const getUserPageDetailsByTemplate = async (emailAddress, templateId) => {
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
				// first update verified date if necessary..also this path is only one template
				  if (userItems.template_id == templateId) {
					if (!userItems.verified_date) {
						handleVerifiedDate(userItems.template_user_id);
					}
					setPreLoadPage(userItems.pre_load_page_attributes);
					setPostLoadPage(userItems.post_load_page_attributes);
					setTempId(templateId);
					// note:  change view listuserTemplates to return live_date and use that field
					setIsDefaultPage(false);
					setIsDefaultPage2(true);
					setUserData(translateUserTemplate (userItems))
					getQuestionsByTemplate(templateId);
				  }
				} else {
					for (var i=0; i < items.length; i++) {
						const item = JSON.parse(items[i]);
						if (item.template_id == templateId) {
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
							getQuestionsByTemplate(templateId);
							return;						
						}
					}
				}
			}
		}
	};

	useEffect(() => {
	  getUserPageDetails(props.userId);
	  if (reload) {
		window.location.reload();
	  }
	}, [reload]);

  const handleOnSignOut = (e) => {
    props.onSubmitChange(false);
  };

  const handleReload = () => {
	setReload(true);
  }
  
  const handleOnTemplate = (e) => {
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
				<IconButton aria-label="home" onClick={handleReload}><LogoDevIcon /></IconButton>
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
		{isMultiTemplates && <PopupTemplate theTemplates={templates} onSelectTemplate={handleOnTemplate}/> }
	  {	!isDefaultPage && <DisplayUser userId={props.userId} templateId={tempId} userData={userData} templateQuestions={templateQuestion} 
	  	preLoadAttributes={preLoadPage} postLoadAttributes={postLoadPage} onSubmitChange={handleSubmit}/>}
		{!isDefaultPage2 && <DisplayUser userId={props.userId} templateId={tempId} userData={userData} templateQuestions={templateQuestion} 
	  	preLoadAttributes={preLoadPage} postLoadAttributes={postLoadPage} onSubmitChange={handleSubmit}/>}
    </main> 
  );
}
