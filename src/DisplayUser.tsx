
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
import { v4 as uuidv4 } from 'uuid';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { uploadData } from "aws-amplify/storage";
import { useGeolocated } from "react-geolocated";
import what3words, {
  ApiVersion,
  ConvertTo3waOptions,
  LocationJsonResponse,
  Transport,
  What3wordsService,
  axiosTransport,
} from '@what3words/api';

export default function DisplayUser(props) {
  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [theSeverity, setTheSeverity] = useState('error');
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [results, setResults] = useState([]);
  const [gps, setGPS] = useState<GeolocatedResult>({});
  const [words, setWords] = useState('');

  const client = generateClient<Schema>();

  const apiKey = props.what3wordsAPI;
  const config: {
    host: string;
    apiVersion: ApiVersion;
  } = {
    host: 'https://api.what3words.com',
    apiVersion: ApiVersion.Version3,
  };
  const transport: Transport = axiosTransport();
  const w3wService: What3wordsService = what3words(apiKey, config, { transport });

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }

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

  const postError = (error) => {
    setAlertMessage('What3words: ' + error);
    setTheSeverity("warning");
    setIsAlert(true);   
  }

  const setGPSWhat3Words = () => {
    setGPS(coords);
    const options: ConvertTo3waOptions = {
      coordinates: { lat: coords.latitude, lng: coords.longitude},
    }
    w3wService.convertTo3wa(options).then((res: LocationJsonResponse) => setWords(res.words)).catch(error => postError(error));
  }

  const checkGPS = () => {
    if (!isGeolocationAvailable) {
      setAlertMessage('Your browser does not support Geolocation');
      setTheSeverity("warning");
      setIsAlert(true);
    } else {
      if (!isGeolocationEnabled) {
        setAlertMessage('Geolocation is not enabled.');
        setTheSeverity("warning");
        setIsAlert(true);        
      } else {
        if (coords) {
          setGPSWhat3Words();
        }
      }
    }
  }

  const getLatLongResults = (id, value, type, file) => {
    getPosition();
    checkGPS();
    if (coords) {
      setGPSWhat3Words();
      
      setResultTally(id, value, type, file, coords.latitude, coords.longitude, words);
    } else {
      setResultTally(id, value, type, file, gps.latitude, gps.longitude, words);
    }
  }

  const setTally = () => {
    var newTally = [];
    props.templateQuestions.map(comp => newTally.push({id: comp.id, value: null, type: comp.question_type, 
      file: null, lat: null, long: null, what3words: null}));
    setResults(newTally);
  }

  const setResultTally = (id, value, type, file, lat, long, what3words) => {
    var newTally = [];
    const result = results.find(result => result.id === id);
    if (result) {
      for (var i = 0; i < results.length; i++) {
        if (results[i].id === id) {
           newTally.push({id: id, value: value, type: results[i].type, file: file, lat: lat, long: long, what3words: what3words});
        } else {
          newTally.push({id: results[i].id, value: results[i].value, type: results[i].type, file: results[i].file, lat: results[i].lat, 
            long: results[i].long, what3words: results[i].what3words});
        }
      }
    } else {
      for (var i = 0; i < results.length; i++) {
        newTally.push({id: results[i].id, value: results[i].value, type: results[i].type, file: results[i].file, lat: results[i].lat, 
          long: results[i].long, what3words: results[i].what3words});
      }
      newTally.push({id: id, value: value, type: type, file: file, lat: lat, long: long, what3words: what3words});     
    }
    setResults(newTally);
  }

  const handleClose = () => {
    setOpen(false);
    props.onSubmitChange(false);
  };
  
  const handleCancel = (e) => {
    props.onSubmitChange(false);
  }

  const handleOnSubmitOther = (value, id) => {
    getLatLongResults(id, value, 'dialog_input', null);
  }

  const handleToggleChange = (e) => {
    getLatLongResults(e.target.ariaPlaceholder, e.target.value, 'toggle_button', null);
  }

  const handleOnPicture = (file, id) => {
    getLatLongResults(id, file.name, 'photo', file);
  }

  const handleOnMultiDrop = (e, id) => {
    if (e.target.value == null) {
      getLatLongResults(id, null, 'multiple_dropdown', null);
    } else {
      getLatLongResults(id, e.target.value.join("|"),'multiple_dropdown', null);
    }
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

  const saveResults = async(id, value, type, file, lat, long, what3words) => {
    if (file != null) {
      try {
        uploadData({
          path: `picture-submissions/${file.name}`,
          data: file,
        });
      } catch (exception) {
        setAlertMessage('Error trying to save photo..' + exception);
        setTheSeverity("error");
        setIsAlert(true);
      }
    }
      const now = new Date();
      const { errors, data: items } = await client.models.question_result.create({
        id: uuidv4(),
        transaction_id: props.transaction,
        template_question_id: id,
        result_photo_value: type == 'photo' ? value : null,
        result_option_value: type == 'toggle_button' || type == 'multiple_dropdown' ? value : null,
        result_date_value: type == 'datepicker' ? value : null,
        gps_lat: lat,
        gps_long: long,
        what3words: what3words,
        created: now,
        created_by: props.userId			
      });
      if (errors) {
        setTheSeverity("error");
        setAlertMessage(errors[0].message);
        setIsAlert(true);
      }
  }
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const formJson = Object.fromEntries((formData as any).entries());
      //console.log(results);
      results.map(comp => comp.type != 'dialog_input' ? saveResults(comp.id, comp.value, comp.type, comp.file, comp.lat, comp.long, comp.what3words) : null);
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
    setTally();
    checkGPS();
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
      <form onSubmit={handleSubmit}
      >
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
              onOtherChange={handleOnSubmitOther}
              onChange={handleToggleChange}
              onPicture={handleOnPicture}
              onMultiDrop={handleOnMultiDrop}
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
            onOtherChange={handleOnSubmitOther}
            onChange={handleToggleChange}
            onPicture={handleOnPicture}
            onMultiDrop={handleOnMultiDrop}
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
