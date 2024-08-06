// @ts-nocheck
import { useState, useEffect, CSSProperties} from "react";
import BeatLoader from 'react-spinners/BeatLoader';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import InputAdminAdd from '../src/InputAdminAdd';
export default function InputAdmin(props) {
  const [formData, setFormData] = useState({
    id: '',   
    email: '',
    companyId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    activeDate: ''
  });
  const [isUpdateAdmin, setIsUpdateAdmin] = useState(false);
  const [isUpdateAdmin2, setIsUpdateAdmin2] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [filtered, setFiltered] = useState('');

  const client = generateClient<Schema>();
  const [admin, setAdmin] = useState<Schema["admin"]["type"][]>([]);

  useEffect(() => {
    const sub = client.models.admin.observeQuery().subscribe({
      next: (data) => setAdmin([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  var numberRows = 0;
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createAdmin();
    props.onSubmitChange(false);
  };

  function toggleAdmin() {
    if (!isUpdateAdmin && !isUpdateAdmin2) {
      setIsUpdateAdmin((isUpdateAdmin) => ! isUpdateAdmin);
    }
    if (isUpdateAdmin && !isUpdateAdmin2) {
      setIsUpdateAdmin2((isUpdateAdmin2) => ! isUpdateAdmin2);
      setIsUpdateAdmin((isUpdateAdmin) => ! isUpdateAdmin);
    }
    if (!isUpdateAdmin && isUpdateAdmin2) {
      setIsUpdateAdmin2((isUpdateAdmin2) => ! isUpdateAdmin2);
      setIsUpdateAdmin((isUpdateAdmin) => ! isUpdateAdmin);
    }
  }

  function setCurrent(updateFormData) {
    const data = {id: updateFormData.id, email: updateFormData.email_address,
        companyId: updateFormData.company_Id, companyName: updateFormData.company_name, firstName: updateFormData.first_name, lastName: updateFormData.last_name, 
	middleName: updateFormData.middle_name, activeDate: updateFormData.active_date};
    {toggleAdmin()};
    setFormData(data);
  }

  const filter = admin.filter(comp => comp.email_address.includes(filtered) || 
    comp.first_name.includes(filtered) ||
    comp.last_name.includes(filtered));

  const handleOnDelete = async(id, deactiveDate) => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();
    const isNull = (!deactiveDate);

    await client.models.admin.update({ 
	id: id,
	deactive_date: (isNull) ? now : null});
  }

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleTheChange = (e) => {
    setIsUpdateAdmin(false);
  }

  function setRowChange () {
    if (rowCount < 1) {
      setRowCount(admin.length);
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setFiltered(e.target.value );
  };

  const handleReset = (e) => {
    setFiltered('');
  }
  
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#0E4D92");

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(admin);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Buffer to store the generated Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(blob, "data.xlsx");
  };

  return (
    <div className="inputCustomerData">
      <h1 align="center">Admin Maintenance</h1>
      <p className="rowCountText">{rowCount} rows  <i className="fa fa-download" style={{fontSize:24}}  onClick={exportToExcel} />
	<input
          type="text"
	  name="filter"
	  placeholder="Filter Email or Name Results"
	  size="30"
          value={filtered}
	  onChange={handleChange}/><button onClick={handleReset}>Reset</button></p>
      <div className="showCustomerData">
      {(admin.length > 0 && <BeatLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={50}
        aria-label="Loading Spinner"
        data-testid="loader"
      />)}
	<table>
	  <thead>
	    <tr>
	      <th>Id</th>
	      <th>Email</th>
	      <th>Company</th>
	      <th>Name</th>
	      <th>Active</th>
	      <th className="colD">DeActivate</th>
	    </tr>
	  </thead>
	  <tbody>
	  {filter.map(comp => <tr
	    key={comp.id}>
	    <td><a href="#" onClick={() => setCurrent(comp)}>{comp.id.substr(0,14) + '...'}{setRowChange ()}</a></td>
	    <td>{comp.email_address}</td>
	    <td>{comp.company_name}</td>
	    <td>{comp.first_name} {comp.middle_name} {comp.last_name}</td>
	    <td>{comp.active_date}</td>
	    <td className="colD"><button className={(!comp.deactive_date) ? "cancelButton" : "activateButton"}
		onClick={() => handleOnDelete(comp.id, comp.deactive_date)}>{(!comp.deactive_date) ? "DeActivate" : "Activate"}</button></td>
	  </tr>)}
	  </tbody>
	</table>
      </div>
      <InputAdminAdd props={props} onSubmitChange={handleOnCancel} onChange={handleTheChange} updateFormData = {formData} isAddMode = {true}/>
      {isUpdateAdmin && <InputAdminAdd props={props} onSubmitChange={handleOnCancel} updateFormData = {{id: formData.id, email: formData.email,
        companyId: formData.companyId, companyName: formData.companyName, firstName: formData.firstName, lastName: formData.lastName, middleName: formData.middleName, activeDate: formData.activeDate}} isAddMode = {false} />}
      {isUpdateAdmin2 && <InputAdminAdd props={props} onSubmitChange={handleOnCancel} updateFormData = {{id: formData.id, email: formData.email,
        companyId: formData.companyId, companyName: formData.companyName, firstName: formData.firstName, lastName: formData.lastName, middleName: formData.middleName, activeDate: formData.activeDate}} isAddMode = {false} />}
    </div>
  );
}