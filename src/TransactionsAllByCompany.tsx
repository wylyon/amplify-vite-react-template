
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
import { MenuItem } from '@mui/material';
import moment from 'moment';
import SelectCustomer from '../src/SelectCustomer';

export default function TransactionsAllByCompany(props) {
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState('');
	const [deleteId, setDeleteId] = useState('');
	const [companyId, setCompanyId] = useState(props.filter == null ? '' : props.filter.id);

	const client = generateClient<Schema>();
	const [userData, setUserData] = useState([{
		id: '',
		company: '',
		companyId: '',
		title: '',
		templateId: '',
		numTransactions: 0,
		latestPosting: null,
		earliestPosting: null, 
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
				created: getDate(item.created),
				createdBy: item.created_by,}
		  );
		}
		return data;
	  }

	const allResults = async () => {
		const { data: items, errors } = await client.queries.transactionsByCompanyId({
			companyId: companyId
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
		setLoading(false);
	  }

	useEffect(() => {
		if (companyId != '') {
			setLoading(true);
			allResults();
		} else {
			setLoading(false);
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

	const handleRowChangeEvent: GridEventListener<'rowCountChange'> = (params, event, details) => {
		//setLoading(false);
	}

	const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
		id: false,
      companyId: false,
	  templateId: false,
    });

	const handleSelectChange = (e) => {
		setCompanyId(e.split("|")[1]);
	  };

	function handleRowClick (params, event, details) {
	}


	const exportToExcel = () => {
		const worksheet = XLSX.utils.json_to_sheet(userData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
	
		// Buffer to store the generated Excel file
		const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
		const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
	
		saveAs(blob, "Log Tool Summary Results.xlsx");
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
			headerName: 'Template', 
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
		{ field: 'created', type: 'date', headerName: 'Posted', width: 100, headerClassName: 'grid-headers' },
		{ field: 'createdBy', headerName: 'Posted By', width: 250, headerClassName: 'grid-headers' },
	  ];

	const handleClose = () => {
		setOpen(false);
		setError('');
		setDeleteId('');
	};

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
		<Stack>
			{companyId == '' && <SelectCustomer  props={props} selected="All" onSelectCompany={handleSelectChange} />}
			<Paper sx={{ height: 600, width: '100%' }} elevation={4}>
				<DataGrid
					rows={userData}
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
