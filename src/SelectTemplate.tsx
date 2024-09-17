
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
      <label htmlFor="templateToUse"><b>Program:</b></label>
	    <select name="templateToUse" id="templateToUse" onChange={handleSelectChange}> 
	      <option key="0" value=''></option>
	    </select>
    </div>
  );
}