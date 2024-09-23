// @ts-nocheck
import { useState, useEffect} from "react";
import { ProgressBar } from 'react-loader-spinner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import InputDivisionAdd from '../src/InputDivisionAdd';
export default function InputDivision(props) {
  const [formData, setFormData] = useState({
    id: '',   
    company_id: props.companyId,
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
  const [isUpdateDivision, setIsUpdateDivision] = useState(false);
  const [isUpdateDivision2, setIsUpdateDivision2] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  const client = generateClient<Schema>();
  const [division, setDivision] = useState<Schema["division"]["type"][]>([]);

  const getDivisionByCompanyId = async (compId) => {
    const { data: items, errors } = await client.queries.listDivisionByCompanyId({
      companyId: compId
    });
    if (errors) {
      alert(errors[0].message);
      return;
    }
    setDivision(items);
  };

  useEffect(() => {
    getDivisionByCompanyId(props.companyId);
  }, []);

  var numberRows = 0;

  function toggleDivision() {
    if (!isUpdateDivision && !isUpdateDivision2) {
      setIsUpdateDivision((isUpdateDivision) => ! isUpdateDivision);
    }
    if (isUpdateDivision && !isUpdateDivision2) {
      setIsUpdateDivision2((isUpdateDivision2) => ! isUpdateDivision2);
      setIsUpdateDivision((isUpdateDivision) => ! isUpdateDivision);
    }
    if (!isUpdateDivision && isUpdateDivision2) {
      setIsUpdateDivision2((isUpdateDivision2) => ! isUpdateDivision2);
      setIsUpdateDivision((isUpdateDivision) => ! isUpdateDivision);
    }
  }

  function setCurrent(updateFormData) {
    {toggleDivision()};
    setFormData(updateFormData);
  }

  const handleOnDelete = async(id, deactiveDate) => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();
    const isNull = (!deactiveDate);

    await client.models.division.update({ 
	id: id,
	deactive_date: (isNull) ? now : null});
  }

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleUpdateOnCancel = (e) => {
    getDivisionByCompanyId(props.companyId);
    setIsUpdateDivision(false);
    setIsUpdateDivision2(false);
  };

  const handleTheChange = (e) => {
    setIsUpdateCustomer(false);
  }

  function setRowChange () {
    if (rowCount < 1) {
      setRowCount(division.length);
      setLoading(false);
    }
  }

  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#0E4D92");

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(division);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Buffer to store the generated Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(blob, "data.xlsx");
  };

  return (
    <div className="inputCustomerData">

      <h1 align="center">Division Maintenance - {props.companyName}</h1>
      <p className="rowCountText">{rowCount} rows  <i className="fa fa-download" style={{fontSize:24}}  onClick={exportToExcel} /></p>
      <div className="showCustomerData">
      {((division.length > 0) && <ProgressBar
	visible={loading}
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
 	      <th>Company</th>
	      <th>Name</th>
	      <th>Email</th>
	      <th>Address</th>
	      <th>City/State/Zipcode</th>
	      <th className="colD">Delete</th>
	    </tr>
	  </thead>
	  <tbody>
	  {division.map(comp => <tr
	    key={comp.id}>
	    <td><a href="#" onClick={() => setCurrent(comp)}>{comp.id.substr(0,14) + '...'}{setRowChange ()}</a></td>
	    <td>{props.companyName}</td>
	    <td>{comp.name}</td>
	    <td>{comp.email}</td>
	    <td>{comp.address1}</td>
	    <td>{comp.city}, {comp.state} {comp.zipcode}</td>
	    <td className="colD"><button className={(!comp.deactive_date) ? "cancelButton" : "activateButton"}
		onClick={() => handleOnDelete(comp.id, comp.deactive_date)}>{(!comp.deactive_date) ? "DeActivate" : "Activate"}</button></td>
	  </tr>)}
	  </tbody>
	</table>
      </div>
      <InputDivisionAdd props={props} onSubmitChange={handleOnCancel} onChange={handleTheChange} updateFormData = {formData} isAddMode = {true}/>
      {isUpdateDivision && <InputDivisionAdd props={props} onSubmitChange={handleUpdateOnCancel} updateFormData = {{id: formData.id, name: formData.name, company_id: formData.company_id, 
	email: formData.email, address1: formData.address1, address2: formData.address2, city: formData.city, state: formData.state, zipcode: formData.zipcode,
        ref_department: formData.ref_department, notes: formData.notes}} isAddMode = {false} />}
      {isUpdateDivision2 && <InputDivisionAdd props={props} onSubmitChange={handleUpdateOnCancel} updateFormData = {{id: formData.id, name: formData.name, company_id: formData.company_id,
	email: formData.email, address1: formData.address1, address2: formData.address2, city: formData.city, state: formData.state, zipcode: formData.zipcode,
        ref_department: formData.ref_department, notes: formData.notes}} isAddMode = {false} />}
    </div>
  );
}