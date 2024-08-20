
// @ts-nocheck
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition

export default function SelectCustomer(props) {
  const client = generateClient<Schema>();
  const [company, setCompany] = useState<Schema["company"]["type"][]>([]);

  useEffect(() => {
    const sub = client.models.company.observeQuery().subscribe({
      next: (data) => setCompany([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  const [selectedCompany, setSelectedCompany] = useState('');

  const handleSelectChange = (e) => {
    setSelectedCompany(e.target.value);
    props.onSelectCompany(e.target.value);
  };

  return (
    <div>
      <label htmlFor="companyToUse"><b>Company:</b></label>
	<select name="companyToUse" id="companyToUse" onChange={handleSelectChange}> 
	  {props.selected != "All" ? <option key="{props.selected}" value="{props.selected}" selected>{props.selected}</option> : null}
	  <option key="All" value="All">All</option>
	  {company.map(comp => (!comp.deactive_date) ? 
	    (<option key={comp.name + "|" + comp.id} value={comp.name + "|" + comp.id}>{comp.name}</option>) : null)}
	</select>
    </div>
  );
}