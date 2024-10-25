
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
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

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
		<Tooltip title="Add a new Division">
			<Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
		  	Add record
			</Button>
			</Tooltip>
		<Tooltip title="Deactivate a Division">
			<IconButton color="warning" aria-label="Deactivate a Division"><DeleteOutlineIcon /></IconButton>
		</Tooltip>
		<Tooltip title="Delete a Division">
			<IconButton color="error" aria-label="Delete a Division"><DeleteIcon /></IconButton>
		</Tooltip>
		<Tooltip title="ReActivate a Division">
			<IconButton color="default" aria-label='Reactivate a Division'><AddCircleOutlineIcon /></IconButton>
		</Tooltip>
	  </GridToolbarContainer>
	);
  }

export default function DivisionGrid(props) {
	const [loading, setLoading] = useState(true);

	const client = generateClient<Schema>();
	const [userData, setUserData] = useState([{
		id: '',   
		companyId: '',
		company: '',
		name: '',
		email: '',
		address1: '',
		address2: '',
		city: '',
		state: '',
		zipcode: '',
		refDepartment: '',
		notes: '',
		deactiveDate: null,
		created: '',
		createdBy: ''
	  }]);

	  function translateUserDivision (item) {
		const data = [{id: item.id, 
			companyId: item.company_id, 
			company: item.company, 
			name: item.name,
			email: item.email,
			address1: item.address1,
			address2: item.address2,
			city: item.city,
			state: item.state,
			zipcode: item.zipcode,
			refDepartment: item.ref_department,
			notes: item.notes,
			deactiveDate: item.deactive_date,
			created: item.created,
			createdBy: item.created_by
		  }];
		return data;
	  }
	
	  function translateUserDivisions (items) {
		var item = JSON.parse(items[0]);
		var data = [{id: item.id, 
			companyId: item.company_id, 
			company: item.company, 
			name: item.name,
			email: item.email,
			address1: item.address1,
			address2: item.address2,
			city: item.city,
			state: item.state,
			zipcode: item.zipcode,
			refDepartment: item.ref_department,
			notes: item.notes,
			deactiveDate: item.deactive_date,
			created: item.created,
			createdBy: item.created_by
		  }];
		for (var i=1; i < items.length; i++) {
		  const item = JSON.parse(items[i]);
		  data.push(
			{id: item.id, 
				companyId: item.company_id, 
				company: item.company, 
				name: item.name,
				email: item.email,
				address1: item.address1,
				address2: item.address2,
				city: item.city,
				state: item.state,
				zipcode: item.zipcode,
				refDepartment: item.ref_department,
				notes: item.notes,
				deactiveDate: item.deactive_date,
				created: item.created,
				createdBy: item.created_by}
		  );
		}
		return data;
	  }

	  const getDivisions = async () => {
		const { data: items, errors } = await client.queries.listAllDivisions({
		})
		if (Array.isArray(items) && items.length > 0) {
		  const db = JSON.stringify(items);
		  const userItems = JSON.parse(db);
		  if (items.length < 2) {
			setUserData(translateUserDivision (userItems));
		  } else {
			setUserData(translateUserDivisions (userItems));
		  }
		  setLoading(false);
		}
	  };

	useEffect(() => {
		getDivisions();
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
    });

	function handleDeactivate (id) {
	}

	function handleActivate (id) {
	}
	
	function handleDelete (id) {
	}

	function handleEdit (id) {
	}

	const columns: GridColDef[] = [
		{ field: 'id', headerName: 'Id', width: 70 },
		{ field: 'company', headerName: 'Company Name', width: 150, headerClassName: 'grid-headers'  },
		{ field: 'name', headerName: 'Division Name', width: 150, headerClassName: 'grid-headers'  },
		{ field: 'email', headerName: 'Email', width: 200, headerClassName: 'grid-headers'  },
		{
		  field: 'address1',
		  headerName: 'Address',
		  width: 200, headerClassName: 'grid-headers' 
		},
		{ field: 'city', headerName: 'City', width: 150, headerClassName: 'grid-headers'  },
		{ field: 'state', headerName: 'State', width: 50, headerClassName: 'grid-headers'  },
		{ field: 'zipcode', headerName: 'Zipcode', width: 100, headerClassName: 'grid-headers' },
		{ field: 'deactiveDate', headerName: 'DeActive', width: 100, headerClassName: 'grid-headers'  },
		{ field: 'refDepartment', headerName: 'Department', width: 200, headerClassName: 'grid-headers' },
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
