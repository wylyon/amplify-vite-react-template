
// @ts-nocheck
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
export default function InputSettings(props) {
  const [formData, setFormData] = useState({
    isDisabled: true,
    message: '',
  });
  const client = generateClient<Schema>();
  const [settings, setSettings] = useState<Schema["Settings"]["type"][]>([]);

  useEffect(() => {
    const sub = client.models.Settings.observeQuery().subscribe({
      next: (data) => setSettings([...data.items]),
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

  function deleteEnableDisableSetting(id: string) {
    client.models.Settings.delete({ id })
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    {settings.map( setting => {deleteEnableDisableSetting(setting.id)} )}
    client.models.Settings.create({ content: formData.message, isDisabled: formData.isDisabled });
    props.onSubmitChange(false);
  };

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  return (
    <div className="inputData">
    <form onSubmit={handleSubmit}>
      <h1 align="center">Setting - Web Access</h1>
      <label>
        Disable Website? 
        <input
          type="checkbox"
	  name="isDisabled"
	  placeholder="IsDisabled"
          value={formData.isDisabled}
          onChange={handleChange}
        /><br />
      </label>
      <label>
	Message: 
	<input type="text" 
	 name="message" 
	 placeholder="Message" 
	 size="40"
	 value={formData.message} 
	 onChange={handleChange} 
	/>
	<div class="button-container">
  	  <button type="submit" style={{ margin: '8px 0', padding: '10px' }}>Save</button>
	  <button className="cancelButton" onClick={handleOnCancel}>Cancel</button>
	</div>
      </label>
    </form>
    </div>
  );
}