
// @ts-nocheck
import { useState, useEffect } from "react";
import InputSettings from '../src/InputSettings';
import InputAdmin from '../src/InputAdmin';
import InputCompany from '../src/InputCompany';
import InputCustCompany from '../src/InputCustCompany';
import SelectCustomer from '../src/SelectCustomer';
import InputDivision from '../src/InputDivision';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition

export default function ShowMenu(props) {
  const client = generateClient<Schema>();
  const [company, setCompany] = useState<Schema["company"]["type"][]>([]);
  const [formData, setFormData] = useState({
    id: '',   
    name: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipcode: '',
    ref_department: '',
    notes: '',
  });

  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(props.selectedCompanyId);

  const getCompanyById = async (companyId) => {
    const { data: item, errors } = await client.models.company.get({
	    id: companyId });
    setSelectedCompany(item.name);
  };

  useEffect(() => {
    const sub = client.models.company.observeQuery().subscribe({
      next: (data) => setCompany([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDivisionOpen, setIsDivisionOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isCompanySelected, setIsCompanySelected] = useState(false);

  const handleSelectChange = (e) => {
    setSelectedCompany(e.split("|")[0]);
    setSelectedCompanyId(e.split("|")[1]);
    if (isDivisionOpen) { setIsDivisionOpen((isDivisionOpen) => ! isDivisionOpen) };
if (isCompanySelected) { setIsCompanySelected((isCompanySelected) => ! isCompanySelected) };
  };

  function toggleSettings() {
    if (isCompanyOpen || isCompanySelected) { toggleCompany() };
    setIsSettingsOpen((isSettingsOpen) => ! isSettingsOpen);
  }

  function toggleAdmin() {
    if (isCompanyOpen || isCompanySelected) { toggleCompany() };
    if (isSettingsOpen) { toggleSettings() } ;
    setIsAdminOpen((isAdminOpen) => ! isAdminOpen);
  }

  function toggleDivision() {
    if (isCompanyOpen || isCompanySelected) { toggleCompany() };
    if (isSettingsOpen) { toggleSettings() } ;
    if (isAdminOpen) { toggleAdmin() };
    if (selectedCompany != "All" && selectedCompany != "") {
      setIsDivisionOpen((isDivisionOpen) => ! isDivisionOpen);
    }
  }

  function toggleCompany() {
    if (isSettingsOpen) { toggleSettings() } ;
    if (isAdminOpen) { toggleAdmin() };
    if (selectedCompany != "All" && selectedCompany != "") {
      if (isCompanyOpen) { setIsCompanyOpen((isCompanyOpen) => ! isCompanyOpen) };
      for (let i = 0; i < company.length; i++) {
        if (company[i].name = selectedCompany) {
   	  setFormData(company[i]);
	}
      }
      setIsCompanySelected((isCompanySelected) => ! isCompanySelected);
    } else {
      if (isCompanySelected) { setIsCompanySelected((isCompanySelected) => ! isCompanySelected) };
      setIsCompanyOpen((isCompanyOpen) => ! isCompanyOpen);
    }
  }

  function getCompanyName() {
    (props.selectedCompanyId) ? getCompanyById(props.selectedCompanyId) : null;
    return true;
  }

  return (
    <div>
      {!props.isSuperAdmin && getCompanyName() ? <div>
      <label><b>Company:</b> {selectedCompany}</label></div> : null}
      {props.isSuperAdmin  && <SelectCustomer props={props} selected="All" onSelectCompany={handleSelectChange} /> }
      <div className="grid-container">
  	<div id="nav">
    	  <ul>
      	    <li><a href="index.html">Home</a></li>
      	    <li><a href="about.html">Report</a></li>
      	    <li onClick={toggleCompany}><a href="#">Company</a></li>
	    <li onClick={toggleDivision}><a href="#">
		{(selectedCompany != "All" && selectedCompany != "") ? "Division" : 
		<i>Division</i>}
	      </a></li>
	    <li><a href="#">Users +</a>
		    <ul>
			<li onClick={toggleAdmin}><a href="#">Admin</a></li>
			<li><a href="#">
		{(selectedCompany != "All" && selectedCompany != "") ? "Customer" : 
		<i>Customer</i>}</a></li>
		    </ul>
	    </li>
	    <li><a href="#">
		{(selectedCompany != "All" && selectedCompany != "") ? "Template" : 
		<i>Template</i>}</a></li>
	    <li><a href="about.html">Settings +</a>
		<ul>
		  <li onClick={toggleSettings}><a href="#">Web Access</a></li>
		</ul>
	    </li>
   	  </ul>
  	</div>
	<div>
	  {isSettingsOpen && <InputSettings onSubmitChange={toggleSettings}/>}
	  {isAdminOpen && <InputAdmin onSubmitChange={toggleAdmin} props={props} />}
	  {isCompanyOpen && <InputCompany onSubmitChange={toggleCompany}/>}
	  {isDivisionOpen && <InputDivision onSubmitChange={toggleDivision} props={props} 
		companyId = {selectedCompanyId}
		companyName = {selectedCompany} />}
	</div>
	  {isCompanySelected && <InputCustCompany onSubmitChange={toggleCompany} props={props} 
	    updateFormData = {{id: formData.id, name: formData.name, email: formData.email,
        	address1: formData.address1, address2: formData.address2, city: formData.city, 
		state: formData.state, zipcode: formData.zipcode, ref_department: formData.ref_department, 
		notes: formData.notes}} isAddMode = {false} />}
    </div>
  </div>
  );
}