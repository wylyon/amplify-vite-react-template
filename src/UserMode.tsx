
// @ts-nocheck
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import DisplayUser from '../src/DisplayUser';
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
	const [prePostLoadPage, setPrePostLoadPage] = useState('');
	
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
		  preLoadPageAttributes: item.pre_load_page_attributes, 
		  postLoadPageAttributes: item.post_load_page_attributes,
		  enabledDate: item.enabled_date, 
		  verifiedDate: item.verified_date, 
		  emailAddress: props.userId}];
		return data;
	}
	
	function translateUserTemplates (items) {
		var data = [{id: item[0].id, 
			templateUserId: item[0].template_user_id,
			preLoadPageAttributes: item[0].pre_load_page_attributes, 
			postLoadPageAttributes: item[0].post_load_page_attributes,
			enabledDate: item[0].enabled_date, 
			verifiedDate: item[0].verified_date, 
			emailAddress: props.userId}];
		for (i=1; i < items.length; i++) {
		  data.push(
			{id: item[i].id, 
				templateUserId: item[i].template_user_id,
				preLoadPageAttributes: item[i].pre_load_page_attributes, 
				postLoadPageAttributes: item[i].post_load_page_attributes,
				enabledDate: item[i].enabled_date, 
				verifiedDate: item[i].verified_date, 
				emailAddress: props.userId}
		  );
		}
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
				const userItems = JSON.parse(items);
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
				  if (!userItems[0].verified_date) {
					handleVerifiedDate(userItems[0].template_user_id);
				  }
				  if (!(userItems[0].pre_load_page_attributes == "" && userItems[0].post_load_page_attributes == "")) {
					setPrePostLoadPage(renderTemplatePage(userItems[0].pre_load_page_attributes, userItems[0].post_load_page_attributes));
				  }
				  setIsDefaultPage(userItems[0].pre_load_page_attributes == "" && userItems[0].post_load_page_attributes == "")
				  setUserData(translateUserTemplates(userItems));
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
	  {isDefaultPage && <p className="gwd-p-1l8f">Log/Report Capture Tool</p> }
	  {!isDefaultPage && <DisplayUser userId={props.userId} renderContent={prePostLoadPage} />}
    </main> 
  );
}
