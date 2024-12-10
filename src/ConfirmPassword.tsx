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
import TextField from '@mui/material/TextField';
import Button from "@mui/material/Button";

export default function ConfirmPassword(props) {

  const [open, setOpen] = useState(true);

  useEffect(() => {
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
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const password = formJson.password;
          if (password === props.password) {
            props.onGoodPassword(event);
          } else {
            props.onBadPassword(event);
          }
          handleCloseValues();
        },
      }}
    >
    <DialogTitle>Confirm Password</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Please Re-enter the Password:
      </DialogContentText>
      <Box sx={{ minWidth: 120 }}>
      <TextField
            autoFocus
            margin="dense"
            required
            id="password"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
          />
    </Box>
    </DialogContent>
    <DialogActions>
      <Button type="button" onClick={handleCloseValues}>Cancel</Button>
      <Button type="submit">Save</Button>
    </DialogActions>
  </Dialog>
</React.Fragment>
  );
}