
// @ts-nocheck
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition

export default function SelectDivision(props) {
  const client = generateClient<Schema>();
  const [division, setDivision] = useState<Schema["division"]["type"][]>([]);

  const getDivisionByCompanyId = async (companyId) => {
    const { data: items, errors } = await client.models.division.list();
    const filteredItems = items.filter(comp => comp.company_id.includes(companyId));
    setDivision(filteredItems);
  };

  useEffect(() => {
    getDivisionByCompanyId(props.companyId);
  }, []);

  const [selectedDivision, setSelectedDivision] = useState('');

  const handleSelectChange = (e) => {
    setSelectedDivision(e.target.value);
    props.onSelectDivision(e.target.value);
  };

  return (
    <div>
      <label htmlFor="divisionToUse"><b>Division:</b></label>
	<select name="divisionToUse" id="divisionToUse" onChange={handleSelectChange}> 
	  {division != null ? <option key="0" value=''></option> : null}
	  {division != null && division.map(comp => (!comp.deactive_date) ? 
	    (<option key={comp.name + "|" + comp.id} value={comp.name + "|" + comp.id}>{comp.name}</option>) : null)}
	</select>
    </div>
  );
}