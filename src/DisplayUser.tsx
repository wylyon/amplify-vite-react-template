
// @ts-nocheck
import * as React from "react";
import { useState, useEffect } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import { Box } from "@mui/material";
import { Label } from "@mui/icons-material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DisplayUserRow from '../src/DisplayUserRow';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import { disable } from "aws-amplify/analytics";

export default function DisplayUser(props) {
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [theSeverity, setTheSeverity] = useState('error');
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }

  const handleClose = () => {
    setOpen(false);
    props.onSubmitChange(false);
  };
  
  const handleCancel = (e) => {
  
    props.onSubmitChange(false);
  }

  const handleOnSubmitOther = (e) => {

  }

  const handleNextPage = (e) => {
    if (currentPage < props.templateQuestions.filter(comp => !comp.question_type.includes('dialog_input')).length) {
      if (page <= currentPage) {
        setCurrentPage(currentPage+1);
      }
    }
  }

  const handleOnAlert = (e) => {
    setIsAlert(false);
    setAlertMessage('');
    setTheSeverity("error");
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    // get all name/value pairs
    const nameValuePairs = Object.entries(formJson);
    setOpen(true);
    
  };

  function getNonDialogQuestion (index) {
    const limit = props.templateQuestions.length;
    if (index == limit) {
      return props.templateQuestions[index];
    }
    return (props.templateQuestions[index].question_type == 'dialog_input' ? props.templateQuestions[index+1] : props.templateQuestions[index]);
  }

  function getNextQuestion (q) {
    var index = 0;
    for (var i = 0; i<props.templateQuestions.length; i++) {
      if (q.id == props.templateQuestions[i].id) {
        index = i+1;
      }
    }
    const limit = props.templateQuestions.length;
    if (index == limit) {
      return null;
    }
    return (props.templateQuestions[index]);
  }

  useEffect(() => {
	}, []);

  function createMarkup(dirty) {
	return { __html: dirty };
  }

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {props.userData[0].title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Data Saved
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <div key="preLoadAttributes" className="startProgram" dangerouslySetInnerHTML={createMarkup(props.preLoadAttributes)} />
      {isAlert &&  <Alert severity={theSeverity} onClose={handleOnAlert}>
            {alertMessage}
          </Alert>}
      <form onSubmit={handleSubmit}>
        { props.userData[0].usePagination==0 || (props.userData[0].usePagination==1 && props.templateQuestions.length < 1) ?
          props.templateQuestions.map((comp, index) => 
            comp.question_type != 'dialog_input' ?
            <DisplayUserRow  
              props={props} 
              questionType={comp.question_type} 
              preLoadAttributes={comp.pre_load_attributes}
              questionOrder={comp.question_order}
              useBoxControls={props.userData[0].useBoxControls}
              useAutoSpacing={props.userData[0].useAutoSpacing}
              question={comp}
              onSubmitChange={handleOnSubmitOther}
              onNextPage={handleNextPage}
              nextQuestion={index+1 < props.templateQuestions.length ? props.templateQuestions[index+1] : null}
            /> : null      
          ) :
        <Stack spacing={2}>
          <Typography variant="h6">
            {props.userData[0].title}<div className="rightText">Page: {page} of {props.templateQuestions.filter(comp => !comp.question_type.includes('dialog_input')).length}</div>
          </Typography>
          <DisplayUserRow  
            props={props} 
            questionType={getNonDialogQuestion(page - 1).question_type} 
            preLoadAttributes={getNonDialogQuestion(page - 1).pre_load_attributes}
            questionOrder={getNonDialogQuestion(page - 1).question_order}
            useBoxControls={props.userData[0].useBoxControls}
            useAutoSpacing={props.userData[0].useAutoSpacing}
            question={getNonDialogQuestion(page - 1)}
            onSubmitChange={handleOnSubmitOther}
            onNextPage={handleNextPage}
            nextQuestion={getNextQuestion(getNonDialogQuestion(page - 1))}
          />
          <Pagination count={currentPage} 
            page={page} 
            onChange={handlePageChange} 
            color="primary"
            size="large"
          />
        </Stack>
        }
        <br/><br/>
        <Stack spacing={2} direction="row">
          <Button variant="contained" 
            disabled={props.userData[0].usePagination==0 ? false : page < props.templateQuestions.filter(comp => !comp.question_type.includes('dialog_input')).length ? true : false} 
            type="submit">Save</Button>
          <Button variant="contained" color="error" onClick={handleCancel}>Cancel</Button>
        </Stack>
      </form>
      <div key="postLoadAttributes" dangerouslySetInnerHTML={createMarkup(props.postLoadAttributes)} />
    </React.Fragment>
  );
}
