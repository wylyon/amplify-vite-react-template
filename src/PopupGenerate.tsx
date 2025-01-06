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
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function PopupGenerate(props) {
  const [progress, setProgress] = React.useState(10);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress + 10));
    }, 800);
    if (progress >= 100) {
      clearInterval(timer);
      handleCloseValues();
    }
    return () => {
      clearInterval(timer);
    };
  }, [progress]);

  const handleCloseValues = () => {
    setOpen(false);
    props.onClose(false);
  }

  return (
    <React.Fragment>
    <CssBaseline />
    <Dialog
      open={open}
      onClose={handleCloseValues}
    >
    <DialogTitle>Generating Profile/Template/Users</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Generating content...please wait.
      </DialogContentText>
      <Box sx={{ width: '100%' }}>
        <LinearProgressWithLabel value={progress} />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button disabled={progress < 100} onClick={handleCloseValues}>Close</Button>
    </DialogActions>
  </Dialog>
</React.Fragment>
  );
}