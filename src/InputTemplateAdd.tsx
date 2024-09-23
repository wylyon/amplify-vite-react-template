// @ts-nocheck
import { useState } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { v4 as uuidv4 } from 'uuid';

export default function InputTemplateAdd(props) {
  const [formData, setFormData] = useState({
    id: props.updateFormData.id,  
    divisionId: props.updateFormData.divisionId,
    title: props.updateFormData.title,
    description: props.updateFormData.description,
    preLoadPage: props.updateFormData.preLoadPage,
    postLoadPage: props.updateFormData.postLoadPage,
    liveDate: props.updateFormData.liveDate,
    prodDate: props.updateFormData.prodDate,
    notes: props.updateFormData.notes
  });

  const client = generateClient<Schema>();
  const [template, setTemplate] = useState<Schema["template"]["type"][]>([]);
  const [isNew, setIsNew] = useState(false);
  const [isGoAdd, setIsGoAdd] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [html, setHtml] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const createTemplate = async() => {
    const now = new Date();
    const uuid = uuidv4();
    const { errors, data: newTemplate } = await client.models.template.create({ 
	    id: uuid,
	    division_id: formData.divisionId,
      title: formData.title,
      description: formData.description,
      pre_load_page_attributes: formData.preLoadPage,
      post_load_page_attributes: formData.postLoadPage,
      live_date: formData.liveDate == '' ? null : formData.liveDate,
      prod_date: formData.prodDate == '' ? null : formData.prodDate,
      notes: formData.notes,
	    created: now,
	    created_by: 0});
    if (errors) {
      alert(errors[0].message);
    }
  }

  const updateTemplate = async() => {
    const now = new Date();
    const { errors, data: updateData } = await client.models.template.update({ 
	    id: props.updateFormData.id,
      title: formData.title,
      description: formData.description,
      pre_load_page_attributes: formData.preLoadPage,
      post_load_page_attributes: formData.postLoadPage,
      live_date: formData.liveDate,
      prod_date: formData.prodDate,
      notes: formData.notes});
    if (errors) {
      alert(errors[0].message);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (props.isAddMode || isGoAdd) {
      createTemplate();
      props.onSubmitAdd(false);
    } else {
      updateTemplate();
      props.onSubmitChange(false);
    }
  };

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  const handlePreview = (e) => {
    alert("Preview Page Here.");
  };

  return (
    <div className="addTemplateData">
      <form onSubmit={handleSubmit}>
      <label>Title:  </label>
        <input
          type="text"
	        name="title"
          required
	        placeholder="Template Title"
	        size="80"
          value={isNew ? '' : formData.title}
          onChange={handleChange}
        /><br />
      <div className="grid-template">
        <label>Description:</label>  
        <label>Pre-Load-Page HTML:</label>
        <label>Post-load-page HTML:</label>
        <label></label>
        <textarea
	        name="description"
          value={isNew ? '' : formData.description}
          rows="3"
          onChange={handleChange}
        />
        <textarea
	        name="preLoadPage"
	        placeholder="Pre Load Page HTML"
          value={isNew ? '' : formData.preLoadPage}
          rows="7"
          onChange={handleChange}
        />
        <textarea
	        name="postLoadPage"
	        placeholder="Post Load Page HTML"
          value={isNew ? '' : formData.postLoadPage}
          rows="7"
          onChange={handleChange}
        />
        <div>
          <label>Live Date:</label>        
          <input
            type="date"
	          name="liveDate"
	          placeholder="Live Date"
	          size="20"
            value={isNew ? '' : formData.liveDate}
            onChange={handleChange}
          /><br />
          <label>Prod Date: </label>
          <input
            type="date"
	          name="prodDate"
	          placeholder="Prod Date"
	          size="20"
            value={isNew ? '' : formData.prodDate}
            onChange={handleChange}
          /><br /><label>       </label>
	        <div className="button-container">
  	        <button type="submit" style={{ margin: '8px 5px', padding: '5px' }}>{props.isAddMode || isGoAdd ? "Add" : "Update"}</button>
	          <button className="cancelButton" onClick={handleOnCancel}>Cancel</button>
            <button className="activateButton" onClick={handlePreview}>Preview</button>
	        </div>         
        </div>
      </div>
      <br />
	      <label>Notes: </label>
	        <input type="text"
	          name="notes"
	           placeholder="Notes for this Template"
	          size="100"
	          value={isNew ? '' : formData.notes}
	          onChange={handleChange}
	      />
      </form>
     </div>
  );
}