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
import NativeSelect from '@mui/material/NativeSelect';
import Button from "@mui/material/Button";

export default function PopupTemplate(props) {

  const [open, setOpen] = useState(true);
  const [selectTemplate, setSelectTemplate] = useState('');
  const [arrayTemplates, setArrayTemplates] = useState([]);

  const handleSelectChange = (e) => {
    setSelectTemplate(e.target.value);
  //  props.onSelectTemplate(e.target.value);
  };

  useEffect(() => {
	  const arrTemplates = props.theTemplates.split("|");
    setArrayTemplates(arrTemplates);
	}, []);

  const handleCloseValues = () => {
    setOpen(false);
  }

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
          if (selectTemplate == []) {
            props.onSelectTemplate(arrayTemplates[0].split("!")[0]);
          } else {
            props.onSelectTemplate(selectTemplate);
          }
          handleCloseValues();
        },
      }}
    >
    <DialogTitle>Authorized Programs</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Select Program to Run:
      </DialogContentText>
      <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
      <InputLabel variant="standard" htmlFor="uncontrolled-native">
      
        </InputLabel>
        <NativeSelect
          onChange={handleSelectChange}
          inputProps={{
            name: 'program',
            id: 'uncontrolled-native',
          }}
        >
          { arrayTemplates.map(comp => 
            <option key={comp.split("!")[0]} value={comp.split("!")[0]}>{comp.split("!")[1]}</option>
          )}
        </NativeSelect>
      </FormControl>
    </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseValues}>Cancel</Button>
      <Button type="submit">Save</Button>
    </DialogActions>
  </Dialog>
</React.Fragment>
  );
}