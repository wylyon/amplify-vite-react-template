
// @ts-nocheck
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { v4 as uuidv4 } from 'uuid';
export default function InputDivisionAdd(props) {
  const [formData, setFormData] = useState({
    id: props.updateFormData.id,
    name: props.updateFormData.name,
    company_id: props.updateFormData.company_id,
    email: props.updateFormData.email,
    address1: props.updateFormData.address1,
    address2: props.updateFormData.address2,
    city: props.updateFormData.city,
    state: props.updateFormData.state,
    zipcode: props.updateFormData.zipcode,
    ref_department: props.updateFormData.ref_department,
    notes: props.updateFormData.notes,
  });

  const client = generateClient<Schema>();
  const [division, setDivision] = useState<Schema["division"]["type"][]>([]);
  const [isNew, setIsNew] = useState(false);
  const [isGoAdd, setIsGoAdd] = useState(false);

  useEffect(() => {
    const sub = client.models.division.observeQuery().subscribe({
      next: (data) => setDivision([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const createDivision = async() => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();

    await client.models.division.create({ 
	id: uuidv4(),
	name: formData.name, 
	company_id: formData.company_id,
	email: formData.email,
	address1: formData.address1,
	address2: formData.address2,
	city: formData.city,
	state: formData.state,
	zipcode: formData.zipcode,
	ref_department: formData.ref_department,
	notes: formData.notes,
	created: now,
	created_by: 0});
  }

  const updateDivision = async() => {
    const now = new Date();
    const currentDateTime = now.toLocaleString();

    await client.models.division.update({ 
	id: props.updateFormData.id,
	name: formData.name, 
	company_id: formData.company_id,
	email: formData.email,
	address1: formData.address1,
	address2: formData.address2,
	city: formData.city,
	state: formData.state,
	zipcode: formData.zipcode,
	ref_department: formData.ref_department,
	notes: formData.notes,
	created: now,
	created_by: 0});
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    (props.isAddMode || isGoAdd) ? createDivision() : updateDivision();
    props.onSubmitChange(false);
  };

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  function resetForm() {
    setIsNew((isNew) => ! isNew);
    setIsGoAdd((isGoAdd) => ! isGoAdd);
  }

  return (
    <div className="addCustomerData">
      <form onSubmit={handleSubmit}>
      <label>
        Name: </label>
        <input
          type="text"
	  name="name"
	  placeholder="Division Name"
	  size="40"
          value={isNew ? '' : formData.name}
          onChange={handleChange} />
      <label>  Email:  </label>
        <input
          type="text"
	  name="email"
	  placeholder="Finance/Billing Email Address"
	  size="40"
          value={isNew ? '' : formData.email}
          onChange={handleChange}
        /><br />
      <label>
        Address:</label><br />
        <input
          type="text"
	  name="address1"
	  placeholder="Physical mailing address"
	  size="45"
          value={isNew ? '' : formData.address1}
          onChange={handleChange}
        /><br />
        <input
          type="text"
	  name="address2"
	  placeholder="Additional address"
	  size="45"
          value={isNew ? '' : formData.address2}
          onChange={handleChange}
        /><br />
	<label>City: </label>
        <input
          type="text"
	  name="city"
	  placeholder="City"
	  size="20"
          value={isNew ? '' : formData.city}
          onChange={handleChange}
        />
	<label>State: </label>
        <input
          type="text"
	  name="state"
	  placeholder="ST"
	  size="2"
          value={isNew ? '' : formData.state}
          onChange={handleChange}
        />
	<label>Zip: </label>
        <input
          type="text"
	  name="zipcode"
	  placeholder="Zipcode"
	  size="10"
          value={isNew ? '' : formData.zipcode}
          onChange={handleChange}
        /><br />
	<label>Dept: </label>
        <input
          type="text"
	  name="department"
	  placeholder="Reference Department"
	  size="40"
          value={isNew ? '' : formData.refdepartment}
          onChange={handleChange}
        />
      <label>. Notes: </label>
	<input type="text" 
	 name="notes" 
	 placeholder="Notes for this entry" 
	 size="80"
	 value={isNew ? '' : formData.notes} 
	 onChange={handleChange} 
	/>
	<div class="button-container">
  	  <button type="submit" style={{ margin: '8px 0', padding: '5px' }}>{props.isAddMode || isGoAdd ? "Add" : "Update"}</button>
	  <button className="cancelButton" onClick={handleOnCancel}>Cancel</button>
	</div>
      </form>
     </div>
  );
}