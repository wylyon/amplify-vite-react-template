
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
	GridColumnVisibilityModel, 
	GridActionsCellItem,
	GridEventListener,
	GridRowModel,
	GridRowEditStopReasons, 
	GridPreProcessEditCellProps,
	GridCellParams, gridClasses, GridRowHeightParams, 
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
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CancelIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';
import what3words from '@what3words/api';
import SelectTemplate from '../src/SelectTemplate';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';

export default function ResultsByTemplate(props) {
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState('');
	const [deleteId, setDeleteId] = useState('');
	const [allTemplates, setAllTemplates] = useState('');
	const [needTemplate, setNeedTemplate] = useState(false);
	const [checked, setChecked] = useState(false);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	  setChecked(event.target.checked);
	};

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

	  const allResults = async (templateId) => {
		const { data: items, errors } = await client.queries.listResultsByTemplateId({
			templateId: templateId
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

	function handleRowClick (params, event, details) {
	}
  
	function handleRowSelection (rowSelectionModel, details) {
	  // called on checkbox for row.   
	  if (rowSelectionModel.length == 0) {

	  } else {
		if (rowSelectionModel.length == 1) {
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
	  divisionId: false,
    });

	function handleRowClick (params, event, details) {
	}
  
	function onSelectedTemplate (id) {
		allResults(id);
	}

	function handleRowSelection (rowSelectionModel, details) {
	  // called on checkbox for row.   
	  if (rowSelectionModel.length == 0) {

	  } else {
		if (rowSelectionModel.length == 1) {
		} else {
		}
	  }
	}

	const renderPhotoCell: GridColDef['renderCell'] = (params) => {
		return checked && params.row.questionType == 'photo' ? <StorageImage alt={params.value} path={"picture-submissions/" + params.value}/> : params.value;
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
			width: 150 },
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
			width: 200, 
			headerClassName: 'grid-headers' },
		{ field: 'transactionId', 
			headerName: 'Transaction Id', 
			valueGetter: (value) => {
				return value.substring(1, 4) + "..."; },
			width: 80, 
			headerClassName: 'grid-headers' },
		{ field: 'question',
			headerName: 'Question',
			width: 200, 
		  	headerClassName: 'grid-headers' },
		{ field: 'result',
			headerName: 'Result',
			width: 200, 
			renderCell: renderPhotoCell,
			headerClassName: 'grid-headers' },
		{ field: 'what3words', headerName: 'What3words', width: 200, headerClassName: 'grid-headers' },
		{ field: 'lattitude', headerName: 'Latitude', width: 150, headerClassName: 'grid-headers' },
		{ field: 'longitude', headerName: 'Longitude', width: 150, headerClassName: 'grid-headers' },
		{ field: 'created', type: 'date', headerName: 'Post Date', width: 100, headerClassName: 'grid-headers' },
		{ field: 'createdBy', headerName: 'Creator', width: 200, headerClassName: 'grid-headers' },
	  ];

	const handleClose = () => {
		setOpen(false);
		setError('');
		setDeleteId('');
	};

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
		<Stack direction="row" spacing={2} >
			{needTemplate && allTemplates.length > 0 && <SelectTemplate props={props} theTemplates={allTemplates} onSelectTemplate={onSelectedTemplate} /> }
      		<FormControlLabel control={
				<Switch checked={checked}
				onChange={handleChange} />} label="Show Photos" />
		</Stack>
		<Paper sx={{ height: 600, width: '100%' }} elevation={4}>
			<DataGrid
				rows={userData}
				slots={{ toolbar: GridToolbar}}
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
