// @ts-nocheck
import React from "react";
import { useState } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';
import Button from "@mui/material/Button";
import DisplayQuestion from "../src/DisplayQuestion";
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import Typography from "@mui/material/Typography";

export default function PopupReview(props) {

  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(1);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }

  const handleCloseValues = () => {
    setOpen(false);
    props.onSubmitClose(false);
  }

  function createMarkup(dirty) {
    return { __html: dirty };
  }

  return (
    <React.Fragment>
    <CssBaseline />
    <Dialog
        open={open}
        onClose={handleCloseValues}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Preview of Template and Questions"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description"
            sx={{height: '500px', width: '650px'}}>
            <div className="startPreview" dangerouslySetInnerHTML={createMarkup(props.preLoadAttributes)} /><br/><br/><br/>
            {props.filtered == null ?
              <Typography variant="h4">No Preview Available</Typography>
            : props.usePages ?
              <Stack spacing={2}>
                <Typography variant="h6">
                  {props.name}
                </Typography>
                <Box component="section" sx={{ p: 2, border: '1px dashed grey'}}>
                  <Stack direction="row" spacing={1} >
                    <Paper elevation={0}>
                      <DisplayQuestion props={props} question = {props.filtered[page-1]}  useBox={false}  useSpacing={false} isPreview = {true}/>
                    </Paper>
                    <Paper elevation={0}>
                      <Typography variant="caption" gutterBottom>{"<---" + props.filtered[page-1].title}</Typography>
                    </Paper>
                  </Stack>
                </Box>
                <Pagination count={props.filtered.length} 
                  page={page} 
                  onChange={handlePageChange} 
                  showFirstButton 
                  showLastButton
                  color="primary"
                />
              </Stack>            
            : props.filtered.map(comp => 
            <Box component="section" sx={{ p: 2, border: '1px dashed grey'}}>
              <Stack direction="row" spacing={1} >
              <Paper elevation={0}>
              <DisplayQuestion props={props} question = {comp}  useBox={false}  useSpacing={false} isPreview = {true}/>
              </Paper>
              <Paper elevation={0}>
                <Typography variant="caption" gutterBottom>{"<---" + comp.title}</Typography>
              </Paper>
              </Stack>
            </Box> )}
            <div dangerouslySetInnerHTML={createMarkup(props.postLoadAttributes)} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseValues} autoFocus variant="contained" color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>
</React.Fragment>
  );
}