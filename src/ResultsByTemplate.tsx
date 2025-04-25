
// @ts-nocheck
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid, 
	GridColDef, 
	GridRowsProp,
	GridRowModesModel,
	GridSlots,
	GridRowModes,
	GridToolbar, 
	GridToolbarContainer,
	GridToolbarColumnsButton,
	GridToolbarQuickFilter,
	GridToolbarDensitySelector,
	GridToolbarExport,
	GridPrintExportMenuItem,
	GridColumnVisibilityModel, 
	GridActionsCellItem,
	GridEventListener,
	GridRowModel,
	GridRowEditStopReasons, 
	GridPreProcessEditCellProps,
	GridCellParams, gridClasses, GridRowHeightParams,
	GridRowId, 
	GridToolbarFilterButton,
	GridCsvExportMenuItem,
	GridToolbarExportContainer,
	useGridApiRef} from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useState, useEffect, useMemo} from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CancelIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import what3words from '@what3words/api';
import SelectTemplate from '../src/SelectTemplate';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import MapIcon from '@mui/icons-material/Map';
import MapWithGoogle from '../src/MapWithGoogle';
import MapMultipleWithGoogleAlt from '../src/MapMultipleWithGoogleAlt';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { IconButton, MenuItem } from '@mui/material';
import { downloadData } from 'aws-amplify/storage';

