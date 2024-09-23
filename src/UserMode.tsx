
// @ts-nocheck
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import DisplayUser from '../src/DisplayUser';
import SelectTemplate from "../src/SelectTemplate";
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition

export default function UserMode(props) {

	const [userData, setUserData] = useState([{
		id: '',   
		templateUserId: '',
		preLoadPageAttributes: '',
		postLoadPageAttributes: '',
		enabledDate: '',
		verifiedDate: '',
		emailAddress: props.userId,
	}]);
	
	const [userDataArr, setUserDataArr] = useState([]);
	const client = generateClient<Schema>();
	const [filtered, setFiltered] = useState('');
	const [isDefaultPage, setIsDefaultPage] = useState(true);
	const [isMultiTemplates, setIsMultiTemplates] = useState(false);
	const [prePostLoadPage, setPrePostLoadPage] = useState('');
	const [templates, setTemplates] = useState('');
	
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
		  emailAddress: props.userId}];
		return data;
	}
	
	function translateUserTemplates (items) {
		const item = JSON.parse(items[0]);
		var templateIdAndTitle = item.template_id + "!" + item.title;
		var data = [{id: item.id, 
			templateUserId: item.template_user_id,
			templateId: item.template_id,
			title: item.title,
			preLoadPageAttributes: item.pre_load_page_attributes, 
			postLoadPageAttributes: item.post_load_page_attributes,
			enabledDate: item.enabled_date, 
			verifiedDate: item.verified_date, 
			emailAddress: props.userId}];
		for (var i=1; i < items.length; i++) {
			const nextItem = JSON.parse(items[i]);
			templateIdAndTitle = templateIdAndTitle + "|" + nextItem.template_id + "!" + nextItem.title;
		  data.push(
			{id: nextItem.id, 
				templateUserId: nextItem.template_user_id,
				templateId: nextItem.template_id,
				title: nextItem.title,
				preLoadPageAttributes: nextItem.pre_load_page_attributes, 
				postLoadPageAttributes: nextItem.post_load_page_attributes,
				enabledDate: nextItem.enabled_date, 
				verifiedDate: nextItem.verified_date, 
				emailAddress: props.userId}
		  );
		}
		setTemplates(templateIdAndTitle);
		return data;
	  }

	function renderTemplatePage (preLoadPageAttributes, postLoadPageAttributes) {
		return preLoadPageAttributes + postLoadPageAttributes;
	}

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
				  if (!(userItems.pre_load_page_attributes == "" && userItems.post_load_page_attributes == "")) {
					setPrePostLoadPage(renderTemplatePage(userItems.pre_load_page_attributes, userItems.post_load_page_attributes));
				  }
				  setIsDefaultPage(userItems.pre_load_page_attributes == "" && userItems.post_load_page_attributes == "")
				  setUserData(translateUserTemplate (userItems))
				} else {
				// here we have multiple templates...need to show list of templates to choose.
				//  setUserData(translateUserTemplate (userItems))
				  setUserDataArr(translateUserTemplates(userItems));
				  setIsMultiTemplates(true);
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
					  if (!(userItems.pre_load_page_attributes == "" && userItems.post_load_page_attributes == "")) {
						setPrePostLoadPage(renderTemplatePage(userItems.pre_load_page_attributes, userItems.post_load_page_attributes));
					  }
					  setIsDefaultPage(userItems.pre_load_page_attributes == "" && userItems.post_load_page_attributes == "")
					  setUserData(translateUserTemplate (userItems))
				  }
				} else {
					for (var i=0; i < items.length; i++) {
						const item = JSON.parse(items[i]);
						if (item.template_id == templateId) {
							if (!item.verified_date) {
								handleVerifiedDate(item.template_user_id);
							  }
							if (!(item.pre_load_page_attributes == "" && item.post_load_page_attributes == "")) {
								setPrePostLoadPage(renderTemplatePage(item.pre_load_page_attributes, item.post_load_page_attributes));
							} else {
								setPrePostLoadPage("");
							}
							setIsDefaultPage(false);
							setUserData(translateUserTemplate (item))	
							return;						
						}
					}
				}
			}
		}
	};

	useEffect(() => {
	  getUserPageDetails(props.userId);
	}, []);

  const handleOnSignOut = (e) => {
    props.onSubmitChange(false);
  };

  const handleOnTemplate = (e) => {
	getUserPageDetailsByTemplate(props.userId, e);
  }

  return (
    <main>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
		<div className="topnav">
  	  		<a href="#home" className="active"><i className="fa fa-building" style={{fontSize:24}} />User
	    		<div className="rightText">({props.userId}) 
				<i className="fa fa-sign-out" style={{fontSize:24}}  onClick={handleOnSignOut} />
				<span className="fa-solid fa-bars" style={{fontSize:20}}  onClick={handleOnSignOut} >
				</span>
	   			</div>
	  		</a>
		</div>
	  {isMultiTemplates && <SelectTemplate theTemplates={templates} onSelectTemplate={handleOnTemplate}/> }
	  {!isDefaultPage && <DisplayUser userId={props.userId} renderContent={prePostLoadPage} />}
    </main> 
  );
}
