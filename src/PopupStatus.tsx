// @ts-nocheck
import React from "react";
import { useState, useEffect  } from "react";
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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from "@mui/material/Button";
import TextField from '@mui/material/TextField';

export default function PopupStatus(props) {

  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState(props.status);
  const [reasons, setReasons] = useState(props.reasons);

  useEffect(() => {
	}, []);

  const handleCloseValues= (event: object, reason: string) => {
    if (reason == "escapeKeyDown" || reason == "backdropClick") {
      return;
    }
    props.onStatusClosed(true);
    setOpen(false);
  }

  const handleChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value as string);
  };

  const handleTextChange = (event: SelectChangeEvent) => {
    setReasons(event.target.value as string);
  };

  return (
    <React.Fragment>
    <CssBaseline />
    <Dialog
      open={open}
      onClose={handleCloseValues}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          props.onStatus(props.id, status, reasons);
          handleCloseValues();
        },
      }}
    >
    <DialogTitle>Status and Notes</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Select a Status and Notes
      </DialogContentText>
      <Box sx={{ minWidth: 300 }}>
        <br/>
      <FormControl>
        <InputLabel id="demo-simple-select-label">Status</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={status}
          label="Status"
          onChange={handleChange}
        >
          <MenuItem value='Open'>Open</MenuItem>
          <MenuItem value='Pending'>Pending</MenuItem>
          <MenuItem value='Closed'>Closed</MenuItem>
        </Select>
      </FormControl>
      <TextField id='outlined-reason' label='Reason Notes' value={reasons} variant="outlined" fullWidth onChange={handleTextChange} slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}></TextField>
    </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseValues} variant="contained" color="error">Cancel</Button>
      <Button type="submit" variant="contained" color="primary">Save</Button>
    </DialogActions>
  </Dialog>
</React.Fragment>
  );
}