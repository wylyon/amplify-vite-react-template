
// @ts-nocheck
import * as React from "react";
import { useState, useEffect } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import { Box, Paper } from "@mui/material";
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { disable } from "aws-amplify/analytics";
import { v4 as uuidv4 } from 'uuid';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import { uploadData } from "aws-amplify/storage";
import CircularProgress from '@mui/material/CircularProgress';
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
  const [source, setSource] = useState([]);
  const [isAlert, setIsAlert] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [wait, setWait] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [theSeverity, setTheSeverity] = useState('error');
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [results, setResults] = useState([]);
  const [gps, setGPS] = useState({});
  const [words, setWords] = useState('');
  const [validPages, setValidPages] = useState(props.templateQuestions.filter(comp => !comp.question_type.includes('dialog_input')));

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
  const w3wService: What3wordsService = apiKey == null ? null : what3words(apiKey, config, { transport });

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }

  const resetState = () => {
    setSource([]);
    setPage(1);
    setResults([]);
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
          userDecisionTimeout: 1000,
          watchLocationPermissionChange: true,
      });

  const postError = (error) => {
    setAlertMessage('What3words: ' + error);
    setTheSeverity("warning");
    setIsAlert(true);   
  }

  const setGPSWhat3Words = () => {
    setGPS(coords);
    if (apiKey == null) {
      setWords('');
      return;
    }
    const options: ConvertTo3waOptions = {
      coordinates: { lat: coords.latitude, lng: coords.longitude},
    }
    w3wService.convertTo3wa(options).then((res: LocationJsonResponse) => setWords(res.words)).catch(error => postError(error));
  }

  const setGPSWhat3WordsNoCoords = (gpsLat, gpsLong) => {
    if (apiKey == null) {
      setWords('');
      return;
    }
    const options: ConvertTo3waOptions = {
      coordinates: { lat: gpsLat, lng: gpsLong},
    }
    w3wService.convertTo3wa(options).then((res: LocationJsonResponse) => setWords(res.words)).catch(error => postError(error));
  }

  function timeout(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
}

  const checkGPS = (showMessage) => {
    if (!isGeolocationAvailable) {
      setAlertMessage('Your browser does not support Geolocation');
      setTheSeverity("error");
      setIsAlert(true);
      return false;
    } else {
      if (!isGeolocationEnabled) {
        if (showMessage) {
          setAlertMessage('Geolocation is not enabled.');
          setTheSeverity("error");
          setIsAlert(true);  
        }      
        return false;
      } else {
        if (coords) {
          setGPSWhat3Words();
          return true;
        }
        return false;
      }
    }
  }

  const primeLatLongWhat3Words = async() => {
    getPosition();
    if (checkGPS(true)) {
      return;
    }
    getPosition();
    checkGPS(false);
    setWait(false);
  }

  const getLatLongResults = async(id, value, type, file, gpsLat, gpsLong, word, pg) => {
    if (gpsLat == '') {
      getPosition();
      checkGPS(false);
      if (coords) {
        setGPSWhat3Words();
  
        setResultTally(id, value, type, file, coords.latitude, coords.longitude, words == '' ? word : words, pg);
      } else {
        setGPSWhat3WordsNoCoords(gpsLat, gpsLong);
        setResultTally(id, value, type, file, gpsLat, gpsLong, word, pg);
      }
    } else {
      setResultTally(id, value, type, file, gpsLat, gpsLong, word, pg);
    }

  }

  const setTally = () => {
    var newTally = [];
    props.templateQuestions.map(comp => newTally.push({id: comp.id, value: null, type: comp.question_type, 
      file: null, lat: null, long: null, what3words: null, page: null}));
    setResults(newTally);
  }

  const setResultTally = (id, value, type, file, lat, long, what3words, pg) => {
    var newTally = [];
    const result = results.find(result => result.id === id);
    if (result) {
      for (var i = 0; i < results.length; i++) {
        if (results[i].id === id) {
           newTally.push({id: id, value: value, type: results[i].type, file: file, lat: lat, long: long, what3words: what3words, page: results[i].page == null ? pg : results[i].page});
        } else {
          newTally.push({id: results[i].id, value: results[i].value, type: results[i].type, file: results[i].file, lat: results[i].lat, 
            long: results[i].long, what3words: results[i].what3words, page: results[i].page});
        }
      }
    } else {
      for (var i = 0; i < results.length; i++) {
        newTally.push({id: results[i].id, value: results[i].value, type: results[i].type, file: results[i].file, lat: results[i].lat, 
          long: results[i].long, what3words: results[i].what3words, page: results[i].page});
      }
      newTally.push({id: id, value: value, type: type, file: file, lat: lat, long: long, what3words: what3words, page: pg});     
    }
    setResults(newTally);
  }

  const handleClose = () => {
    setOpen(false);
    props.onSubmitChange(false);
  };
  
  const handleCancel = (e) => {
    resetState();
    props.onSubmitChange(false);
  }

  const handleGPSWordsandResults = (id, value, type, file, c, w, p ) => {
    const lat = c == undefined ? gps.lat : c.lat;
    const long = c == undefined ? gps.long : c.long;
    if (c) {
      setGPS(c);
    }
    if (w && w != '') {
      setWords(w);
    }
    getLatLongResults(id, value, type, file, lat, long, w==undefined || w=='' ? words : w, p);
  }

  const handleOnSubmitOther = (value, id, c, w, p) => {
    handleGPSWordsandResults(id, value, 'dialog_input', null, c, w, p);
  }

  const handleToggleChange = (e, c, w, p, t, v) => {
    handleGPSWordsandResults(e.target.ariaPlaceholder, v, t, null, c, w, p);
  }

  const handleOnPicture = (file, id, c, w, s, p) => {
    if (props.userData[0].usePagination==1) {
      const newSource = [];
      for (var indx = 0; indx < source.length; indx++) {
        newSource.push ({ source: source[indx].source, page: source[indx].page });
      }
      newSource.push ({ source: s, page: p});
      setSource(newSource);
    }
    handleGPSWordsandResults(id, uuidv4(), 'photo', file, c, w, p);
  }

  const handleOnMultiDrop = (e, id, c, w, p) => {
    e.target.value == null ? handleGPSWordsandResults(id, null, 'multiple_dropdown', null, c, w, p) : handleGPSWordsandResults(id, e.target.value.join("|"),'multiple_dropdown', null, c, w, p);
  }

  const handleOnDrop = (v, id, c, w, p) => {
    v == null ? handleGPSWordsandResults(id, null, 'dropdown', null, c, w, p) : handleGPSWordsandResults(id, v, 'dropdown', null, c, w, p);
  }

  const handleOnRadio = (v, id, c, w, p) => {
    v == null ? handleGPSWordsandResults(id, null, 'radiobox', null, c, w, p) : handleGPSWordsandResults(id, v, 'radiobox', null, c, w, p);
  }

  const handleOnText = (v, id, c, w, t, p) => {
    v == null ? handleGPSWordsandResults(id, null, t, null, c, w, p) : handleGPSWordsandResults(id, v, t, null, c, w, p);
  }

  const handleOnDate = (v, id, c, w, p) => {
    v == null ? handleGPSWordsandResults(id, null, 'datepicker', null, c, w, p) : handleGPSWordsandResults(id, v, 'datepicker', null, c, w, p);
  }

  const handleOnButton = (v, id, t, c, w, p) => {
    handleGPSWordsandResults(id, v, t , null, c, w, p);
  }

  const handleOnSwitch = (v, id, c, w, p) => {
    handleGPSWordsandResults(id, v, 'switch', null, c, w, p);
  }

  const handleNextPage = (e) => {
    if (currentPage < validPages.length) {
      if (page <= currentPage) {
        setCurrentPage(currentPage+1);
        setPage(page+1);
      }
    } else {
      setCurrentPage(currentPage+1);
    }
  }

  const handleNextPageNoPaging = (e) => {
  }

  const handleOnAlert = (e) => {
    const severity = theSeverity;
    setIsAlert(false);
    setAlertMessage('');
    setTheSeverity("error");
    if (severity == 'error') {
      handleCancel(e);
    }
  }

  function getDate(value) {
		if (value == null) {
			return null
		}
		return new Date(value);
	  }

  const logTransaction = async(tranDateTime, transactionId) => {

    const now = new Date();
    const { data: items, errors } = await client.models.Log.create ({
      userName: props.userId,
      content: 'Logging App Save Transaction',
      detail: props.userData[0].title,
      refDoc: transactionId,
      transactionDate: tranDateTime,
      refDate: now,
    });
    if (errors) {
      console.log('Cant create logApp transaction log entry: ', errors);
    }
  }

  const saveTransaction = async(lat, long, what3words) => {
    const now = new Date();
    const { errors, data: items } = await client.models.transactions.create({
      id: props.transaction,
      template_id: props.templateId,
      gps_lat: lat,
      gps_long: long,
      what3words: what3words,
      status: 'Open',
      reason: null,
      last_update: now,
      created: now,
      created_by: props.userId		
    });
    if (errors) {
      setTheSeverity("error");
      setAlertMessage(errors[0].message);
      setIsAlert(true);
    } else {
      logTransaction(now, props.transaction);
    }
  }

  const saveResults = async(id, value, type, file, lat, long, what3words) => {
    var newFileName = value;
      try {
        if (file != null) {
          const fileName = file.name;
          const fileArr = fileName.split(".");
          if (fileArr.length == 2) {
            newFileName = newFileName + "." + fileArr[1];
          }
          const newFileArr = newFileName.split(".");
          if (newFileArr.length == 2) {
            if (newFileArr[0] == 'image') {
              newFileName = uuidv4() + "." + newFileArr[1];
            }
          }
          const upload = await uploadData({
            path: `picture-submissions/${props.userId}/${newFileName}`,
            data: file,
          }); 
          const final = await upload.result;
        }
        const now = new Date();
        const { errors, data: items } = await client.models.question_result.create({
          id: uuidv4(),
          transaction_id: props.transaction,
          template_question_id: id,
          result_photo_value: type == 'photo' ? newFileName : null,
          result_option_value: 
            type == 'toggle_button' || 
            type == 'multiple_dropdown' || 
            type == 'dropdown' || 
            type == 'radiobox' || 
            type == 'checkbox_button' ||
            type == 'input' || type == 'text' ||
            type == 'button' || type == 'contained_button_color' ||
            type == 'switch' ? value : null,
          result_date_value: type == 'datepicker' ? getDate(value) : null,
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
      } catch (exception) {
        setAlertMessage('Error trying to save photo..' + exception);
        setTheSeverity("error");
        setIsAlert(true);
      }
  }
  
  const saveAllResults = async (lt, lg, w3w) => {
    const promises = [];
    promises.push(saveTransaction(lt, lg, w3w));
    for (var indx = 0; indx < results.length; indx++) {
      if (results[indx].type != 'dialog_input' && results[indx].value != null) {
        if (results[indx].file != null) {
          promises.push (saveResults(results[indx].id, results[indx].value, results[indx].type, results[indx].file, results[indx].lat, results[indx].long, results[indx].what3words));
        } else {
          promises.push (saveResults(results[indx].id, results[indx].value, results[indx].type, results[indx].file, results[indx].lat, results[indx].long, results[indx].what3words));
        }
      }
    }
    await Promise.all(promises);
  }

  const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
 //     const formData = new FormData(event.currentTarget);
 //     const formJson = Object.fromEntries((formData as any).entries());
      var lt = null;
      var lg = null;
      var w3w = null;
      results.map(comp => {
        if (comp.type == 'photo') {
          lt = comp.lat;
          lg = comp.long;
          w3w = comp.what3words; 
        } else {
          if (lt == null) {
            lt = comp.lat;
            lg = comp.long;
            w3w = comp.what3words; 
          }
        }
      });
      setIsWaiting(true);
      await saveAllResults(lt, lg, w3w);
      setIsWaiting(false);
      resetState();
      setOpen(true);
  };

  function getNonDialogQuestion (index) {
    const limit = props.templateQuestions.length;
    if (index == limit) {
      return validPages[index];
    }
    return (validPages[index]);
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
    primeLatLongWhat3Words();
	}, []);

  function createMarkup(dirty) {
	return { __html: dirty };
  }

  return (
    <React.Fragment>
      <Dialog
        open={isWaiting}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Saving Data...please wait
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          {isWaiting && <CircularProgress />}
            Saving your data.
          </DialogContentText>
        </DialogContent>
      </Dialog>
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
      <div key="preLoadAttributes" 
        className="startProgram" 
        dangerouslySetInnerHTML={createMarkup(props.preLoadAttributes != null && props.preLoadAttributes != '' ? (props.preLoadAttributes + '<br/>') : props.preLoadAttributes)} />
      {isAlert &&  <Alert severity={theSeverity} onClose={handleOnAlert}>
            {alertMessage}
          </Alert>}
      <Paper sx={{marginLeft: '5px'}}>
      {!wait && <form onSubmit={handleSubmit} >
        <Stack spacing={2}>
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
              what3wordsAPI={props.what3wordsAPI}
              whatPage={0}
              onOtherChange={handleOnSubmitOther}
              onChange={handleToggleChange}
              onPicture={handleOnPicture}
              onMultiDrop={handleOnMultiDrop}
              onDrop={handleOnDrop}
              onRadio={handleOnRadio}
              onText={handleOnText}
              onDate={handleOnDate}
              onButton={handleOnButton}
              onSwitch={handleOnSwitch}
              onNextPage={handleNextPageNoPaging}
              nextQuestion={index+1 < props.templateQuestions.length ? props.templateQuestions[index+1] : null}
            /> : null      
          ) :
        <Box sx={{width: 'auto', height: 'auto', overflow: 'scroll'}}>
          <Stack direction="row" >
            <Stack spacing={2}>
              <Box sx={{width: props.templateQuestions.filter(comp => comp.question_type.includes('photo')).length>0 ? '250px' : 'auto', maxHeight: '500px', overflow: 'auto'}}>
                <Typography variant="h6">{props.userData[0].title}</Typography>
                <DisplayUserRow  
                  props={props} 
                  questionType={getNonDialogQuestion(page - 1).question_type} 
                  preLoadAttributes={getNonDialogQuestion(page - 1).pre_load_attributes}
                  questionOrder={getNonDialogQuestion(page - 1).question_order}
                  useBoxControls={props.userData[0].useBoxControls}
                  useAutoSpacing={props.userData[0].useAutoSpacing}
                  what3wordsAPI={props.what3wordsAPI}
                  resultValue={results.find(res => res.page == page)}
                  whatPage={page}
                  question={getNonDialogQuestion(page - 1)}
                  onOtherChange={handleOnSubmitOther}
                  onChange={handleToggleChange}
                  onPicture={handleOnPicture}
                  onMultiDrop={handleOnMultiDrop}
                  onDrop={handleOnDrop}
                  onRadio={handleOnRadio}
                  onText={handleOnText}
                  onDate={handleOnDate}
                  onButton={handleOnButton}
                  onSwitch={handleOnSwitch}
                  onNextPage={handleNextPage}
                  nextQuestion={getNextQuestion(getNonDialogQuestion(page - 1))}
                />
              </Box>
              <Pagination count={currentPage} 
                page={page} 
                onChange={handlePageChange} 
                showFirstButton={true}
                showLastButton={true}
                renderItem={(item) => (
                  <PaginationItem
                    slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                  />
                )}
                color="primary"
                size="large"
              />
            </Stack>
            <Stack direction="column">
              {source.length > 0 && 
                source.map(comp => 
                <Paper key={'p' + comp.source} elevation={2} sx={{ width: 100, height: 100, borderRadius: 1}}>
                  <Box key={'b' + comp.source} sx={{ width: 100, height: 100, borderRadius: 1}}>
                    <img src={comp.source} alt={"snap" + comp.source} style={{ height: "inherit", maxWidth: "inherit"}} 
                      onClick={() => {
                        event.preventDefault();
                        setPage(comp.page);
                      }}></img>
                  </Box> 
                </Paper> )}
              <Stack spacing={1}>
                {results.map(comp => comp.type != 'dialog_input' && comp.type != 'photo' && comp.value != null ? 
                <Breadcrumbs aria-label="breadcrumb" key={"b"+comp.id}>
                  <Link component="button" variant="caption" key={comp.id}
                    onClick={() => {
                      event.preventDefault();
                      setPage(comp.page);
                    }}
                  >
                    {comp.value}
                  </Link>
                </Breadcrumbs>
                : null)}
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row">
            <Button variant="contained" color="success" disabled={page == 1} onClick={() => {
              event.preventDefault();
              setPage(page-1);
            }}>Previous</Button>
            <Button variant="contained" 
              color={page <= validPages.length ? "success" : "primary"} 
              type={page <= validPages.length ? "button" : "submit"}
              disabled={page == currentPage && page <= validPages.length} 
              onClick={page < validPages.length ? () => {
                event.preventDefault();
                setPage(page+1);
              } : handleSubmit}>{page < validPages.length ? "Next" : "Finished"}
            </Button>
            <Button variant="contained" color="error" onClick={handleCancel}>Cancel</Button>
          </Stack>
        </Box>
        }
        {props.userData[0].usePagination==0 ?
        <Stack spacing={2} direction="row">
          <Button variant="contained" 
            disabled={props.userData[0].usePagination==0 ? false : page < props.templateQuestions.filter(comp => !comp.question_type.includes('dialog_input')).length ? true : false} 
            type="submit">Save</Button>
          <Button variant="contained" color="error" onClick={handleCancel}>Cancel</Button>
        </Stack> : null }
        </Stack>
      </form> }
      </Paper>
      <div key="postLoadAttributes" dangerouslySetInnerHTML={createMarkup(props.postLoadAttributes)} />
    </React.Fragment>
  );
}
