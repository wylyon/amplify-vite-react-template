
// @ts-nocheck
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid, 
	GridColDef, 
	GridRowsProp,
	GridRowModesModel,
	GridSlots,
	GridToolbar, 
	GridToolbarContainer,
	GridColumnVisibilityModel, 
	GridActionsCellItem, 
	GridRowId } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useState, useEffect} from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Tooltip from '@mui/material/Tooltip';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import BuildIcon from '@mui/icons-material/Build';
import EditIcon from '@mui/icons-material/Edit';
import usePagination from '@mui/material/usePagination/usePagination';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

interface EditToolbarProps {
	setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
	setRowModesModel: (
	  newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
	) => void;
  }

function EditToolbar(props: EditToolbarProps) {
	const { setRows, setRowModesModel } = props;
  
	const handleClick = () => {
	  const id = randomId();
	  setRows((oldRows) => [
		...oldRows,
		{ id, name: '', age: '', role: '', isNew: true },
	  ]);
	  setRowModesModel((oldModel) => ({
		...oldModel,
		[id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
	  }));
	};
  
	return (
	  <GridToolbarContainer>
		<Tooltip title="Add a new User">
			<Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
		  	Add record
			</Button>
		</Tooltip>
		<Tooltip title="Deactivate a User">
			<IconButton color="warning" aria-label="Deactivate a Template"><DeleteOutlineIcon /></IconButton>
		</Tooltip>
		<Tooltip title="Delete a User">
			<IconButton color="error" aria-label="Delete a Template"><DeleteIcon /></IconButton>
		</Tooltip>
		<Tooltip title="ReActivate a User">
			<IconButton color="default" aria-label='Reactivate a Template'><AddCircleOutlineIcon /></IconButton>
		</Tooltip>
	  </GridToolbarContainer>
	);
  }

export default function UserGrid(props) {
	const [loading, setLoading] = useState(true);

	const client = generateClient<Schema>();
	const [userData, setUserData] = useState([{
		id: '',   
		divisionId: '',
		division: '',
		company: '',
		companyId: '',
		email: '',
		firstName: '',
		lastName: '',
		middleName: '',
		activeDate: null,
		deactiveDate: null,
		created: '',
		createdBy: '',
	  }]);
	  const [checked, setChecked] = useState(true);

	  const handleUserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked);
		getTemplates(event.target.checked);
	  };

	  function getDate(value) {
		if (value == null) {
			return null
		}
		return new Date(value);
	  }

	  function translateUserTemplate (item) {
		const data = [{id: item.id, 
			company: item.company, 
			divisionId: item.division_id,
			division: item.division,
			companyId: item.company_id,
			email: item.email_address,
			firstName: item.first_name,
			lastName: item.last_name,
			middleName: item.middle_name,
			activeDate: getDate(item.active_date),
			deactiveDate: getDate(item.deactive_date),
			created: item.created,
			createdBy: item.created_by,
		  }];
		return data;
	  }
	
	  function translateUserTemplates (items) {
		const item = JSON.parse(items[0]);
		var data = [{id: item.id, 
			company: item.company, 
			divisionId: item.division_id,
			division: item.division,
			companyId: item.company_id,
			email: item.email_address,
			firstName: item.first_name,
			lastName: item.last_name,
			middleName: item.middle_name,
			activeDate: getDate(item.active_date),
			deactiveDate: getDate(item.deactive_date),
			created: item.created,
			createdBy: item.created_by,
		  }];
		for (var i=1; i < items.length; i++) {
		  const item = JSON.parse(items[i]);
		  data.push(
			{id: item.id, 
				company: item.company, 
				divisionId: item.division_id,
				division: item.division,
				companyId: item.company_id,
				email: item.email_address,
				firstName: item.first_name,
				lastName: item.last_name,
				middleName: item.middle_name,
				activeDate: getDate(item.active_date),
				deactiveDate: getDate(item.deactive_date),
				created: item.created,
				createdBy: item.created_by,}
		  );
		}
		return data;
	  }

	  const getTemplates = async (isAdmin) => {
		const { data: items, errors } = 
			(isAdmin) ? await client.queries.listAllAdmin({
		}) : await client.queries.listAllUsers({});
		if (Array.isArray(items) && items.length > 0) {
		  const db = JSON.stringify(items);
		  const userItems = JSON.parse(db);
		  if (items.length < 2) {
			setUserData(translateUserTemplate (userItems));
		  } else {
			setUserData(translateUserTemplates (userItems));
		  }
		  setLoading(false);
		}
	  };

	useEffect(() => {
		getTemplates(true);
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
	}

	const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
      id: false,
	  companyId: false,
	  divisionId: false,
    });

	function handleDeactivate (id) {
	}

	function handleActivate (id) {
	}
	
	function handleDelete (id) {
	}

	function handleAssociations (id) {
	}

	function handleBuild (id) {
	}

	function handleEdit (id) {
	}

	const columns: GridColDef[] = [
		{ field: 'id', headerName: 'Id', width: 70 },
		{ field: 'divisionId', headerName: 'DivisionId', width: 70 },
		checked ? { field: 'companyId', headerName: 'CompanyId', width: 70 } : 
		 { field: 'division', headerName: 'Division Name', width: 200, headerClassName: 'grid-headers' },
		{ field: 'company', headerName: 'Company Name', width: 200, headerClassName: 'grid-headers' },
		{ field: 'email', headerName: 'Email Address', width: 200, headerClassName: 'grid-headers' },
		{ field: 'firstName', headerName: 'First Name', width: 150, headerClassName: 'grid-headers' },
		{ field: 'lastName', headerName: 'Last Name', width: 150, headerClassName: 'grid-headers' },
		{ field: 'middleName', headerName: 'Middle', width: 100, headerClassName: 'grid-headers' },
		{
		  field: 'activeDate',
		  type: 'date',
		  headerName: 'Active',
		  width: 100, headerClassName: 'grid-headers'
		},
		{ field: 'deactiveDate', headerName: 'DeActive', type: 'date', width: 100, headerClassName: 'grid-headers' },
		{ field: 'actions', headerName: 'Actions', headerClassName: 'grid-headers',
			type: 'actions',
			width: 80,
			getActions: (params) => [
				<GridActionsCellItem icon={<EditIcon />} label="Edit" color='primary' onClick={handleEdit(params.id)} />,
				<GridActionsCellItem icon={<DeleteOutlineIcon />} label="Deactivate" onClick={handleDeactivate(params.id)} showInMenu/>,
				<GridActionsCellItem icon={<AddCircleOutlineIcon />} label="Activate" onClick={handleActivate(params.id)} showInMenu/>,
				<GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDelete(params.id)} showInMenu />,
			],
		}
	  ];

	const paginationModel = { page: 0, pageSize: 9 };

  return (
	<Stack>
    <FormGroup>
      <Typography variant='subtitle1'>Company User 
		<FormControlLabel control={<Switch defaultChecked onChange={handleUserChange}/>} 
			label="Admin User" />
	  </Typography>
    </FormGroup>
		<Paper sx={{ height: 600, width: '100%' }} elevation={4}>
			<DataGrid
			rows={userData}
			slots={{ toolbar: GridToolbar}}
			loading={loading}
			columns={columns}
			columnVisibilityModel={columnVisibilityModel}
			onColumnVisibilityModelChange={(newCompany) =>
				setColumnVisibilityModel(newCompany)
			}
			initialState={{ pagination: { paginationModel } }}
			pageSizeOptions={[9, 10]}
			checkboxSelection
			onRowClick={handleRowClick}
			onRowCountChange={handleRowChangeEvent}
			onRowSelectionModelChange={handleRowSelection}
			sx={{ border: 0 }}
			slots={{
				toolbar: EditToolbar as GridSlots['toolbar'],
			  }}
			/>
		</Paper>
	</Stack>
  );
}
