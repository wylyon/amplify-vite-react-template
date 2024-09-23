// @ts-nocheck
import { useState, useEffect  } from "react";

export default function SelectTemplate(props) {

  const [selectTemplate, setSelectTemplate] = useState('');
  const [arrayTemplates, setArrayTemplates] = useState([]);

  const handleSelectChange = (e) => {
    setSelectTemplate(e.target.value);
    props.onSelectTemplate(e.target.value);
  };

  useEffect(() => {
	  const arrTemplates = props.theTemplates.split("|");
    setArrayTemplates(arrTemplates);
	}, []);

  return (
      <div className="inputProgram">
        <label htmlFor="templateToUse"><b>Program:</b></label>
        <select name="templateToUse" id="templateToUse" onChange={handleSelectChange}> 
          <option key="0" value=''></option>
          { arrayTemplates.map(comp => 
            <option key={comp.split("!")[0]} value={comp.split("!")[0]}>{comp.split("!")[1]}</option>
          )}
        </select>
      </div>
  );
}