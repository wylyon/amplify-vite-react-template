
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
	GridToolbarExportContainer} from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useState, useEffect} from "react";
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
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { MenuItem } from '@mui/material';

export default function ResultsByTemplate(props) {
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
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
		questionType: '',
		result: '',
		what3words: '',
		lattitude: null,
		longitude: null, 
		created: null,
		createdBy: '',
	  }]);

	function getDate(value) {
		if (value == null) {
			return null
		}
		return new Date(value);
	  }
	
	  function translateUserTemplates (items) {
		const item = JSON.parse(items[0]);
		var data = [{id: uuidv4(),
			company: item.company, 
			companyId: item.company_id, 
			divisionId: item.division_id,
			division: item.division,
			template: item.template,
			templateId: item.template_id,
			transactionId: item.transaction_id,
			question: item.question,
			questionType: item.question_type,
			result: item.result,
			created: getDate(item.created),
			what3words: item.what3words,
			lattitude: item.lat,
			longitude: item.lng,
			createdBy: item.created_by,
		  }];
		for (var i=1; i < items.length; i++) {
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
				questionType: item.question_type,
				result: item.result,
				created: getDate(item.created),
				what3words: item.what3words,
				lattitude: item.lat,
				longitude: item.lng,
				createdBy: item.created_by,}
		  );
		}
		return data;
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
				setUserData(data);
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
		allResultTemplates() : allResults(props.transactionId)
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

	const handleRowChangeEvent: GridEventListener<'rowCountChange'> = (params, event, details) => {
		//setLoading(false);
	}

	const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
		id: false,
		company: false,
      companyId: false,
	  templateId: false,
	  divisionId: false,
	  what3words: false,
    });

	function handleRowClick (params, event, details) {
	}
  
	function onSelectedTemplate (id) {
		allResults(id);
	}

	function reduceArray (arr) {
		var newArr = [];
		for (var indx = 0; indx < arr.length; indx++) {
			newArr.push({company: arr[indx].company,
				division: arr[indx].division,
				template: arr[indx].template,
				question: arr[indx].question,
				questionType: arr[indx].questionType,
				result: arr[indx].result,
				postDate: arr[indx].created,
				latitude: arr[indx].lattitude,
				longitude: arr[indx].longitude,
				creator: arr[indx].createdBy
			});
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
		const row = userData.filter((row) => row.id == id);
		setMapKeyId(id);
		setLat(row[0].lattitude);
		setLng(row[0].longitude);
		setOpenMap(true);
		setLoading(false);
	}

	const handlePhoto = (id: GridRowId) => () => {
		const row = userData.filter((row) => row.id == id);
		setPhoto(row[0].questionType == 'photo' ? row[0].createdBy + "/" + row[0].result : '');
		setError(row[0].question);
		setOpenPhoto(true);
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
			headerName: 'Template', 
			width: 140, 
			headerClassName: 'grid-headers' },
		{ field: 'transactionId', 
			headerName: 'Transaction Id', 
			valueGetter: (value) => {
				return value.substring(1, 4) + "..."; },
			width: 80, 
			headerClassName: 'grid-headers' },
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
		{ field: 'what3words', headerName: 'What3words', width: 150, headerClassName: 'grid-headers' },
		{ field: 'lattitude', headerName: 'Latitude', width: 110, headerClassName: 'grid-headers' },
		{ field: 'longitude', headerName: 'Longitude', width: 110, headerClassName: 'grid-headers' },
		{ field: 'created', type: 'dateTime', headerName: 'Post Date', width: 100, headerClassName: 'grid-headers' },
		{ field: 'createdBy', headerName: 'Creator', width: 150, headerClassName: 'grid-headers' },
		{ field: 'actions', headerName: 'Actions', headerClassName: 'grid-headers',
			type: 'actions',
			width: 80,
			getActions: ({ id }) => {
				const row = userData.filter((row) => row.id == id);
				return [
				<Tooltip title="View On Map">
					<GridActionsCellItem icon={<MapIcon />} label="Map" color='success' onClick={handleMapIt(id)} />
				</Tooltip>,
				<Tooltip title="View Photo">
					<GridActionsCellItem icon={<PhotoCameraIcon />} label="Photo" color='success' disabled={row[0].questionType=='photo' ? false : true} onClick={handlePhoto(id)} />
				</Tooltip>,
				]
			}
		}
	  ];

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
	<Stack>
		<Stack direction="row" spacing={2} >
			{props.transactionId == null && needTemplate && allTemplates.length > 0 && 
				<SelectTemplate props={props} templateName={userData.length > 0 ? userData[0].template : null} theTemplates={allTemplates} onSelectTemplate={onSelectedTemplate} setAll={false}/> }
		</Stack>
		<Paper sx={{ height: 600, width: '100%' }} elevation={4}>
			<DataGrid
				rows={userData}
				slots={{ toolbar: CustomToolbar}}
				loading={loading}
				columns={columns}
				getRowHeight={() => 'auto'}
				columnVisibilityModel={columnVisibilityModel}
				onColumnVisibilityModelChange={(newCompany) =>
					setColumnVisibilityModel(newCompany)
				}
				initialState={{ pagination: { paginationModel: { pageSize: 10} } }}
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
