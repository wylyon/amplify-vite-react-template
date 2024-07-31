
// @ts-nocheck
import { useState, useEffect, CSSProperties} from "react";
import BeatLoader from 'react-spinners/BeatLoader';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import InputCompanyAdd from '../src/InputCompanyAdd';
export default function InputCompany(props) {
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
  const [isUpdateCustomer, setIsUpdateCustomer] = useState(false);
  const [isUpdateCustomer2, setIsUpdateCustomer2] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  const client = generateClient<Schema>();
  const [company, setCompany] = useState<Schema["company"]["type"][]>([]);

  useEffect(() => {
    const sub = client.models.company.observeQuery().subscribe({
      next: (data) => setCompany([...data.items]),
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
    createCompany();
    props.onSubmitChange(false);
  };

  function toggleCompany() {
    if (!isUpdateCustomer && !isUpdateCustomer2) {
      setIsUpdateCustomer((isUpdateCustomer) => ! isUpdateCustomer);
    }
    if (isUpdateCustomer && !isUpdateCustomer2) {
      setIsUpdateCustomer2((isUpdateCustomer2) => ! isUpdateCustomer2);
      setIsUpdateCustomer((isUpdateCustomer) => ! isUpdateCustomer);
    }
    if (!isUpdateCustomer && isUpdateCustomer2) {
      setIsUpdateCustomer2((isUpdateCustomer2) => ! isUpdateCustomer2);
      setIsUpdateCustomer((isUpdateCustomer) => ! isUpdateCustomer);
    }
  }

  function setCurrent(updateFormData) {
    {toggleCompany()};
    setFormData(updateFormData);
  }

  function handleOnDelete(id: string) {
    client.models.company.delete({ id });
    setRowCount(rowCount-1);
  }

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleTheChange = (e) => {
    setIsUpdateCustomer(false);
  }

  function setRowChange () {
    if (rowCount < 1) {
      setRowCount(company.length);
      setLoading(false);
    }
  }
  
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#0E4D92");

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(company);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Buffer to store the generated Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(blob, "data.xlsx");
  };

  return (
    <div className="inputCustomerData">
      <h1 align="center">Company Maintenance</h1>
      <p className="rowCountText">{rowCount} rows  <i className="fa fa-download" style={{fontSize:24}}  onClick={exportToExcel} /></p>
      <div className="showCustomerData">
      {(company.length > 0 && <BeatLoader
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
	      <th>Name</th>
	      <th>Email</th>
	      <th>Address</th>
	      <th>City/State/Zipcode</th>
	      <th className="colD">Delete</th>
	    </tr>
	  </thead>
	  <tbody>
	  {company.map(comp => <tr
	    key={comp.id}>
	    <td><a href="#" onClick={() => setCurrent(comp)}>{comp.id}{setRowChange ()}</a></td>
	    <td>{comp.name}</td>
	    <td>{comp.email}</td>
	    <td>{comp.address1}</td>
	    <td>{comp.city}, {comp.state} {comp.zipcode}</td>
	    <td className="colD"><button className="cancelButton" onClick={() => handleOnDelete(comp.id)}>Delete</button></td>
	  </tr>)}
	  </tbody>
	</table>
      </div>
      <InputCompanyAdd props={props} onSubmitChange={handleOnCancel} onChange={handleTheChange} updateFormData = {formData} isAddMode = {true}/>
      {isUpdateCustomer && <InputCompanyAdd props={props} onSubmitChange={handleOnCancel} updateFormData = {{id: formData.id, name: formData.name, email: formData.email,
        address1: formData.address1, address2: formData.address2, city: formData.city, state: formData.state, zipcode: formData.zipcode,
        ref_department: formData.ref_department, notes: formData.notes}} isAddMode = {false} />}
      {isUpdateCustomer2 && <InputCompanyAdd props={props} onSubmitChange={handleOnCancel} updateFormData = {{id: formData.id, name: formData.name, email: formData.email,
        address1: formData.address1, address2: formData.address2, city: formData.city, state: formData.state, zipcode: formData.zipcode,
        ref_department: formData.ref_department, notes: formData.notes}} isAddMode = {false} />}
    </div>
  );
}