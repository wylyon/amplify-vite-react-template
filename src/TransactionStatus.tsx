
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
import PopupStatus from '../src/PopupStatus';
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import EditAttributesIcon from '@mui/icons-material/EditAttributes';
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
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CircularProgress from '@mui/material/CircularProgress';
import { MenuItem } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function TransactionStatus(props) {
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [isWaiting, setIsWaiting] = useState(false);
	const [openMap, setOpenMap] = useState(false);
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
	const [status, setStatus] = useState('');
	const [reason, setReason] = useState('');
	const [openStatus, setOpenStatus] = useState(false);
	const [tranyId, setTranyId] = useState(null);
	const [statusFilter, setStatusFilter] = useState('All');
	const [batchIds, setBatchIds] = useState([]);

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
		reason: '',
		lastUpdated: null,
		created: null,
		createdBy: '',
	  }]);

	  var theGrid = userData.length > 0 ? userData : [];
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
				reason: item.reason,
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
					reason: data[indx].reason,
					lastUpdated: data[indx].lastUpdated
				};
				isNew = false;
			}
			const myObject = {};
			const newPropertyName = data[indx].question;
			const newPropertyValue = data[indx].result;
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
		columns.push(actionColumns[0]);
		setColumns(columns);
	  }

	  const allResults = async (id) => {
		setIsWaiting(true);
		const { data: items, errors } = await client.queries.listResultsByTemplateId({
				templateId: id
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
		setIsWaiting(false);
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
		allResultTemplates();
	  }, []);

	const updateTransformArray = (arr, id, newStatus, newReason) => {
		const newUserData = [];
		const now = new Date();
		for (var indx = 0; indx < arr.length; indx++) {
			if (userData[indx].transactionId == id) {
				const newObj = arr[indx];
				newObj.status = newStatus;
				newObj.reason = newReason;
				newObj.lastUpdated = now;
				newUserData[indx] = newObj;
			} else {
				newUserData[indx] = arr[indx];
			}
		}
		return newUserData;
	} 

	const updateTransaction = async(id, newStatus, newReason) => {
		const now = new Date();
		setIsWaiting(true);
		const { errors, data: items } = await client.models.transactions.update({
			id: id,
			status: newStatus,
			reason: newReason,
			last_update: now
		});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);	
		} else {
			if (userData.length == 0 || (userData.length == 1 && userData[0].id == "")) {
				setUserData(updateTransformArray(theGrid, id, newStatus, newReason));
			} else {
				theGrid = updateTransformArray(userData, id, newStatus, newReason);
				setUserData(theGrid);
			}
		}
		setIsWaiting(false);
	}
  
	function handleRowSelection (rowSelectionModel, details) {
	  // called on checkbox for row.   
	  if (rowSelectionModel.length == 0) {
		setBatchIds([]);
	  } else {
		const rowIds = [];
		for (var indx = 0; indx < rowSelectionModel.length; indx++) {
			rowIds.push(rowSelectionModel[indx]);
		}
		setBatchIds(rowIds);
	  }
	}

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
	  	result: false,
		what3words: false,
		lattitude: false,
		longitude: false
    });

	function handleRowClick (params, event, details) {
	}
  
	function onSelectedTemplate (id) {
		allResults(id);
	}

	const handleEditIt = (id: GridRowId) => () => {
		const row = theGrid.filter((row) => row.transactionId == id);
		if (row.length < 1) {
			return;
		}
		setTranyId(id);
		setStatus(row[0].status);
		setReason(row[0].reason);
		setOpenStatus(true);
	}

	const handleStatus = (statusType, id: GridRowId) => () => {
		const row = theGrid.filter((row) => row.transactionId == id);
		if (row.length < 1) {
			return;
		}
		setTranyId(id);
		setStatus(statusType);
		setReason(row[0].reason);
		updateTransaction(id, statusType, row[0].reason);
	}

	const handleBatchStatus = () => {
		setTranyId(null);
		setStatus('Open');
		setReason('');
		setOpenStatus(true);
	}

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

	const handleStatusFilter = (event: React.MouseEvent<HTMLElement>, newStatus: string | null) => {
		setStatusFilter(newStatus);
	}

	const handleOnStatus = (id, stat, reas) => {
		setOpenStatus(false);
		if (id == null) {
			for (var indx = 0; indx < batchIds.length; indx++) {
				updateTransaction(batchIds[indx], stat, reas);
			}
		} else {
			updateTransaction(id, stat, reas);
		}
	}

	const handleOnStatusClosed = (e) => {
		setOpenStatus(false);
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

	const handleClosePhoto = () => {
		setOpenPhoto(false);
		setPhoto('');
	}

const actionColumns: GridColDef[] = [
	{ field: 'actions', headerName: 'Actions', headerClassName: 'grid-headers',
		type: 'actions',
		width: 80,
		getActions: ({ id }) => {
			return [
			<Tooltip title="Press to edit Status and Reason." placement="top">
				<GridActionsCellItem icon={<EditAttributesIcon />} label="Edit Status/Reason" color='primary' onClick={handleEditIt(id)} />
			</Tooltip>,
			<GridActionsCellItem sx={{ backgroundColor: '#73AD21'}} label='Set Status OPEN' onClick={handleStatus('Open', id)} showInMenu/>,
			<GridActionsCellItem sx={{ backgroundColor: 'burlywood'}} label='Set Status PENDING' onClick={handleStatus('Pending', id)} showInMenu/>,
			<GridActionsCellItem sx={{ backgroundColor: '#2196F3'}} label='Set Status CLOSED' onClick={handleStatus('Closed', id)} showInMenu/>,
			]
		}
	}
];

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
	{ field: 'reason', headerName: 'Notes', width: 120, headerClassName: 'grid-headers'},
	{ field: 'lastUpdated', type: 'dateTime', headerName: 'Updated', width: 100, headerClassName: 'grid-headers'},
	{ field: 'mapPicActions', headerName: 'Map/Picture', headerClassName: 'grid-headers',
		type: 'actions',
		width: 100,
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
          <Button variant='contained' color='error' onClick={handleClosePhoto} autoFocus>
            Cancel
          </Button>
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
	  {isWaiting && <CircularProgress />}
	  {openStatus && <PopupStatus props={props} id={tranyId} status={status} reasons={reason} onStatus={handleOnStatus} onStatusClosed={handleOnStatusClosed}/>}
	<Stack>
		<Stack direction="row" spacing={2} >
			{props.transactionId == null && needTemplate && allTemplates.length > 0 && 
				<SelectTemplate props={props} templateName={userData.length > 0 ? userData[0].template : null} theTemplates={allTemplates} onSelectTemplate={onSelectedTemplate} setAll={false}/> }
			<ToggleButtonGroup value={statusFilter} exclusive aria-label='Filter Status' onChange={handleStatusFilter}> 
				<ToggleButton value="All" aria-label='filter all'>All</ToggleButton>
				<ToggleButton value="Open" aria-label='filter open' sx={{ backgroundColor: '#73AD21'}}>Open</ToggleButton>
				<ToggleButton value="Pending" aria-label='filter pending' sx={{ backgroundColor: 'burlywood'}}>Pending</ToggleButton>
				<ToggleButton value="Closed" aria-label='filter closed' sx={{ backgroundColor: '#2196F3'}}>Closed</ToggleButton>
			</ToggleButtonGroup>
			<ToggleButton value="Change" aria-label="change status" disabled={batchIds.length == 0} onClick={handleBatchStatus}>Update Status</ToggleButton>
		</Stack>
		<Paper sx={{ height: 600, width: '100%' }} elevation={4}>
			{userData.length > 1 && userData[0].id != '' ?
			<DataGrid
				rows={statusFilter == 'All' ? userData : userData.filter(comp => comp.status == statusFilter)}
				slots={{ toolbar: CustomToolbar}}
				loading={loading}
				columns={columnsNew.length < 1 ? columns : columnsNew}
				getRowHeight={() => 'auto'}
				getRowId={(row) => row.transactionId}
				columnVisibilityModel={columnVisibilityModel}
				checkboxSelection
				disableRowSelectionOnClick
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
			/> : null }
  		</Paper>
	</Stack>
	</React.Fragment>
  );
}