export default function ResultsByTemplate(props) {
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [openMap, setOpenMap] = useState(false);
	const [openOverviewMap, setOpenOverviewMap] = useState(false);
	const [openPhoto, setOpenPhoto] = useState(false);
	const [error, setError] = useState('');
	const [deleteId, setDeleteId] = useState('');
	const [allTemplates, setAllTemplates] = useState('');
	const [needTemplate, setNeedTemplate] = useState(false);
	const [lat, setLat] = useState('');
	const [lng, setLng] = useState('');
	const [mapKeyId, setMapKeyId] = useState('');
	const [photo, setPhoto] = useState('');
	const [columnsNew, setColumns] = useState<GridColDef[]>([]);
	const [showPoints, setShowPoints] = useState(false);
	const client = generateClient<Schema>();
	const [userData, setUserData] = useState([{
		id: '',
		company: '',
		companyId: '',
		divisionId: '',
		division: '',
		template: '',
		templateId: '',
		transactionId: '',
		question: '',
		questionOrder: 0,
		questionType: '',
		result: '',
		what3words: '',
		lattitude: null,
		longitude: null, 
		status: '',
		notes: '',
		lastUpdated: null,
		created: null,
		createdBy: '',
	  }]);

	  var theGrid = [];
	const apiRef = useGridApiRef();
	function getDate(value) {
		if (value == null) {
			return null
		}
		return new Date(value);
	  }
	
	  function translateUserTemplates (items) {
		var data = [];
		for (var i=0; i < items.length; i++) {
		  const item = JSON.parse(items[i]);
		  data.push(
			{id: uuidv4(),
				company: item.company, 
				companyId: item.company_id, 
				divisionId: item.division_id,
				division: item.division,
				template: item.template,
				templateId: item.template_id,
				transactionId: item.transaction_id,
				question: item.question,
				questionOrder: item.question_order,
				questionType: item.question_type,
				result: item.result,
				created: getDate(item.created),
				what3words: item.what3words,
				lattitude: item.lat,
				longitude: item.lng,
				status: item.status,
				notes: item.reason,
				lastUpdated: getDate(item.last_update),
				createdBy: item.created_by,}
		  );
		}
		return data;
	  }

	  const mergeObjects = (pivotMetrics, pivotQuestion) => {
		var pivot = {};
		for (var i = 0; i < pivotQuestion.length; i++) {
			Object.assign(pivot, pivotQuestion[i]);
		}
		const data = { ...pivotMetrics, ...pivot};
		return data;
	  }

	  const buildOutPivot = (data) => {
		if (data.length < 1) {
			return data;
		}
		var pivotData = [];
		var pivotQuestion = [];
		var pivotMetrics = {};
		var isNew = true;
		var tranie = data[0].transactionId;
		for (var indx = 0; indx < data.length; indx++) {
			if (data[indx].transactionId != tranie) {
				pivotData.push (mergeObjects(pivotMetrics, pivotQuestion));
				tranie = data[indx].transactionId;
				pivotQuestion = [];
				pivotMetrics = {};
				isNew = true;
			}
			if (isNew || data[indx].questionType == 'photo') {
				pivotMetrics = {
					id: data[indx].id,
					company: data[indx].company,
					companyId: data[indx].companyId,
					divisionId: data[indx].divisionId,
					division: data[indx].division,
					template: data[indx].template,
					templateId: data[indx].templateId,
					transactionId: data[indx].transactionId,
					created: data[indx].created,
					what3words: data[indx].what3words,
					lattitude: data[indx].lattitude,
					longitude: data[indx].longitude,
					createdBy: data[indx].createdBy,
					questionType: data[indx].questionType,
					photoAddress: data[indx].result,
					status: data[indx].status,
					notes: data[indx].reason,
					lastUpdated: data[indx].lastUpdated
				};
				isNew = false;
			}
			const myObject = {};
			const newPropertyName = data[indx].question;
			const newPropertyValue = data[indx].questionType == 'photo' ? '...' : data[indx].result;
			myObject[newPropertyName] = newPropertyValue;
			pivotQuestion.push(myObject);
		}
		pivotData.push (mergeObjects(pivotMetrics, pivotQuestion));
		return pivotData;
	  }

	  const buildPivotColumns = (data) => {
		if (data.length < 1) {
			return ;
		}
		var colData = [];
		for (var indx = 0; indx < data.length; indx++) {
			const foundMatch = colData.filter(comp => comp.question == data[indx].question);
			if (foundMatch.length == 0) {
				colData.push( {
					question: data[indx].question, value: data[indx].questionOrder
			});
			}
		}
		colData.sort(function (a, b) {
			if (a.value > b.value) {
				return 1;
			}
			if (a.value < b.value) {
				return -1;
			}
			return 0;
		});

		for (var i = 0; i < colData.length; i++) {
			const columnData = { field: colData[i].question, 
				headerName: colData[i].question, 
				headerClassName: 'grid-headers',
				width: 150 };
			columns.push(columnData);
		}
		setColumns(columns);
	  }

	  const allResults = async (id) => {
		const { data: items, errors } = 
		props.transactionId == null ?
			await client.queries.listResultsByTemplateId({
				templateId: id
			}) :
			await client.queries.listResultsByTransactionId({
				transactionId: id
			});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		} else {
			if (Array.isArray(items) && items.length > 0) {
				const db = JSON.stringify(items);
				const userItems = JSON.parse(db);
				const data = translateUserTemplates(userItems);
				buildPivotColumns(data);
				const pivotData = buildOutPivot(data);
				theGrid = pivotData;
				setUserData(pivotData);
			  }
		}
		if (props.transactionId != null) {
			setLoading(false);
		}
	  }

	const allResultTemplates = async () => {
		const { data: items, errors } = 
		props.filter == null ?
			await client.queries.resultsTotals() :
			await client.queries.resultsTotalsByCompanyId({
				companyId: props.filter.id
			})
		if (errors) {
			setError(errors[0].message);
			setOpen(true);			
		} else {
			if (Array.isArray(items) && items.length > 0) {
				const db = JSON.stringify(items);
				const userItems = JSON.parse(db);
				const item = JSON.parse(userItems[0]);
				allResults(item.template_id);
				var data = item.template_id + "!" + item.title;
				for (var i=1; i < userItems.length; i++) {
					const item = JSON.parse(userItems[i]);
					data = data + "|" + item.template_id + "!" + item.title;
				}
				setAllTemplates(data);
				setNeedTemplate(true);
			  }			
		}
		setLoading(false);
	}

	useEffect(() => {
		props.transactionId == null ?
		allResultTemplates() : allResults(props.transactionId);
	  }, []);

	function handleRowClick (params, event, details) {
	}
  
	function handleRowSelection (rowSelectionModel, details) {
	  // called on checkbox for row.   
	  if (rowSelectionModel.length == 0) {

	  } else {
		if (rowSelectionModel.length == 1) {
			const row = userData.filter((row) => row.id == rowSelectionModel[0]);
			props.onRowSelect(row[0].templateId);
		} else {
		}
	  }
	}

	const handleStatusPoints = (event: React.ChangeEvent<HTMLInputElement>) => {
		setShowPoints(event.target.checked);
	  };

	const handleRowChangeEvent: GridEventListener<'rowCountChange'> = (params, event, details) => {
		//setLoading(false);
	}

	const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
		id: false,
		company: false,
      	companyId: false,
	  	templateId: false,
	  	divisionId: false,
	  	division: false,
	  	template: false,
	  	transactionId: false,
	  	question: false,
	  	result: false
    });

	function handleRowClick (params, event, details) {
	}
  
	function onSelectedTemplate (id) {
		allResults(id);
	}

	function reduceArray (arr) {
		var newArr = [];
		for (var indx = 0; indx < arr.length; indx++) {
			const myObj = arr[indx];
			delete myObj.id;
			delete myObj.companyId;
			delete myObj.divisionId;
			delete myObj.templateId;
			delete myObj.transactionId;
			delete myObj.questionType;
			delete myObj.photoAddress;
			delete myObj.company;
			delete myObj.division;
			newArr.push(myObj);
		}
		return newArr;
	}

	const exportToExcel = () => {
		const worksheet = XLSX.utils.json_to_sheet(reduceArray(userData));
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
	
		// Buffer to store the generated Excel file
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
	
		saveAs(blob, "Log Tool Results By Template.xlsx");
		};

	const handleMapIt = (id: GridRowId) => () => {
		setLoading(true);
		const row = theGrid.filter((row) => row.transactionId == id);
		if (row.length == 0) {
			setLoading (false);
			return;
		}
		setMapKeyId(id);
		setLat(row[0].lattitude);
		setLng(row[0].longitude);
		setOpenMap(true);
		setLoading(false);
	}

	const handleOverviewMapIt = () => () => {
		if (userData.length > 0) {
			setLoading(true);
			const row = userData.filter((row) => row.lattitude > 0);
			setMapKeyId(row[0].id);
			setOpenOverviewMap(true);
			setLoading(false);
		}
	}

	const handlePhoto = (id: GridRowId) => () => {
		const row = theGrid.filter((row) => row.transactionId == id);
		if (row.length < 1) {
			return;
		}
		setPhoto(row[0].questionType == 'photo' ? row[0].createdBy + "/" + row[0].photoAddress : '');
		setError(row[0].question);
		setOpenPhoto(true);
	}

	const handleClose = () => {
		setOpen(false);
		setError('');
		setDeleteId('');
	};

	const handleCloseMap = () => {
		setOpenMap(false);
		setLat(0);
		setLng(0);
	}

	const handleOverviewCloseMap = () => {
		setOpenOverviewMap(false);
		setLat(0);
		setLng(0);
	}

	const handleClosePhoto = () => {
		setOpenPhoto(false);
		setPhoto('');
	}

	const handleDownloadPhoto = async() => {
		const { body, eTag } = await downloadData({
			path: "picture-submissions/" + photo
		}).result;
	}

