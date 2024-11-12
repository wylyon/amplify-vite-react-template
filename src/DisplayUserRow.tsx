
// @ts-nocheck
import * as React from "react";
import { useState, useEffect } from "react";
import DisplayQuestion from '../src/DisplayQuestion';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Box } from "@mui/material";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Check, CheckBox, Label } from "@mui/icons-material";
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { useGeolocated } from "react-geolocated";
import {
  ConvertTo3waClient,
  ConvertTo3waOptions,
  FeatureCollectionResponse,
  LocationGeoJsonResponse,
  LocationJsonResponse,
} from '@what3words/api';

export default function DisplayUserRow(props) {
  const [source, setSource] = useState('');
  const [view, setView] = useState('list');
  const [open, setOpen] = useState(false);
  const [heading, setHeading] = useState('');
  const [title, setTitle] = useState('');
  const [comboName, setComboName] = useState<string[]>([]);
  const [words, setWords] = useState('');

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
  };

  const { coords, 
    isGeolocationAvailable, 
    isGeolocationEnabled,
    getPosition,
    positionError } =
      useGeolocated({
          positionOptions: {
              enableHighAccuracy: false,
          },
          userDecisionTimeout: 5000,
          watchLocationPermissionChange: true,
      });

  const API_KEY = props.what3wordsAPI;
  const client: ConvertTo3waClient = ConvertTo3waClient.init(API_KEY);

  const handleChangeMultiple = (event: SelectChangeEvent<typeof comboName>) => {
    const {
      target: { value },
    } = event;
    setComboName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
    if (coords) {
      const options: ConvertTo3waOptions = {
        coordinates: { lat: coords.latitude, lng: coords.longitude },
      };
      
      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onMultiDrop (event, props.question.id, coords, res.words));
    } else {
      props.onMultiDrop (event, props.question.id, coords, '');
    }

    props.onNextPage(true);
  };

  const handleCloseMultiple = (event) => {
    if (Array.isArray(comboName) && comboName.length > 0) {
      comboName.map((item, index) => trigger_check(item));
    }
  }

  const handleOtherClose = () => {
    setOpen(false);
  };

  const handleOther = (value) => {
    setOpen(false);
    if (coords) {
      const options: ConvertTo3waOptions = {
        coordinates: { lat: coords.latitude, lng: coords.longitude },
      };
      
      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onOtherChange(value, props.question.id, coords, res.words));
    } else {
      props.onOtherChange(value, props.question.id, coords, '');
    }
  };

  const handleCapture = (target) => {
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];
      
        if (coords) {
          const options: ConvertTo3waOptions = {
            coordinates: { lat: coords.latitude, lng: coords.longitude },
          };

          client
          .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
          .then((res: LocationJsonResponse) => props.onPicture(file, props.question.id, coords, res.words));
        } else {
          props.onPicture(file, props.question.id, coords, '');
        }

        const newUrl = URL.createObjectURL(file);
        setSource(newUrl);
        props.onNextPage(true);
      }
    }
  }
  
  function trigger_check (value) {
    if (props.nextQuestion == null) {
      return;
    }
    if (props.nextQuestion.question_type == 'dialog_input') {
      // we have a trigger to check
      if (props.nextQuestion.trigger_value == value) {
        setHeading(props.nextQuestion.pre_load_attributes);
        setTitle(props.nextQuestion.title);
        setOpen(true);
      }
    }
    return;
  }

  const handleToggleChange = (event: React.MouseEvent<HTMLElement>, nextView: string) => {
    setView(nextView);
    props.onNextPage(true);
    if (coords) {
      const options: ConvertTo3waOptions = {
        coordinates: { lat: coords.latitude, lng: coords.longitude },
      };
      
      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onChange(event, coords, res.words));
    } else {
      props.onChange(event, coords, '');
    }
    trigger_check(nextView);
  };

  const clickPhoto = (id) => {
    document.getElementById(id).click();
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
        onClose={handleOtherClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            event.stopPropagation();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const otherAnimal = formJson.other;
            handleOther(otherAnimal);
          },
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{heading}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="other"
            name="other"
            label="input"
            type="other"
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleOtherClose}>Cancel</Button>
          <Button type="submit" color="success">Ok</Button>
        </DialogActions>
      </Dialog>
    { props.questionType == 'toggle_button' ?
      <div>
      {props.useBoxControls==1 &&
        <Box component="section" sx={{ p: 2, border: '1px dashed grey'}}>
          <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
          <ToggleButtonGroup
            key={'tbg_' + props.question.question_order}
            aria-placeholder={'tbg_' + props.question.question_order}
            color="primary"
            value={view}
            exclusive
            onChange={handleToggleChange}
            orientation="vertical"
          >
          {props.question.question_values.split("|").map((comp, index) => 
            <ToggleButton 
              key={'tb_'+props.question.question_order+'_'+index} 
              value={comp} 
              aria-label={comp} 
              aria-placeholder={props.question.id}
              sx={{backgroundColor: "dodgerblue"}}>{comp}</ToggleButton> )}
          </ToggleButtonGroup>
        </Box>
      }
      {props.useBoxControls==0 && props.useAutoSpacing==1 &&
        <Box component="section"  sx={{ p: 2, border: '1px'}}>
          <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
          <ToggleButtonGroup
            key={'tbg_' + props.question.question_order}
            aria-placeholder={'tbg_' + props.question.question_order}
            color="primary"
            value={view}
            exclusive
            onChange={handleToggleChange}
            orientation="vertical"
          >
          {props.question.question_values.split("|").map((comp, index) => 
            <ToggleButton 
              key={'tb_'+props.question.question_order+'_'+index} 
              value={comp} 
              aria-label={comp} 
              aria-placeholder={props.question.id}
              sx={{backgroundColor: "dodgerblue"}}>{comp}</ToggleButton> )}
          </ToggleButtonGroup>
        </Box>
      }
      {props.useBoxControls==0 && props.useAutoSpacing==0 &&
          <Box component="section">
            <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
            <ToggleButtonGroup
              color="primary"
              aria-placeholder={'tbg_' + props.question.question_order}
              key={'tbg_' + props.question.question_order}
              value={view}
              exclusive
              onChange={handleToggleChange}
              orientation="vertical"
            >
            {props.question.question_values.split("|").map((comp, index) => 
              <ToggleButton 
                key={'tb_'+props.question.question_order+'_'+index} 
                value={comp} 
                aria-label={comp} 
                aria-placeholder={props.question.id}
                sx={{backgroundColor: "dodgerblue"}}>{comp}</ToggleButton> )}
          </ToggleButtonGroup>
        </Box>
      }
      </div>
    : props.questionType == 'photo' ?
      <div><br/><br/>
      {props.useBoxControls==1 && 
        <Box component="section" sx={{ p: 2, border: '1px dashed grey'}}>
          <Stack direction="row" spacing={2} >
            <Paper elevation={2}>
              <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
              <IconButton aria-label="upload picture" onClick={() => clickPhoto(props.questionType + props.questionOrder)}> 
                <CameraAltIcon fontSize="large"/>
              </IconButton>
              <input type="file" id={props.questionType + props.questionOrder} name={"icon-button-photo" + props.questionOrder} 
                capture="environment" style={{ display: "none"}} onChange={(e) => handleCapture(e.target)}/>
            </Paper>
            {source && <Paper elevation={2} sx={{ width: 100, height: 100, borderRadius: 1}}>
              <Box sx={{ width: 100, height: 100, borderRadius: 1}}>
                <img src={source} alt={"snap"} style={{ height: "inherit", maxWidth: "inherit"}}></img>
              </Box> 
            </Paper> }
          </Stack>
        </Box>}
        {props.useBoxControls==0 && props.useAutoSpacing==0 &&
          <Stack direction="row" spacing={2} >
            <Paper elevation={2}>
              <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
              <IconButton aria-label="upload picture" onClick={() => clickPhoto(props.questionType + props.questionOrder)}> 
                <CameraAltIcon fontSize="large"/>
              </IconButton>
              <input type="file" id={props.questionType + props.questionOrder} name={"icon-button-photo" + props.questionOrder} 
                capture="environment" style={{ display: "none"}} onChange={(e) => handleCapture(e.target)}/>
            </Paper>
            {source && <Paper elevation={2} sx={{ width: 100, height: 100, borderRadius: 1}}>
              <Box sx={{ width: 100, height: 100, borderRadius: 1}}>
                <img src={source} alt={"snap"} style={{ height: "inherit", maxWidth: "inherit"}}></img>
              </Box> 
            </Paper> }
          </Stack>}
          {props.useBoxControls==0 && props.useAutoSpacing==1 &&
          <Box component="section"  sx={{ p: 2, border: '1px'}}>
            <Stack direction="row" spacing={2} >
            <Paper elevation={2}>
              <Typography variant="caption" gutterBottom>{props.preLoadAttributes}</Typography>
              <IconButton aria-label="upload picture" onClick={() => clickPhoto(props.questionType + props.questionOrder)}> 
                <CameraAltIcon fontSize="large"/>
              </IconButton>
              <input type="file" id={props.questionType + props.questionOrder} name={"icon-button-photo" + props.questionOrder} 
                capture="environment" style={{ display: "none"}} onChange={(e) => handleCapture(e.target)}/>
            </Paper>
            {source && <Paper elevation={2} sx={{ width: 100, height: 100, borderRadius: 1}}>
              <Box sx={{ width: 100, height: 100, borderRadius: 1}}>
                <img src={source} alt={"snap"} style={{ height: "inherit", maxWidth: "inherit"}}></img>
              </Box> 
            </Paper> }
            </Stack>
          </Box> 
          }
          </div>
          : props.questionType == 'multiple_dropdown' ?
            <div>
              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id={"multiple-checkbox-label"+props.question.question_order}>{props.preLoadAttributes}</InputLabel>
                <Select
                  labelId={"multiple-checkbox-label"+props.question.question_order}
                  id={"multiple-checkbox"+props.question.question_order}
                  multiple
                  aria-placeholder={props.question.id}
                  value={comboName}
                  onChange={handleChangeMultiple}
                  onClose={handleCloseMultiple}
                  input={<OutlinedInput label="Values" />}
                  renderValue={(selected) => selected.join(', ')}
                  MenuProps={MenuProps}
                >
                  {props.question.question_values.split("|").map((name) => (
                    <MenuItem key={name} value={name}>
                      <Checkbox checked={comboName.includes(name)} />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          :
          <DisplayQuestion props={props} question = {props.question} isPreview={false} useBox={props.useBoxControls} useSpacing={props.useAutoSpacing} /> }
    </React.Fragment>
  );
}
