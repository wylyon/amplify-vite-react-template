// @ts-nocheck
import { useState, useEffect} from "react";
import { ProgressBar } from 'react-loader-spinner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import InputUserAdd from '../src/InputUserAdd';
import SelectDivision from '../src/SelectDivision';
import SignUp from '../src/SignUp';
import { resetPassword } from 'aws-amplify/auth';

export default function InputUser(props) {
  const [formData, setFormData] = useState({
    id: '',   
    divisionId: '',
    email: '',
    companyId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    activeDate: '',
    notes: ''
  });
  const [isUpdateUser, setIsUpdateUser] = useState(false);
  const [isUpdateUser2, setIsUpdateUser2] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [filtered, setFiltered] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [isSignUpTime, setIsSignUpTime] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState('');
  const [division, setDivision] = useState<Schema["division"]["type"][]>([]);

  const client = generateClient<Schema>();
  const [user, setUser] = useState<Schema["user"]["type"][]>([]);

  const getUserByDivisionId = async (divId) => {
    const { data: items, errors } = await client.queries.listUserByDivisionId({
      divisionId: divId
    });
    if (errors) {
      alert(errors[0].message);
      return;
    }
    setUser(items);
  };

  const getDivisionByCompanyId = async (compId) => {
    const { data: items, errors } = await client.queries.listDivisionByCompanyId({
      companyId: compId
    });
    if (errors) {
      alert(errors[0].message);
      return;
    }
    setDivision(items);
    if (items.length == 1) {
      setSelectedDivision(items[0].name);
      setSelectedDivisionId(items[0].id);
      getUserByDivisionId(items[0].id);
    }
  };

  useEffect(() => {
    getDivisionByCompanyId(props.companyId);
  }, []);

  var numberRows = 0;

  const handleSelectChange = (e) => {
    if (e != '') {  
     setSelectedDivision(e.split("|")[0]);
     setSelectedDivisionId(e.split("|")[1]);
     getUserByDivisionId(e.split("|")[1]);
    } else {
     setSelectedDivision('');
     setSelectedDivisionId('');   
    }   
  };

  function toggleUser() {
    if (!isUpdateUser && !isUpdateUser2) {
      setIsUpdateUser((isUpdateUser) => ! isUpdateUser);
    }
    if (isUpdateUser && !isUpdateUser2) {
      setIsUpdateUser2((isUpdateUser2) => ! isUpdateUser2);
      setIsUpdateUser((isUpdateUser) => ! isUpdateUser);
    }
    if (!isUpdateUser && isUpdateUser2) {
      setIsUpdateUser2((isUpdateUser2) => ! isUpdateUser2);
      setIsUpdateUser((isUpdateUser) => ! isUpdateUser);
    }
  }

  function setCurrent(updateFormData) {
    const data = {id: updateFormData.id, 
      email: updateFormData.email_address,
      companyId: updateFormData.company_Id, 
      companyName: updateFormData.company_name, 
      firstName: updateFormData.first_name, 
      lastName: updateFormData.last_name, 
	    middleName: updateFormData.middle_name, 
      activeDate: updateFormData.active_date,
      notes: updateFormData.notes};
    {toggleUser()};
    setFormData(data);
  }

  const filter = user.filter(comp => comp.email_address.includes(filtered) || 
    comp.first_name.includes(filtered) ||
    comp.last_name.includes(filtered));

  const handleOnDelete = async(id, deactiveDate) => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();
    const isNull = (!deactiveDate);

    await client.models.user.update({ 
	    id: id,
	    deactive_date: (isNull) ? now : null});
    getUserByDivisionId(selectedDivisionId);
  }

  const handleResetPassword = async(emailAddress) => {
    try {
      const output = await resetPassword({
	username: emailAddress
      });
    } catch (error) {
      alert(error);
    }
  }

  const handleUpdateOnCancel = (e) => {
    setIsUpdateUser(false);
    setIsUpdateUser2(false);
  };

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleSignOnCancel = (e) => {
     setIsSignUpTime(false);
  };

  const handleTheChange = (e) => {
    setIsUpdateUser(false);
  }

  function setRowChange () {
    if (rowCount < 1) {
      setRowCount(user.length);
      setVisible(false);
    }
  }

  const enableSignUp = (emailAddress) => {
    setSignUpEmail(emailAddress);
    setIsSignUpTime(true);
  }

  const resetYourPassword  = (emailAddress) =>  {
     handleResetPassword(emailAddress);
  }

  const handleChange = (e) => {
    setFiltered(e.target.value );
  };

  const handleReset = (e) => {
    setFiltered('');
  }
  
  let [visible, setVisible] = useState(true);
  let [color, setColor] = useState("#0E4D92");

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(user);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Buffer to store the generated Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(blob, "data.xlsx");
  };

  return (
    <div className="inputCustomerData">
      <h1 align="center">User Maintenance</h1>
      <p className="rowUserCountText">{rowCount} rows <i className="fa fa-download" style={{fontSize:24}}  onClick={exportToExcel} />
	<SelectDivision props={props} companyId = {props.companyId} onSelectDivision={handleSelectChange} />
	<input
          type="text"
	  name="filter"
	  placeholder="Filter Email, Name Results"
	  size="30"
          value={filtered}
	  onChange={handleChange}/><button onClick={handleReset}>Reset</button></p>
	{selectedDivisionId == '' && <button className="cancelUserButton" onClick={handleOnCancel}>Cancel</button>}
      <div className="showCustomerData">
      {(filter.length > 0 && <ProgressBar
	visible={visible}
        color={color}
        height="50"
	width="50"
        aria-label="Loading Spinner"
  wrapperStyle={{}}
  wrapperClass=""
      />)}
	<table>
	  <thead>
	    <tr>
	      <th>Id</th>
	      <th>Email</th>
	      <th>Division</th>
	      <th>Name</th>
	      <th>Active</th>
	      <th className="colD">PW</th>
	      <th className="colD">SignUp</th>
	      <th className="colD">DeActivate</th>
	    </tr>
	  </thead>
	  <tbody>
	  {filter.map(comp => <tr
	    key={comp.id}>
	    <td><a href="#" onClick={() => setCurrent(comp)}>{comp.id.substr(0,14) + '...'}{setRowChange ()}</a></td>
	    <td>{comp.email_address}</td>
	    <td>{selectedDivision}</td>
	    <td>{comp.first_name} {comp.middle_name} {comp.last_name}</td>
	    <td>{comp.active_date}</td>
	    <td className="colD"><button className="activateButton" onClick={() => handleResetPassword(comp.email_address)}>Reset</button></td>
	    <td className="colD"><button className="activateButton" onClick={() => enableSignUp(comp.email_address)}>SignUp</button></td>
	    <td className="colD"><button className={(!comp.deactive_date) ? "cancelButton" : "activateButton"}
		onClick={() => handleOnDelete(comp.id, comp.deactive_date)}>{(!comp.deactive_date) ? "DeActivate" : "Activate"}</button></td>
	  </tr>)}
	  </tbody>
	</table>
      </div>
      {selectedDivisionId != '' && <InputUserAdd props={props} onSubmitChange={handleOnCancel} onChange={handleTheChange} updateFormData = {{id: formData.id, email: formData.email,
        companyId: props.companyId, divisionId: selectedDivisionId, firstName: formData.firstName, lastName: formData.lastName, middleName: formData.middleName, 
	activeDate: formData.activeDate}} isAddMode = {true}/> }
      {isUpdateUser && <InputUserAdd props={props} onSubmitChange={handleUpdateOnCancel} updateFormData = {{id: formData.id, email: formData.email,
        companyId: props.companyId, divisionId: selectedDivisionId, firstName: formData.firstName, lastName: formData.lastName, middleName: formData.middleName, 
	activeDate: formData.activeDate, notes: formData.notes}} isAddMode = {false} />}
      {isUpdateUser2 && <InputUserAdd props={props} onSubmitChange={handleUpdateOnCancel} updateFormData = {{id: formData.id, email: formData.email,
        companyId: props.companyId, divisionId: selectedDivisionId, firstName: formData.firstName, lastName: formData.lastName, middleName: formData.middleName, 
	activeDate: formData.activeDate, notes: formData.notes}} isAddMode = {false} />}
      {isSignUpTime && <SignUp email={signUpEmail} onSubmitChange={handleSignOnCancel} /> }
    </div>
  );
}