const columns: GridColDef[] = [
	{ field: 'id', headerName: 'Id'},
	{ field: 'company', 
		headerName: 'Company', 
		headerClassName: 'grid-headers',
		width: 150 },
	{ field: 'division', 
		headerName: 'Division', 
		headerClassName: 'grid-headers',
		width: 100 },
	{ field: 'companyId', 
		headerName: 'Company Id', 
		width: 70 },
	{ field: 'divisionId', 
		headerName: 'Division Id', 
		width: 70 },
	{ field: 'templateId', 
		headerName: 'Template Id', 
		width: 70 },
	{ field: 'template', 
		headerName: 'Logging App', 
		width: 140, 
		headerClassName: 'grid-headers' },
	{ field: 'transactionId', 
		headerName: 'Transaction Id', 
		valueGetter: (value) => {
			return value.substring(1, 4) + "..."; },
		width: 80, 
		headerClassName: 'grid-headers' },
	{ field: 'created', type: 'dateTime', headerName: 'Post Date', width: 100, headerClassName: 'grid-headers' },
	{ field: 'createdBy', headerName: 'Creator', width: 170, headerClassName: 'grid-headers' },
	{ field: 'question',
		headerName: 'Question',
		width: 170, 
		  headerClassName: 'grid-headers' },
	{ field: 'result',
		headerName: 'Result',
		valueGetter: (value) => {
			if (value == null) {
				return null;
			}
			const valueParsed = value.toString().replaceAll("|", " and ");
			return valueParsed },
		width: 170, 
		headerClassName: 'grid-headers' },
	{ field: 'what3words', headerName: 'What3words', width: 200, headerClassName: 'grid-headers' },
	{ field: 'lattitude', headerName: 'Latitude', width: 150, headerClassName: 'grid-headers' },
	{ field: 'longitude', headerName: 'Longitude', width: 150, headerClassName: 'grid-headers' },
	{ field: 'status', headerName: 'Status', width: 80, headerClassName: 'grid-headers',
		cellClassName: (params: GridCellParams<any, number>) => {
			if (params.value == 'Open') {
				return 'grid-open';
			} else if (params.value == 'Pending') {
				return 'grid-pending'
			} else if (params.value == 'Closed') {
				return 'grid-closed'
			}
			return '';
		}
	},
	{ field: 'notes', headerName: 'Notes', width: 120, headerClassName: 'grid-headers'},
	{ field: 'lastUpdated', type: 'dateTime', headerName: 'Updated', width: 100, headerClassName: 'grid-headers'},
	{ field: 'actions', headerName: 'Actions', headerClassName: 'grid-headers',
		type: 'actions',
		width: 80,
		getActions: ({ id }) => {
			const row = theGrid.filter((row) => row.transactionId == id);
			return [
			<Tooltip title="View On Map">
				<GridActionsCellItem icon={<MapIcon />} label="Map" color='success' onClick={handleMapIt(id)} />
			</Tooltip>,
			<Tooltip title="View Photo">
				<GridActionsCellItem icon={<PhotoCameraIcon />} label="Photo" color='success' disabled={row.length > 0 && row[0].questionType=='photo' ? false : true} onClick={handlePhoto(id)} />
			</Tooltip>,
			]
		}
	}
  ];
