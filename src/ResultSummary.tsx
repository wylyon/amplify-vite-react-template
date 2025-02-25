
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
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { MenuItem } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

export default function ResultSummary(props) {
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [openGraph, setOpenGraph] = useState(false);
	const [openChoice, setOpenChoice] = useState(false);
	const [id, setId] = useState('');
	const [isBarChart, setIsBarChart] = useState(true);
	const [error, setError] = useState('');
	const [allTemplates, setAllTemplates] = useState('');
	const [needTemplate, setNeedTemplate] = useState(false);
	const [graphTopic, setGraphTopic] = useState('');
	const [graphXAxis, setGraphXAxis] = useState([]);
	const [graphSeries, setGraphSeries] = useState([]);

	const client = generateClient<Schema>();

	const [userData, setUserData] = useState([{
		id: '',
		company: '',
		companyId: '',
		divisionId: '',
		division: '',
		template: '',
		templateId: '',
		question: '',
		result: '',
		count: 0,
	  }]);

	function getDate(value) {
		if (value == null) {
			return null
		}
		return new Date(value);
	  }

	function summarizeData (result, question, sumData) {
		if (result == null) {
			return [];
		}
		var newArr = [...sumData];
		const resultArr = result.split("|");
		resultArr.map(rslt => {
			const existing = newArr.filter(item => item.question.includes(question) && item.result.includes(rslt));
			if (existing && existing.length > 0) {
				newArr.map((item, index) => 
					item.question.includes(question) && item.result.includes(rslt) ?
					newArr[index].count = newArr[index].count+1 : null)
			} else {
				newArr.push({ question: question,
					result: rslt,
					count: 1
				});
			}
		});
		return newArr;
	}

	  function translateUserTemplates (items) {
		var sumData = [];
		for (var i=0; i < items.length; i++) {
		  const item = JSON.parse(items[i]);
		  if (item.question_type != 'photo' && item.result != null) {
			const resultArr = item.result.split("|");
			resultArr.map(rslt => {
				const existing = sumData.filter(comp => comp.question.includes(item.question) && comp.result.includes(rslt));
				if (existing.length > 0) {
					sumData.map((comp, index) => 
						comp.question.includes(item.question) && comp.result.includes(rslt) ?
					sumData[index].count = sumData[index].count+1 : null)
				} else {
					sumData.push({ question: item.question,
						result: rslt,
						count: 1
					});
				}
			});
		  }
		}
		const item = JSON.parse(items[0]);
		var data = [];
		for (var i=0; i < sumData.length; i++) {
		  data.push(
			{id: uuidv4(),
				company: item.company, 
				companyId: item.company_id, 
				divisionId: item.division_id,
				division: item.division,
				template: item.template,
				templateId: item.template_id,
				question: sumData[i].question,
				result: sumData[i].result,
				count: sumData[i].count}
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
		setLoading(false);
	  }

	const allResultTemplates = async () => {
		const { data: items, errors } = 
		props.filter == null ?
			props.templateId == null ?
			await client.queries.resultsTotals() :
			await client.queries.resultsTotalsByTemplateId({
				templateId: props.templateId
			}) :
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
				setNeedTemplate(props.templateId == null);
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
  
	function handleBarChart () {
		const row = userData.filter((row) => row.id == id);
		var xAxis = [];
		var series = [];
		userData.map(comp => comp.question.includes(row[0].question) ?
			xAxis.push(comp.result) : null
		);
		userData.map(comp => comp.question.includes(row[0].question) ?
			series.push({ data: [ comp.count ]}, ) : null
		);
		setIsBarChart(true);
		setOpenChoice(false);
		setGraphTopic(row[0].question);
		setGraphXAxis([{ scaleType: 'band', data: [xAxis]}]);
		setGraphSeries(series);
		setOpenGraph(true);
	}

	function handlePieChart () {
		const row = userData.filter((row) => row.id == id);
		var series = [];
		var indx = 0;
		userData.map(comp => comp.question.includes(row[0].question) ?
				series.push({ id: indx++, value: comp.count, label: comp.result}, )
			 : null
		);
		setIsBarChart(false);
		setOpenChoice(false);
		setGraphTopic(row[0].question);
		setGraphSeries(series);
		setOpenGraph(true);
	}

	function handleRowSelection (rowSelectionModel, details) {
	  // called on checkbox for row.   
	  if (rowSelectionModel.length == 0) {

	  } else {
		if (rowSelectionModel.length == 1) {
			setId(rowSelectionModel[0]);
			setOpenChoice(true);
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
    });

	function handleRowClick (params, event, details) {
	}
  
	function onSelectedTemplate (id) {
		setLoading(true);
		allResults(id);
	}

	function reduceArray (arr) {
		var newArr = [];
		for (var indx = 0; indx < arr.length; indx++) {
			newArr.push({company: arr[indx].company,
				division: arr[indx].division,
				template: arr[indx].template,
				question: arr[indx].question,
				result: arr[indx].result,
				count: arr[indx].count
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
	
		saveAs(blob, "Summary Results By Template.xlsx");
		};

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
			width: 150, 
			headerClassName: 'grid-headers' },
		{ field: 'question',
			headerName: 'Question',
			width: 150, 
		  	headerClassName: 'grid-headers' },
		{ field: 'result',
			headerName: 'Result',
			width: 100, 
			headerClassName: 'grid-headers' },
		{ field: 'count', headerName: 'Count', width: 80, headerClassName: 'grid-headers' },
	  ];

	const handleClose = () => {
		setOpen(false);
		setError('');
	};

	const handleCloseGraph = () => {
		setOpenGraph(false);
	}

	const handleCloseChoice = () => {
		setOpenChoice(false);
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
        open={openChoice}
        onClose={handleCloseChoice}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Which Type of Charting?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
			<Button variant='contained' color='info' onClick={handleBarChart}>Bar Chart</Button>
			<Button variant='contained' color='info' onClick={handlePieChart}>Pie Chart</Button>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='error' onClick={handleCloseChoice} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openGraph}
        onClose={handleCloseGraph}
		maxWidth="lg"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {graphTopic}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
		  	{isBarChart ? <BarChart
				xAxis={graphXAxis}
				series={ graphSeries }
				width={900}
				height={400}
		  	/> :
			 <PieChart
				series={[
					{
						data: graphSeries
					}
				]}
				width={800}
				height={400}
				/>
			}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='error' onClick={handleCloseGraph} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
	<Stack>
		<Stack direction="row" spacing={2} >
			{props.transactionId == null && needTemplate && allTemplates.length > 0 && <SelectTemplate props={props} templateName={userData.length > 0 ? userData[0].template : null} theTemplates={allTemplates} onSelectTemplate={onSelectedTemplate} /> }
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
