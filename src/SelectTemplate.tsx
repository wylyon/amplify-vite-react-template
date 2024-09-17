// @ts-nocheck
import { useState } from "react";

export default function SelectTemplate(props) {

  const [selectTemplate, setSelectTemplate] = useState('');

  const handleSelectChange = (e) => {
    setSelectedTemplate(e.target.value);
    props.onSelectTemplate(e.target.value);
  };

  return (
    <div>
      <p className="gwd-p-1l8f">Log/Report Capture Tool</p> 
      <label htmlFor="templateToUse"><b>Program:</b></label>
	    <select name="templateToUse" id="templateToUse" onChange={handleSelectChange}> 
	      <option key="0" value=''></option>
        {props.userItems.map(comp => (comp.enabledDate) ? 
	    (<option key={comp.templateId} value={comp.templateId}>{comp.title}</option>) : null) }
	    </select>
    </div>
  );
}