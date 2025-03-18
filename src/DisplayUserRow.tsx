
// @ts-nocheck
import * as React from "react";
import { useState, useEffect } from "react";
import DisplayQuestion from '../src/DisplayQuestion';
import DisplayAttributes from "../src/DisplayAttributes";
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Box } from "@mui/material";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Check, CheckBox, Label } from "@mui/icons-material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import CircularProgress from '@mui/material/CircularProgress';
import RadioGroup from '@mui/material/RadioGroup';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
  const [isWaiting, setIsWaiting] = useState(false);
  const [view, setView] = useState('list');
  const [open, setOpen] = useState(false);
  const [heading, setHeading] = useState('');
  const [title, setTitle] = useState('');
  const [comboName, setComboName] = useState<string[]>([]);
  const [dropDownValue, setDropDownValue] = useState('');
  const [radioValue, setRadioValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [dateValue, setDateValue] = useState(null);
  const [words, setWords] = useState('');
  const [value, setValue] = useState('');
  const [mView, setMView] = useState([]);
  const [attributes, setAttributes] = useState('');
  const [checked, setChecked] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [theSeverity, setTheSeverity] = useState('error');
  const [nextCall, setNextCall] = useState({});
  const [id, setId] = useState(0);

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

  const options = {
    enableHighAccuracy: true, 
    maximumAge: 15000, 
    timeout: 30000
  }

  const API_KEY = props.what3wordsAPI;
  const client: ConvertTo3waClient =API_KEY == null ? null : ConvertTo3waClient.init(API_KEY);

  const handleChangeMultiple = async(event: SelectChangeEvent<typeof comboName>) => {
    const {
      target: { value },
    } = event;
    setComboName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  //      checkGPS(false);
  setIsWaiting(true);
  var coordinates = {lat: 0, long: 0};
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    coordinates.lat = position.coords.latitude;
    coordinates.long = position.coords.longitude;
  } catch (error) {
    setAlertMessage(error);
    setTheSeverity("warning");
    setIsAlert(true);
  }
  if (API_KEY != null) {

      const options: ConvertTo3waOptions = {
        coordinates: { lat: coordinates.lat, lng: coordinates.long },
      };

      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onMultiDrop (event, props.question.id, coordinates, res.words, props.whatPage));
    } else {
      props.onMultiDrop (event, props.question.id, coordinates, '', props.whatPage);
    }

    props.onNextPage(true);
    setIsWaiting(false);
  };

  const handleDropDown = async(event: SelectChangeEvent) => {
    const ddValue = event.target.value as string;
    setDropDownValue(ddValue);
  //      checkGPS(false);
  var coordinates = {lat: 0, long: 0};
  setIsWaiting(true);
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    coordinates.lat = position.coords.latitude;
    coordinates.long = position.coords.longitude;
  } catch (error) {
    setAlertMessage(error);
    setTheSeverity("warning");
    setIsAlert(true);
  }
  if (API_KEY != null) {
      const options: ConvertTo3waOptions = {
        coordinates: { lat: coordinates.lat, lng: coordinates.long },
      };
      
      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onDrop (ddValue, props.question.id, coordinates, res.words, props.whatPage));
    } else {
      props.onDrop (ddValue, props.question.id, coordinates, '', props.whatPage);
    }

    props.onNextPage(true);
    setIsWaiting(false);
  }

  const handleCloseMultiple = (event) => {
    if (Array.isArray(comboName) && comboName.length > 0) {
      comboName.map((item, index) => trigger_check(item, event.target.ariaPlaceholder));
    }
  }

  const handleOtherClose = () => {
    setOpen(false);
    setId(0);
    setHeading('');
    setTitle('');
  };

  const handleOther = async(value) => {
    setOpen(false);
  //      checkGPS(false);
  var coordinates = {lat: 0, long: 0};
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    coordinates.lat = position.coords.latitude;
    coordinates.long = position.coords.longitude;
  } catch (error) {
    setAlertMessage(error);
    setTheSeverity("warning");
    setIsAlert(true);
  }
  if (API_KEY != null) {
      const options: ConvertTo3waOptions = {
        coordinates: { lat: coordinates.lat, lng: coordinates.long },
      };
      
      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onOtherChange(value, props.question.id, coordinates, res.words, props.whatPage));
    } else {
      props.onOtherChange(value, id, coordinates, '', props.whatPage);
    }
    setId(0);
    setHeading('');
    setTitle('');
  };

  const handleCapture = async(target) => {
    setIsWaiting(true);
    if (target.files) {
      if (target.files.length !== 0) {
        const file = target.files[0];
        const newUrl = URL.createObjectURL(file);
  //      checkGPS(false);
        var coordinates = {lat: 0, long: 0};
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
          });
          coordinates.lat = position.coords.latitude;
          coordinates.long = position.coords.longitude;
        } catch (error) {
          setAlertMessage(error);
          setTheSeverity("warning");
          setIsAlert(true);
        }
        if (API_KEY != null) {
          const options: ConvertTo3waOptions = {
            coordinates: { lat: coordinates.lat, lng: coordinates.long },
          };

          client
          .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
          .then((res: LocationJsonResponse) => props.onPicture(file, props.question.id, coordinates, res.words, newUrl, props.whatPage ));
        } else {
          props.onPicture(file, props.question.id, coordinates, '', newUrl, props.whatPage);
        }

        if (props.props.userData[0].usePagination==0) {
          setSource(newUrl);
        } 
        props.onNextPage(true);
      }
    }
    setIsWaiting(false);
  }
  
  function trigger_check (value, id) {
    if (props.nextQuestion == null) {
      return;
    }
    if (props.nextQuestion.question_type == 'dialog_input') {
      // we have a trigger to check
      if (props.nextQuestion.trigger_value == value) {
        setId(id);
        setHeading(props.nextQuestion.pre_load_attributes);
        setTitle(props.nextQuestion.title);
        setOpen(true);
      }
    }
    return;
  }

  const handleToggleChange = async(event: React.MouseEvent<HTMLElement>, nextView: string) => {
    setIsWaiting(true);
    setView(nextView);
   //      checkGPS(false);
   var coordinates = {lat: 0, long: 0};
   try {
     const position = await new Promise((resolve, reject) => {
       navigator.geolocation.getCurrentPosition(resolve, reject, options);
     });
     coordinates.lat = position.coords.latitude;
     coordinates.long = position.coords.longitude;
   } catch (error) {
     setAlertMessage(error);
     setTheSeverity("warning");
     setIsAlert(true);
   }
   if (API_KEY != null) {
     const options: ConvertTo3waOptions = {
        coordinates: { lat: coordinates.lat, lng: coordinates.long },
      };
      
      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onChange(event, coordinates, res.words, props.whatPage, 'toggle_button', event.target.value));
    } else {
        props.onChange(event, coordinates, '', props.whatPage, 'toggle_button', event.target.value);
    }
    trigger_check(nextView, event.target.ariaPlaceholder);
    props.onNextPage(true);
    setIsWaiting(false);
  };

  const handleMultipleToggleChange = async(event: React.MouseEvent<HTMLElement>, newChanges: string[]) => {
    setIsWaiting(true);
    setMView(newChanges);
   //      checkGPS(false);
   var coordinates = {lat: 0, long: 0};
   try {
     const position = await new Promise((resolve, reject) => {
       navigator.geolocation.getCurrentPosition(resolve, reject, options);
     });
     coordinates.lat = position.coords.latitude;
     coordinates.long = position.coords.longitude;
   } catch (error) {
     setAlertMessage(error);
     setTheSeverity("warning");
     setIsAlert(true);
   }
   if (API_KEY != null) {
      const options: ConvertTo3waOptions = {
        coordinates: { lat: coordinates.lat, lng: coordinates.long },
      };
      
      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onChange(event, coordinates, res.words, props.whatPage, 'checkbox_button', newChanges.join("|")));
    } else {
        props.onChange(event, coordinates, '', props.whatPage, 'checkbox_button', newChanges.join("|"));
    }

    trigger_check(newChanges[newChanges.length-1], event.target.ariaPlaceholder);
    props.onNextPage(true);
    setIsWaiting(false);
  };

  const handleRadioGroup = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const rValue = (event.target as HTMLInputElement).value;
    setRadioValue(rValue);
    setIsWaiting(true);
  //      checkGPS(false);
  var coordinates = {lat: 0, long: 0};
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    coordinates.lat = position.coords.latitude;
    coordinates.long = position.coords.longitude;
  } catch (error) {
    setAlertMessage(error);
    setTheSeverity("warning");
    setIsAlert(true);
  }
  if (API_KEY != null) {
      const options: ConvertTo3waOptions = {
        coordinates: { lat: coordinates.lat, lng: coordinates.long },
      };
      
      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onRadio (rValue, props.question.id, coordinates, res.words, props.whatPage));
    } else {
      props.onRadio (rValue, props.question.id, coordinates, '', props.whatPage);
    }

    trigger_check(rValue, props.question.id);
    props.onNextPage(true);
    setIsWaiting(false);
  };

  const handleText = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const tValue = (event.target as HTMLInputElement).value;
    setTextValue(tValue);
  //      checkGPS(false);
  var coordinates = {lat: 0, long: 0};
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    coordinates.lat = position.coords.latitude;
    coordinates.long = position.coords.longitude;
  } catch (error) {
    setAlertMessage(error);
    setTheSeverity("warning");
    setIsAlert(true);
  }
  if (API_KEY != null) {

      const options: ConvertTo3waOptions = {
        coordinates: { lat: coordinates.lat, lng: coordinates.long },
      };

      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onText (tValue, props.question.id, coordinates, res.words, props.question.question_type, props.whatPage));
    } else {
      props.onText (tValue, props.question.id, coordinates, '', props.question.question_type, props.whatPage);
    }
    props.onNextPage(true);
  }

  const handleDate = async(event) => {
    const rValue = event.toString();
    setRadioValue(rValue);
  //      checkGPS(false);
  var coordinates = {lat: 0, long: 0};
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    coordinates.lat = position.coords.latitude;
    coordinates.long = position.coords.longitude;
  } catch (error) {
    setAlertMessage(error);
    setTheSeverity("warning");
    setIsAlert(true);
  }
  if (API_KEY != null) {
      const options: ConvertTo3waOptions = {
        coordinates: { lat: coordinates.lat, lng: coordinates.long },
      };
      
      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onDate (rValue, props.question.id, coordinates, res.words, props.whatPage));
    } else {
      props.onDate (rValue, props.question.id, coordinates, '', props.whatPage);
    }

    props.onNextPage(true);
  };

  const handleButtonClick = async() => {
    const value = props.question.question_values.includes("|") ? props.question.question_values.split("|")[1] : props.question.question_values;
  //      checkGPS(false);
  var coordinates = {lat: 0, long: 0};
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    coordinates.lat = position.coords.latitude;
    coordinates.long = position.coords.longitude;
  } catch (error) {
    setAlertMessage(error);
    setTheSeverity("warning");
    setIsAlert(true);
  }
  if (API_KEY != null) {
      const options: ConvertTo3waOptions = {
        coordinates: { lat: coordinates.lat, lng: coordinates.long },
      };
      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onButton (value, props.question.id, props.question.question_type, coordinates, res.words, props.whatPage));
    } else {
      props.onButton (value, props.question.id, props.question.question_type, coordinates, '', props.whatPage);
    }      

    props.onNextPage(true);
  }

  const handleSwitch = async(event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  //      checkGPS(false);
  var coordinates = {lat: 0, long: 0};
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    coordinates.lat = position.coords.latitude;
    coordinates.long = position.coords.longitude;
  } catch (error) {
    setAlertMessage(error);
    setTheSeverity("warning");
    setIsAlert(true);
  }
  if (API_KEY != null) {
      const options: ConvertTo3waOptions = {
        coordinates: { lat: coordinates.lat, lng: coordinates.long },
      };
      
      client
      .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
      .then((res: LocationJsonResponse) => props.onSwitch (event.target.checked.toString(), props.question.id, coordinates, res.words, props.whatPage));
    } else {
      props.onSwitch (event.target.checked.toString(), props.question.id, coordinates, '', props.whatPage);
    }

    props.onNextPage(true);
  }
  const handleAttribute = (v, t) => {
    const adjustValue = t == 0 ? v :
      t == 1 ? "    " + v :
      t == 2 ? "        " + v :
      t == 3 ? "            " + v :
      t == 4 ? "                " + v : "                    " + v;

    setValue(adjustValue);
  }

  const clickPhoto = (id) => {
    document.getElementById(id).click();
  }

  const handleOnAlert = (e) => {
    setIsAlert(false);
    setAlertMessage('');
    setTheSeverity("error");
  }
  
  useEffect(() => {
	}, []);

  function createMarkup(dirty) {
	return { __html: dirty };
  }

  const theme = createTheme({
    components: {
      MuiButton: { root: { transition: 'color .01s', '&.Mui-disabled span': { transition: '.01s', }, }, }
    },
  });

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
      {isAlert &&  <Alert severity={theSeverity} onClose={handleOnAlert}>
            {alertMessage}
          </Alert>}
        {isWaiting && <CircularProgress />}
    { props.questionType == 'toggle_button' || props.questionType == 'checkbox_button' ?
      <div>
        <DisplayAttributes props={props} onParsing={handleAttribute}/>
        <Box component="section"  sx={
          props.useBoxControls==1 || props.useAutoSpacing==1 ?
          { p: 2, border: props.useAutoSpacing==0 ? '1px dashed grey' : '1px'} : {}}>
          { props.props.userData[0].usePagination==1 ? <p>{value}</p> :
          <Typography variant="caption" gutterBottom>{value}</Typography> }
          <ToggleButtonGroup
            aria-label={props.questionType + props.question.question_order}
            key={'tbg_' + props.question.question_order}
            aria-placeholder={'tbg_' + props.question.question_order}
            color="primary"
            value={props.questionType == 'toggle_button' ? (props.resultValue ? props.resultValue.value : view) : mView}
            size="small"
            exclusive={props.questionType == 'toggle_button'}
            onChange={props.questionType == 'toggle_button' ? handleToggleChange : handleMultipleToggleChange}
            orientation="vertical"
          >
            <Stack direction="column" spacing={ props.questionType == 'checkbox_button' ? 2 : 1 }>
              {props.question.question_values.split("|").map((comp, index) => 
              <ThemeProvider key={'the_'+props.question.question_order+'_'+index} theme={theme}>
                <ToggleButton 
                  key={'tb_'+props.question.question_order+'_'+index} 
                  value={comp} 
                  sx={{fontWeight: 'bold'}}
                  size="small"
                  aria-label={comp} 
                  aria-placeholder={props.question.id}>{comp}
                </ToggleButton>
              </ThemeProvider> )}
            </Stack>
          </ToggleButtonGroup>
        </Box>
      </div>
    : props.questionType == 'photo' ?
      <div>
        <DisplayAttributes props={props} onParsing={handleAttribute} />
        <Box component="section" sx={
          props.useBoxControls==1 || props.useAutoSpacing==1 ?
          { p: 2, border: props.useAutoSpacing==0 ? '1px dashed grey' : '1px'} : {}}>
          <Stack direction="row" spacing={2} >
            <Paper elevation={2}>
              <Typography variant="caption" gutterBottom>{value}</Typography>
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
      </div>
    : props.questionType == 'multiple_dropdown' ?
      <div>
        <DisplayAttributes props={props} onParsing={handleAttribute} />
        <FormControl sx={{ m: 1, width: 200 }}>
          <InputLabel id={"multiple-checkbox-label"+props.question.question_order}>{value}</InputLabel>
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
    : props.questionType == 'dropdown' ?
      <div>
        {isAlert &&  <Alert severity={theSeverity} onClose={handleOnAlert}>
            {alertMessage}
          </Alert>}
        {isWaiting && <CircularProgress />}
        <DisplayAttributes props={props} onParsing={handleAttribute} />
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id={"simple-select-label"+props.question.question_order}>{value}</InputLabel>
          <Select
            labelId={"simple-select-label"+props.question.question_order}
            id={"simple-select"+props.question.question_order}
            value={dropDownValue}
            onChange={handleDropDown}
            input={<OutlinedInput label="Values" />}
          >
            {props.question.question_values.split("|").map((name, index) => (
              <MenuItem key={"select"+index+"_"+props.question.question_order} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    : props.questionType == 'radiobox' ?
      <div>
        <DisplayAttributes props={props} onParsing={handleAttribute} />
        <FormControl sx={{ m: 1, width: 300 }}>
          <FormLabel id={"radio-buttons-group-label"+props.question.question_order}>{value}</FormLabel>
          <RadioGroup
            aria-labelledby={"radio-buttons-group-label"+props.question.question_order}
            value={radioValue}
            onChange={handleRadioGroup}
            name="radio-buttons-group">
            {props.question.question_values.split("|").map((name, index) => (
              <FormControlLabel key={"radio-button"+index+"_"+props.question.question_order} value={name} control={<Radio />} label={name} />
            ))}
          </RadioGroup>
        </FormControl>
      </div>
    : props.questionType == 'input' || props.questionType == 'text' ?
      <div>
        <DisplayAttributes props={props} onParsing={handleAttribute} />
        {props.questionType == 'input' ?
            <TextField id={"input-field-"+props.question.question_order} label={value} variant="outlined" onChange={handleText} value={textValue}/>
        :   <TextField id={"input-field-"+props.question.question_order} label={value} multiline maxRows={4} variant="outlined" onChange={handleText} value={textValue}/> }
      </div>
    : props.questionType == 'datepicker' ?
      <div>
        <DisplayAttributes props={props} onParsing={handleAttribute} />
        <Typography variant="caption" gutterBottom>{value}</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker onChange={handleDate} value={dateValue} />
        </LocalizationProvider>
      </div>
    : props.questionType == 'button' || props.questionType == 'contained_button_color' ?
      <div>
        <DisplayAttributes props={props} onParsing={handleAttribute} />
        <Typography variant="caption" gutterBottom>{value}</Typography>
        {props.questionType == 'button' ? <Button variant="outlined" onClick={handleButtonClick}>{props.question.question_values}</Button> :
         props.questionType == 'contained_button_color' && props.question.question_values.includes("|") ? 
          <Button variant="contained" onClick={handleButtonClick} 
            sx={{ backgroundColor: props.question.question_values.split("|")[0]}}>{props.question.question_values.split("|")[1]}</Button> :
          <Button variant="contained" onClick={handleButtonClick}>{props.question.question_values}</Button>
        }
      </div>
    : props.questionType == 'switch' ?
      <div>
        <DisplayAttributes props={props} onParsing={handleAttribute} />
        {value == '' ?
          <Switch checked={checked} onChange={handleSwitch} inputProps={{ 'aria-label': 'controlled'}} /> :
          <FormControlLabel control={<Switch checked={checked} onChange={handleSwitch} />} label={value} />
        }
      </div>
    : <DisplayQuestion props={props} question = {props.question} isPreview={false} useBox={props.useBoxControls} useSpacing={props.useAutoSpacing} /> }
    </React.Fragment>
  );
}
