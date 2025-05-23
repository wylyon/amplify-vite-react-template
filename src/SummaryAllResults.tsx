
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

export default function SummaryAllResults(props) {
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState('');
	const [deleteId, setDeleteId] = useState('');

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

	  const visibilityJSON = localStorage.getItem("summaryResults_visibility");
	  const visibilityModel = (visibilityJSON) ? JSON.parse(visibilityJSON) : {
		id: false,
      	companyId: false,
	  	templateId: false,
	  };
	  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(visibilityModel);
	  const filterJSON = localStorage.getItem("summaryResults_filter");
	  const initialFilterModel = (filterJSON) ? JSON.parse(filterJSON) : {items: []};
	  const [filterModel, setFilterModel] = useState<GridFilterModel>(initialFilterModel);

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
		var data = [{id: uuidv4(),
			company: item.company, 
			companyId: item.company_id, 
			title: item.title, 
			templateId: item.template_id,
			numTransactions: item.num_transactions,
			latestPosting: getDate(item.latest_posting),
			earliestPosting: getDate(item.earliest_posting),
		  }];
		for (var i=1; i < items.length; i++) {
		  const item = JSON.parse(items[i]);
		  data.push(
			{id: uuidv4(),
				company: item.company, 
				companyId: item.company_id, 
				title: item.title, 
				templateId: item.template_id,
				numTransactions: item.num_transactions,
				latestPosting: getDate(item.latest_posting),
				earliestPosting: getDate(item.earliest_posting),}
		  );
		}
		return data;
	  }

	const allResults = async () => {
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
				const data = translateUserTemplates(userItems);
				setUserData(data);
			  }
		}
		setLoading(false);
	  }

	useEffect(() => {
		allResults();
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

	function handleRowClick (params, event, details) {
	}

	function reduceArray (arr) {
		var newArr = [];
		for (var indx = 0; indx < arr.length; indx++) {
			newArr.push({company: arr[indx].company,
				title: arr[indx].title,
				numTransactions: arr[indx].numTransactions,
				latestPosting: arr[indx].latestPosting,
				earliestPosting: arr[indx].earliestPosting
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
			headerName: 'Logging App', 
			width: 200, 
			headerClassName: 'grid-headers' },
		{ field: 'templateId',
		  	headerName: 'Template Id',
		  	width: 70 },
		{ field: 'numTransactions',
			headerName: 'Transactions',
			width: 100, 
		  	headerClassName: 'grid-headers' },
		{ field: 'latestPosting', type: 'date', headerName: 'Latest', width: 100, headerClassName: 'grid-headers' },
		{ field: 'earliestPosting', type: 'date', headerName: 'Earliest', width: 100, headerClassName: 'grid-headers' },
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
		<Paper sx={{ height: 600, width: '100%' }} elevation={4}>
			<DataGrid
				rows={userData}
				slots={{ toolbar: CustomToolbar}}
				loading={loading}
				columns={columns}
				columnVisibilityModel={columnVisibilityModel}
				onColumnVisibilityModelChange={(newCompany) => {
					localStorage.setItem("summaryResults_visibility", JSON.stringify(newCompany));
					setColumnVisibilityModel(newCompany);
				}
				}
				filterModel={filterModel}
				onFilterModelChange={(newCompany) => {
					localStorage.setItem("summaryResults_filter", JSON.stringify(newCompany));
					setFilterModel(newCompany);
				}}
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
