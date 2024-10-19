// @ts-nocheck
import { useState } from "react";
import React from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { v4 as uuidv4 } from 'uuid';
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';

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
    notes: props.updateFormData.notes,
    usePagination: props.updateFormData.usePagination,
    useAutoSpace: props.updateFormData.useAutoSpace,
    useBoxControls: props.updateFormData.useBoxControls
  });

  const client = generateClient<Schema>();
  const [template, setTemplate] = useState<Schema["template"]["type"][]>([]);
  const [isNew, setIsNew] = useState(false);
  const [isGoAdd, setIsGoAdd] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [html, setHtml] = useState('');
  const [preview, setPreview] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [severity, setSeverity] = useState('error');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePaginationCheckChange = (e) => {
    setFormData({
      id: formData.id,  
      divisionId: formData.divisionId,
      title: formData.title,
      description: formData.description,
      preLoadPage: formData.preLoadPage,
      postLoadPage: formData.postLoadPage,
      liveDate: formData.liveDate,
      prodDate: formData.prodDate,
      notes: formData.notes,
      usePagination: e.target.checked,
      useAutoSpace: formData.useAutoSpace,
      useBoxControls: formData.useBoxControls,
    })
  }

  const handleAutoSpaceCheckChange = (e) => {
    setFormData({
      id: formData.id,  
      divisionId: formData.divisionId,
      title: formData.title,
      description: formData.description,
      preLoadPage: formData.preLoadPage,
      postLoadPage: formData.postLoadPage,
      liveDate: formData.liveDate,
      prodDate: formData.prodDate,
      notes: formData.notes,
      usePagination: formData.usePagination,
      useAutoSpace: e.target.checked,
      useBoxControls: formData.useBoxControls,
    })
  }

  const handleBoxControlsCheckChange = (e) => {
    setFormData({
      id: formData.id,  
      divisionId: formData.divisionId,
      title: formData.title,
      description: formData.description,
      preLoadPage: formData.preLoadPage,
      postLoadPage: formData.postLoadPage,
      liveDate: formData.liveDate,
      prodDate: formData.prodDate,
      notes: formData.notes,
      usePagination: formData.usePagination,
      useAutoSpace: formData.useAutoSpace,
      useBoxControls: e.target.checked,
    })
  }
  const handleClickOpenPreview = (e) => {
    e.preventDefault();
    setPreview(true);
    return false;
  }

  const handlePreviewClose = () => {
    setPreview(false);
  }

  function createMarkup(dirty) {
    return { __html: dirty };
    }

  const createTemplate = async() => {
    const now = new Date();
    const uuid = uuidv4();
    setAlertMessage("created new template.");
    setSeverity('success');
    setIsAlert(true);  
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
      use_pagination: (formData.usePagination ? 1 : 0),
      auto_space: (formData.useAutoSpace ? 1 : 0),
      box_controls: (formData.useBoxControls ? 1 : 0),  
	    created: now,
	    created_by: 0});
    if (errors) {
      setAlertMessage(errors[0].message);
      setSeverity('error');
      setIsAlert(true);     
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
      notes: formData.notes,
      use_pagination: (formData.usePagination ? 1 : 0),
      auto_space: (formData.useAutoSpace ? 1 : 0),
      box_controls: (formData.useBoxControls ? 1 : 0)
      });
    if (errors) {
      setAlertMessage(errors[0].message);
      setSeverity('error');
      setIsAlert(true);     
    } else {
      setAlertMessage("updated template.");
      setSeverity('success');
      setIsAlert(true);     
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
    props.onSubmitCancel(false);
  };

  const handleOnAlert = (e) => {
    setIsAlert(false);
    setSeverity('error');
    setAlertMessage('');
  }

  return (
    <React.Fragment>
    <Dialog
    open={preview}
    onClose={handlePreviewClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">
      {"Preview of Template Pre-Post Page HTML"}
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        <div dangerouslySetInnerHTML={createMarkup(formData.preLoadPage + formData.postLoadPage)} />
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handlePreviewClose} autoFocus>
        Close
      </Button>
    </DialogActions>
  </Dialog>
    <div className="addTemplateData">
    {isAlert &&  <Alert severity={severity} onClose={handleOnAlert}>
      {alertMessage}
      </Alert>}
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
            <button className="activateButton" onClick={handleClickOpenPreview}>Preview Pre-Post html</button>
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
	      /><br /><br />
        <label>Use Pagination</label>
          <input type="checkbox"
            name="usePagination"
            placeholder="Select if you want paging"
            value={isNew ? false : formData.usePagination}
            checked={isNew ? false : formData.usePagination}
            onChange={handlePaginationCheckChange}
          />&emsp;&emsp;
        <label>Use Auto Spacing on Controls</label>
          <input type="checkbox"
            name="useAutoSpace"
            placeholder="Select if you want auto spacing controls"
            value={isNew ? false : formData.useAutoSpace}
            checked={isNew ? false : formData.useAutoSpace}
            onChange={handleAutoSpaceCheckChange}
          />&emsp;&emsp;
        <label>Use Boxing around Controls</label>
          <input type="checkbox"
            name="useBoxControls"
            placeholder="Select if you want auto boxing of controls"
            value={isNew ? false : formData.useBoxControls}
            checked={isNew ? false : formData.useBoxControls}
            onChange={handleBoxControlsCheckChange}
          />
      </form>
     </div>
     </React.Fragment>
  );
}