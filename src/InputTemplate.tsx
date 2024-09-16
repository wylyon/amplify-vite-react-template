// @ts-nocheck
import { useState, useEffect} from "react";
import { ProgressBar } from 'react-loader-spinner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import InputTemplateAdd from '../src/InputTemplateAdd';
import SelectDivision from '../src/SelectDivision';
import AssociateUsers from "../src/AssociateUsers";

export default function InputTemplate(props) {
  const [formData, setFormData] = useState({
    id: '',   
    divisionId: '',
    title: '',
    description: '',
    preLoadPage: '',
    postLoadPage: '',
    liveDate: '',
    prodDate: '',
    deactiveDate: '',
    notes: ''
  });
  const [isUpdateTemplate, setIsUpdateTemplate] = useState(false);
  const [isUpdateTemplate2, setIsUpdateTemplate2] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [filtered, setFiltered] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [isAssociateUser, setIsAssociateUser] = useState(false);

  const client = generateClient<Schema>();
  const [template, setTemplate] = useState<Schema["template"]["type"][]>([]);

  const getTemplateByDivisionId = async (divisionId) => {
    const { data: items, errors } = await client.models.template.list();
    const filteredItems = items.filter(comp => comp.division_id.includes(divisionId));
    setTemplate(filteredItems);
  };

  useEffect(() => {
  }, []);

  var numberRows = 0;

  const handleSelectChange = (e) => {
    if (e != '') {  
     setSelectedDivision(e.split("|")[0]);
     setSelectedDivisionId(e.split("|")[1]);
     getTemplateByDivisionId(e.split("|")[1]);
    } else {
     setSelectedDivision('');
     setSelectedDivisionId('');   
    }   
  };

  function toggleTemplate() {
    if (!isUpdateTemplate && !isUpdateTemplate2) {
      setIsUpdateTemplate((isUpdateTemplate) => ! isUpdateTemplate);
    }
    if (isUpdateTemplate && !isUpdateTemplate2) {
      setIsUpdateTemplate2((isUpdateTemplate2) => ! isUpdateTemplate2);
      setIsUpdateTemplate((isUpdateTemplate) => ! isUpdateTemplate);
    }
    if (!isUpdateTemplate && isUpdateTemplate2) {
      setIsUpdateTemplate2((isUpdateTemplate2) => ! isUpdateTemplate2);
      setIsUpdateTemplate((isUpdateTemplate) => ! isUpdateTemplate);
    }
  }

  function setCurrent(updateFormData) {
    const data = {id: updateFormData.id, 
      divisionId: updateFormData.division_id,
      title: updateFormData.title, 
      description: updateFormData.description, 
      preLoadPage: updateFormData.pre_load_page_attributes, 
      postLoadPage: updateFormData.post_load_page_attributes, 
	    liveDate: updateFormData.live_date, 
      prodDate: updateFormData.prod_date,
      deactiveDate: updateFormData.deactive_date,
      notes: updateFormData.notes
    };
    {toggleTemplate()};
    setFormData(data);
  }

  const filter = template.filter(comp => comp.title.includes(filtered) || 
    comp.description.includes(filtered));

  const handleOnDelete = async(id, deactiveDate) => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();
    const isNull = (!deactiveDate);

    await client.models.template.update({ 
	    id: id,
	    deactive_date: (isNull) ? now : null});
      getTemplateByDivisionId(selectedDivisionId);
  }

  const handleUpdateOnCancel = (e) => {
    setIsUpdateTemplate(false);
    setIsUpdateTemplate2(false);
    setIsAssociateUser(false);
    getTemplateByDivisionId(selectedDivisionId);
  };

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handleTheChange = (e) => {
    setIsUpdateTemplate(false);
  }

  function setRowChange () {
    if (rowCount < 1) {
      setRowCount(template.length);
      setVisible(false);
    }
  }

  const handleChange = (e) => {
    setFiltered(e.target.value );
  };

  const handleReset = (e) => {
    setFiltered('');
  }

  function handleUsers (title, id) {
    setIsUpdateTemplate(false);
    setIsUpdateTemplate2(false);
    setTemplateName(title);
    setTemplateId(id);
    setIsAssociateUser(true);
  }
  
  let [visible, setVisible] = useState(true);
  let [color, setColor] = useState("#0E4D92");

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Buffer to store the generated Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(blob, "data.xlsx");
  };

  return (
    <div className="inputCustomerData">
      <h1 align="center">{props.companyName} Template Maintenance</h1>
      <p className="rowUserCountText">{rowCount} rows  <i className="fa fa-download" style={{fontSize:24}}  onClick={exportToExcel} />
	<SelectDivision props={props} companyId = {props.companyId} onSelectDivision={handleSelectChange} />
	<input
          type="text"
	  name="filter"
	  placeholder="Filter title, description results"
	  size="30"
          value={filtered}
	  onChange={handleChange}/><button onClick={handleReset}>Reset</button></p>
	{selectedDivisionId == '' && <button className="cancelUserButton" onClick={handleOnCancel}>Cancel</button>}
      <div className="showTemplateData">
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
	      <th>Division</th>
	      <th>Title</th>
	      <th>Live</th>
        <th>Prod</th>
        <th>Users</th>
	      <th className="colD">DeActivate</th>
	    </tr>
	  </thead>
	  <tbody>
	  {filter.map(comp => <tr
	    key={comp.id}>
	    <td><a href="#" onClick={() => setCurrent(comp)}>{comp.id.substr(0,14) + '...'}{setRowChange ()}</a></td>
	    <td>{selectedDivision}</td>
	    <td>{comp.title}</td>
	    <td>{comp.live_date}</td>
      <td>{comp.prod_date}</td>
      <td><button className="activateButton" onClick={() => handleUsers(comp.title, comp.id)}>Maintain Users</button></td>
	    <td className="colD"><button className={(!comp.deactive_date) ? "cancelButton" : "activateButton"}
		onClick={() => handleOnDelete(comp.id, comp.deactive_date)}>{(!comp.deactive_date) ? "DeActivate" : "Activate"}</button></td>
	  </tr>)}
	  </tbody>
	</table>
      </div>
      {isAssociateUser && <AssociateUsers onSubmitChange={handleUpdateOnCancel} name={templateName} id={templateId} divisionId={selectedDivisionId}/>}
      {!isAssociateUser && selectedDivisionId != '' && <InputTemplateAdd props={props} onSubmitChange={handleOnCancel} onChange={handleTheChange} updateFormData = {{id: formData.id, 
        divisionId: selectedDivisionId, 
        title: formData.title,
        description: formData.description,
        preLoadPage: formData.preLoadPage,
        postLoadPage: formData.postLoadPage,
        liveDate: formData.liveDate,
        prodDate: formData.prodDate,
        notes: formData.notes}} isAddMode = {true}/> }
      {isUpdateTemplate && <InputTemplateAdd props={props} onSubmitChange={handleUpdateOnCancel} updateFormData = {{id: formData.id, 
        divisionId: selectedDivisionId, 
        title: formData.title,
        description: formData.description,
        preLoadPage: formData.preLoadPage,
        postLoadPage: formData.postLoadPage,
        liveDate: formData.liveDate,
        prodDate: formData.prodDate,
        notes: formData.notes}} isAddMode = {false} />}
      {isUpdateTemplate2 && <InputTemplateAdd props={props} onSubmitChange={handleUpdateOnCancel} updateFormData = {{id: formData.id, 
        divisionId: selectedDivisionId, 
        title: formData.title,
        description: formData.description,
        preLoadPage: formData.preLoadPage,
        postLoadPage: formData.postLoadPage,
        liveDate: formData.liveDate,
        prodDate: formData.prodDate,
        notes: formData.notes}} isAddMode = {false} />}
    </div>
  );
}