function CustomToolbar() {
	return (
		<GridToolbarContainer>
			<GridToolbarColumnsButton />
			<GridToolbarFilterButton />
			<GridToolbarDensitySelector />
			<GridToolbarExportContainer>
				<GridCsvExportMenuItem />
				<MenuItem
					onClick={exportToExcel} >
					Export Excel Spreadsheet
				</MenuItem>
				<GridPrintExportMenuItem />
			</GridToolbarExportContainer>
		</GridToolbarContainer>
	);
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
          {"ERROR"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
			{error}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='error' onClick={handleClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openPhoto}
        onClose={handleClosePhoto}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Photo"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
			{error}
          </DialogContentText>
		  {photo != '' ? <StorageImage alt={photo} path={"picture-submissions/" + photo}/> : "<< No Photo Available >>" }
        </DialogContent>
        <DialogActions>
			<Button variant='contained' disabled={photo == ''} color='primary' onClick={handleDownloadPhoto}>Download</Button>
          	<Button variant='contained' color='error' onClick={handleClosePhoto} autoFocus>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openMap}
        onClose={handleCloseMap}
        aria-labelledby="map-dialog-title"
        aria-describedby="map-dialog-description"
      >
        <DialogTitle id="map-dialog-title">
          {"Map of " + lat + "," + lng}
        </DialogTitle>
        <DialogContent>
			<MapWithGoogle props={props} lat={lat} lng={lng} mapKeyId={mapKeyId} googleAPI={props.googleAPI} />		
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='error' onClick={handleCloseMap} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openOverviewMap}
		maxWidth="xl"
        onClose={handleOverviewCloseMap}
        aria-labelledby="map-dialog-title"
        aria-describedby="map-dialog-description"
      >
        <DialogTitle id="map-dialog-title">
          Map of Transactions
        </DialogTitle>
        <DialogContent>
			<FormGroup>
				<FormControlLabel control={<Switch onChange={handleStatusPoints} />} label="Show Status Points" />
			</FormGroup>
			<MapMultipleWithGoogleAlt props={props} markers={userData} points={showPoints} googleAPI={props.googleAPI} />		
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='error' onClick={handleOverviewCloseMap} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
	<Stack>
		<Stack direction="row" spacing={2} >
			{props.transactionId == null && needTemplate && allTemplates.length > 0 && 
				<SelectTemplate props={props} templateName={userData.length > 0 ? userData[0].template : null} theTemplates={allTemplates} onSelectTemplate={onSelectedTemplate} setAll={false}/> }
			<Tooltip title="Press to see overview map of each transaction" placement="top">
				<Button variant="contained" color="secondary" aria-label="overview map" onClick={handleOverviewMapIt()} startIcon={<MapIcon />}>Overview Map</Button>
			</Tooltip>
		</Stack>
		<Paper sx={{ height: 600, width: '100%' }} elevation={4}>
			<DataGrid
				rows={userData}
				slots={{ toolbar: CustomToolbar}}
				loading={loading}
				columns={columnsNew.length < 1 ? columns : columnsNew}
				getRowHeight={() => 'auto'}
				getRowId={(row) => row.transactionId}
				columnVisibilityModel={columnVisibilityModel}
				onColumnVisibilityModelChange={(newCompany) =>
					setColumnVisibilityModel(newCompany)
				}
				initialState={{ 
					pagination: { paginationModel: { pageSize: 10} },
					sorting: {
						sortModel: [{ field: 'created', sort: 'desc'}]
					}
				}}
				pageSizeOptions={[10, 20, 50, 100, { value: -1, label: 'All'}]}
				onRowClick={handleRowClick}
				onRowCountChange={handleRowChangeEvent}
				onRowSelectionModelChange={handleRowSelection}
				sx={{ border: 0 }}
			/> 
  		</Paper>
	</Stack>
	</React.Fragment>
  );
}
