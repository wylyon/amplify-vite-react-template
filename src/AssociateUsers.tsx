// @ts-nocheck
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { v4 as uuidv4 } from 'uuid';

export default function AssociateUsers(props) {

  const [userData, setUserData] = useState([{
    id: '',   
    firstName: '',
    lastName: '',
    templateUserId: props.id,
    enabledDate: '',
    verifiedDate: '',
    emailAddress: '',
  }]);

  const [userDataArr, setUserDataArr] = useState([]);
  const client = generateClient<Schema>();
  const [filtered, setFiltered] = useState('');
  const [templatePermissions, setTemplatePermissions] = useState<Schema["template_permissions"]["type"][]>([]);

  function translateUserPermission (item) {
    const data = [{id: item.id, firstName: item.first_name, lastName: item.last_name, templateUserId: item.template_user_id,
      enabledDate: item.enabled_date, verifiedDate: item.verified_date, emailAddress: item.email_address}];
    return data;
  }

  function translateUserPermissions (items) {
    var data = [{id: item[0].id, 
      firstName: item[0].first_name, 
      lastName: item[0].last_name, 
      templateUserId: item[0].template_user_id,
      enabledDate: item[0].enabled_date, 
      verifiedDate: item[0].verified_date, 
      emailAddress: item[0].email_address}];
    for (i=1; i < items.length; i++) {
      data.push(
        {id: item[i].id, 
          firstName: item[i].first_name, 
          lastName: item[i].last_name, 
          templateUserId: item[i].template_user_id,
          enabledDate: item[i].enabled_date, 
          verifiedDate: item[i].verified_date, 
          emailAddress: item[i].email_address}
      );
    }
    return data;
  }

  const getPermissionsByDivisionTemplate = async (divId, tempId) => {
    const { data: items, errors } = await client.queries.listUserTemplatePermissions({
      divisionId: divId,
      templateId: tempId,
    })
    if (Array.isArray(items) && items.length > 0) {
      const userItems = JSON.parse(items);
      if (items.length < 2) {
        setUserData(translateUserPermission (userItems))
      } else {
        setUserData(translateUserPermissions (userItems));
      }
    }
  };

  useEffect(() => {
    getPermissionsByDivisionTemplate(props.divisionId, props.id);
  }, []);

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleOnDelete = async(id, activeDate) => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();
    const isNull = (!activeDate);

   const { errors, data: updatedTemplatePermission} = await client.models.template_permissions.update({ 
	    id: id,
	    enabled_date: (isNull) ? now : null});
    if (errors) {
      alert(errors[0].message);
    }
    getPermissionsByDivisionTemplate(props.divisionId, props.id);
  }

  const handleAddUser = async(userId, templateUserId) => {
    const now = new Date();
    const uuid = uuidv4();
    if (!templateUserId) {
      const { errors, data: newTemplatePermission } = await client.models.template_permissions.create({ 
	      id: uuid,
	      template_id: props.id,
        user_id: userId,
        enabled_date: now,
	      created: now,
	      created_by: 0});
      if (errors) {
        alert(errors[0].message);
      }
    } else {
      const { errors, data: deletedTemplatePermission } = await client.models.template_permissions.delete({
        id: templateUserId
      });
      if (errors) {
        alert(errors[0].message);
      }
    }
    getPermissionsByDivisionTemplate(props.divisionId, props.id);
  }

  const filter = userData.filter(comp => comp.id != '');

  return (
    <div className="addTemplateData">
      <h3 align="center">{props.name} Template Users</h3>
      <button className="cancelUserButton" onClick={handleOnCancel}>Cancel</button>
      <table>
	    <thead>
	      <tr>
	        <th>Id</th>
	        <th>Name</th>
	        <th>In/Out</th>
	        <th>Enabled</th>
          <th>Verified</th>
	      </tr>
	    </thead>
	    <tbody>
	      {filter.map(comp => <tr key={comp.id}>
	        <td>{comp.emailAddress}</td>
	        <td>{comp.firstName + " " + comp.lastName}</td>
	        <td ><button className={(!comp.templateUserId) ? "activateButton" : "cancelButton"}
		        onClick={() => handleAddUser(comp.id, comp.templateUserId)}>{(!comp.templateUserId) ? "Add User To Template" : 
            "Delete User From Template"}</button></td>
          {!comp.templateUserId ? <td>{comp.enabledDate}</td> : 
            <td><button className={(!comp.enabledDate) ? "activateButton" : "cancelButton"}
            onClick={() => handleOnDelete(comp.templateUserId, comp.enabledDate)}>{(!comp.enabledDate) ? "Activate" : "DeActivate"}</button></td>}
          <td>{comp.verifiedDate}</td>
	      </tr>)}
	    </tbody>
	  </table>

    </div>
  );
}