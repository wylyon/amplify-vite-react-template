
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
	GridToolbarFilterButton,
	GridCsvExportMenuItem,
	GridToolbarExportContainer,
	GridColumnVisibilityModel, 
	GridActionsCellItem,
	GridEventListener,
	GridRowModel,
	GridRowEditStopReasons, 
	GridPreProcessEditCellProps,
	GridCellParams, gridClasses,
	GridRowId } from '@mui/x-data-grid';
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
import CancelIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { IconButton, MenuItem } from '@mui/material';
import moment from 'moment';
import SelectCustomer from '../src/SelectCustomer';
import Divider from '@mui/material/Divider';
import MapMultipleWithGoogle from '../src/MapMultipleWithGoogle';
import MapIcon from '@mui/icons-material/Map';
import SelectTemplate from '../src/SelectTemplate';
import { Row } from 'aws-cdk-lib/aws-cloudwatch';
import what3words from '@what3words/api';

export default function TransactionsAllByCompany(props) {
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState('');
	const [deleteId, setDeleteId] = useState('');
	const [companyId, setCompanyId] = useState(props.filter == null ? '' : props.filter.id);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [mapKeyId, setMapKeyId] = useState('');
	const [openMap, setOpenMap] = useState(false);
	const [allTemplates, setAllTemplates] = useState('');
	const [needTemplate, setNeedTemplate] = useState(false);
	const [templateId, setTemplateId] = useState(null);

	const client = generateClient<Schema>();
	const [userData, setUserData] = useState([{
		id: '',
		company: '',
		companyId: '',
		title: '',
		templateId: '',
		gpsLat: 0,
		gpsLong: 0,
		what3words: null,
		created: null, 
		createdBy: null,
		locationId: 0
	  }]);
	  const [filterData, setFilterData] = useState([{
		id: '',
		company: '',
		companyId: '',
		title: '',
		templateId: '',
		gpsLat: 0,
		gpsLong: 0,
		what3words: null,
		created: null, 
		createdBy: null,
		locationId: 0
	  }]);

	  function getDate(value) {
		if (value == null) {
			return null
		}
		const date = moment(value);
		const formattedDate = date.format("YYYY-MM-DD 23:00:00");
		return new Date(formattedDate);
	  }
	
	  function translateUserTemplates (items) {
		const item = JSON.parse(items[0]);
		var data = [];
		for (var i=0; i < items.length; i++) {
		  const item = JSON.parse(items[i]);
		  data.push(
			{id: uuidv4(),
				company: item.company, 
				companyId: item.company_id, 
				title: item.title, 
				templateId: item.template_id,
				gpsLat: item.gps_lat,
				gpsLong: item.gps_long,
				what3words: item.what3words,
				created: getDate(item.created),
				createdBy: item.created_by,
				locationId: i+1}
		  );
		}
		return data;
	  }

	const allResults = async (companyId) => {
		const { data: items, errors } = 
		 companyId == 'All' ? await client.queries.transactionsAllCompanies()
			:  await client.queries.transactionsByCompanyId({
			companyId: companyId
		}) ;
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		} else {
			if (Array.isArray(items) && items.length > 0) {
				const db = JSON.stringify(items);
				const userItems = JSON.parse(db);
				const data = translateUserTemplates(userItems);
				var templateData = '';
				var templates = [];
				for (var i=0; i < data.length; i++) {
					var foundIt = true;
					if (templates.length < 0) {
						templates.push(data[i].templateId);
					} else {
						const fil = templates.filter((map) => map == data[i].templateId);
						if (fil.length == 0) {
							templates.push(data[i].templateId);
						} else {
							foundIt = false;
						}
					}
					if (foundIt) {
						templateData = templateData + (i == 0 ? data[i].templateId + "!" + data[i].title : "|" + data[i].templateId + "!" + data[i].title);
					}
				}
				setAllTemplates(templateData);
				setNeedTemplate(true);
				setUserData(data);
				setFilterData(data);
			  } else {
				setNeedTemplate(false);
				setUserData([]);
				setFilterData([]);
			  }
		}
		setLoading(false);
	  }

	useEffect(() => {
		if (companyId != '') {
			setLoading(true);
			allResults(companyId);
		} else {
			setLoading(true);
			allResults('All');
		}
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

	function calcDateFilters (start, end, templateId) {
		if (start == null && end == null && templateId == null) {
			setFilterData(userData);
		} else if (start == null && end == null) {
			setFilterData(userData.filter((row) => row.templateId == templateId));
		} else if (start != null && end == null) {
			setFilterData(userData.filter((row) => row.created >= start && ((templateId != null && row.templateId == templateId) || templateId == null)));
		} else if (start == null && end != null) {
			setFilterData(userData.filter((row) => row.created <= start && ((templateId != null && row.templateId == templateId) || templateId == null)));
		} else {
			setFilterData(userData.filter((row) => row.created >= start && row.created <= end && ((templateId != null && row.templateId == templateId) || templateId == null)));
		}
	}

	const handleStartDate = (e) => {
		if (!isNaN(Date.parse(e.target.value))) {
			setStartDate(getDate(e.target.value));
			calcDateFilters(getDate(e.target.value), endDate, templateId);
		}
	}

	const handleEndDate = (e) => {
		if (!isNaN(Date.parse(e.target.value))) {
			setEndDate(getDate(e.target.value));
			calcDateFilters(startDate, getDate(e.target.value), templateId);
		}
	}

	const handleRowChangeEvent: GridEventListener<'rowCountChange'> = (params, event, details) => {
		//setLoading(false);
	}

	const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
		id: false,
      companyId: false,
	  templateId: false,
    });

	const handleSelectChange = (e) => {
		setLoading(true);
		allResults(e.split("|")[1]);
	  };

	function handleRowClick (params, event, details) {
	}

	const handleCloseMap = () => {
		setOpenMap(false);
	}

	function reduceArray (arr) {
		var newArr = [];
		for (var indx = 0; indx < arr.length; indx++) {
			newArr.push({company: arr[indx].company,
				title: arr[indx].title, 
				gpsLat: arr[indx].gpsLat,
				gpsLong: arr[indx].gpsLong,
				what3words: arr[indx].what3words,
				created: arr[indx].created,
				createdBy: arr[indx].createdBy,
			});
		}
		return newArr;
	}

	const exportToExcel = () => {
		const worksheet = XLSX.utils.json_to_sheet(reduceArray(filterData));
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
	
		// Buffer to store the generated Excel file
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
	
		saveAs(blob, "Log Tool Transaction Detail.xlsx");
		};


	const columns: GridColDef[] = [
		{ field: 'id', headerName: 'Id'},
		{ field: 'company', 
			headerName: 'Company', 
			headerClassName: 'grid-headers',
			width: 150 },
		{ field: 'companyId', 
			headerName: 'Company Id', 
			width: 70 },
		{ field: 'title', 
			headerName: 'Logging App', 
			width: 200, 
			headerClassName: 'grid-headers' },
		{ field: 'templateId',
		  	headerName: 'Template Id',
		  	width: 70 },
		{ field: 'gpsLat',
			headerName: 'gps latitude',
			width: 200, 
		  	headerClassName: 'grid-headers' },
		{ field: 'gpsLong',
			headerName: 'gps longitude',
			width: 200, 
			headerClassName: 'grid-headers' },
		{ field: 'what3words',
			headerName: 'what3words',
			width: 200, 
			headerClassName: 'grid-headers' },
		{ field: 'created', type: 'date', headerName: 'Posted', width: 100, headerClassName: 'grid-headers' },
		{ field: 'createdBy', headerName: 'Posted By', width: 250, headerClassName: 'grid-headers' },
	  ];

	const handleClose = () => {
		setOpen(false);
		setError('');
		setDeleteId('');
	};

	const handleMapIt = () => () => {
		if (userData.length > 0) {
			setLoading(true);
			const row = userData.filter((row) => row.gpsLat > 0);
			setMapKeyId(row[0].id);
			setOpenMap(true);
			setLoading(false);
		}
	}

	function onSelectedTemplate (id) {
		setTemplateId(id == 'All' ? null : id);
		calcDateFilters(startDate, endDate, id == 'All' ? null : id);
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
        open={openMap}
		maxWidth="xl"
        onClose={handleCloseMap}
        aria-labelledby="map-dialog-title"
        aria-describedby="map-dialog-description"
      >
        <DialogTitle id="map-dialog-title">
          Map of Transactions
        </DialogTitle>
        <DialogContent>
			<MapMultipleWithGoogle props={props} markers={filterData} googleAPI={props.googleAPI} />		
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='error' onClick={handleCloseMap} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
		<Stack direction="column" spacing={3} divider={<Divider orientation='horizontal' flexItem />} >
			{companyId == '' && <SelectCustomer  props={props} selected="All" onSelectCompany={handleSelectChange} />}
			<Paper elevation={3}>
				<Typography variant='body1'>Filter By Date</Typography>
				<Stack direction='row' spacing={2}>
					<Typography variant='body1'>Start Date:</Typography>
					<input
						type="date"
						name="startDate"
						placeholder="Start Date"
						size="20"
						onChange={handleStartDate}
					/>
					<Typography variant='body1'>End Date:</Typography>
					<input
						type="date"
						name="endDate"
						placeholder="End Date"
						size="20"
						onChange={handleEndDate}
					/>
					{props.templateId == null && needTemplate && allTemplates.length > 0 && 
						<SelectTemplate props={props} templateName={null} theTemplates={allTemplates} setAll={true}
						onSelectTemplate={onSelectedTemplate} /> }
					<Typography variant='body1'>Overview Map:</Typography>
					<Tooltip title="Press to see overview map of each transaction" placement="top">
						<IconButton aria-label="map" color="primary" size="large" onClick={handleMapIt()}><MapIcon /></IconButton>
					</Tooltip>
				</Stack>
			</Paper>
			<Paper sx={{ height: 600, width: '100%' }} elevation={4}>
				<DataGrid
					rows={filterData}
					slots={{ toolbar: CustomToolbar}}
					loading={loading}
					columns={columns}
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
