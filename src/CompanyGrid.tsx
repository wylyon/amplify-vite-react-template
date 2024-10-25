
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
		<Tooltip title="Add a new Company">
			<Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
		  	Add record
			</Button>
			</Tooltip>
		<Tooltip title="Deactivate a Company">
			<IconButton color="warning" aria-label="Deactivate a Company"><DeleteOutlineIcon /></IconButton>
		</Tooltip>
		<Tooltip title="Delete a Company">
			<IconButton color="error" aria-label="Delete a Company"><DeleteIcon /></IconButton>
		</Tooltip>
		<Tooltip title="ReActivate a Company">
			<IconButton color="default" aria-label='Reactivate a Company'><AddCircleOutlineIcon /></IconButton>
		</Tooltip>
	  </GridToolbarContainer>
	);
  }

export default function CompanyGrid(props) {
	const [loading, setLoading] = useState(true);

	const client = generateClient<Schema>();
	const [company, setCompany] = useState<Schema["company"]["type"][]>([]);

	const allCompanies = async () => {
		const { data: items, errors } = await client.models.company.list();
		if (errors) {
		  alert(errors[0].message);
		} else {
			setCompany(items);
		  setLoading(false);
		}
	  }

	useEffect(() => {
		allCompanies();
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
		setLoading(false);
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
		{ field: 'name', headerName: 'Company Name', width: 150, headerClassName: 'grid-headers'  },
		{ field: 'email', headerName: 'Email', width: 200, headerClassName: 'grid-headers'  },
		{
		  field: 'address1',
		  headerName: 'Address',
		  width: 200, headerClassName: 'grid-headers' 
		},
		{ field: 'city', headerName: 'City', width: 150, headerClassName: 'grid-headers'  },
		{ field: 'state', headerName: 'State', width: 50, headerClassName: 'grid-headers'  },
		{ field: 'zipcode', headerName: 'Zipcode', width: 100, headerClassName: 'grid-headers' },
		{ field: 'ref_department', headerName: 'Department', width: 200, headerClassName: 'grid-headers' },
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

	const paginationModel = { page: 0, pageSize: 5 };

  return (
	<Stack>
		<Paper sx={{ height: 600, width: '100%' }} elevation={4}>
			<DataGrid
				rows={company}
				slots={{ toolbar: GridToolbar}}
				loading={loading}
				columns={columns}
				columnVisibilityModel={columnVisibilityModel}
				onColumnVisibilityModelChange={(newCompany) =>
					setColumnVisibilityModel(newCompany)
				}
				initialState={{ pagination: { paginationModel } }}
				pageSizeOptions={[5, 10]}
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
