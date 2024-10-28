
// @ts-nocheck
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
	GridCellParams, gridClasses,
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
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
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
		  	Add Company
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
	const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

	const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
	  if (params.reason === GridRowEditStopReasons.rowFocusOut) {
		event.defaultMuiPrevented = true;
	  }
	};

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

	const handleDeactiveOrActivate = async(id, isDeactive) => {
		const now = new Date();
		if (isDeactive) {
			const { errors, data: updatedData } = await client.models.company.update({
				id: id,
				deactive_date: now
			});
			if (errors) {
				alert(errors[0].message);
			}
		} else {
			const { errors, data: updatedData } = await client.models.company.update({
				id: id,
				deactive_date: null
			});
			if (errors) {
				alert(errors[0].message);
			}
		}
	}

	function handleDeactivate (id) {
		handleDeactiveOrActivate(id, true);
	}

	function handleActivate (id) {
		handleDeactiveOrActivate(id, false);
	}
	
	const handleDeleteClick = (id: GridRowId) => () => {
		setCompany(rows.filter((row) => row.id !== id));
	  };	

	const handleEditClick = (id: GridRowId) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
	  };

	const handleSaveClick = (id: GridRowId) => () => {
		setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
	  };

	const handleCancelClick = (id: GridRowId) => () => {
		setRowModesModel({
		  ...rowModesModel,
		  [id]: { mode: GridRowModes.View, ignoreModifications: true },
		});
	
	const editedRow = company.find((row) => row.id === id);
		if (editedRow!.isNew) {
		  setCompany(company.filter((row) => row.id !== id));
		}
	  };

	  const processRowUpdate = async(newRow: GridRowModel) => {
		const updatedRow = { ...newRow, isNew: false };
		setCompany(company.map((row) => (row.id === newRow.id ? updatedRow : row)));
		const { errors, data: updatedData } = await client.models.company.update({ 
			id: newRow.id,
			name: newRow.name, 
			email: newRow.email,
			address1: newRow.address1,
			address2: newRow.address2,
			city: newRow.city,
			state: newRow.state,
			zipcode: newRow.zipcode,
			ref_department: newRow.ref_department,
			notes: newRow.notes
		  });
		if (errors) {
			alert(errors[0].message);
		}
		return updatedRow;
	  };

	  const processRowUpdateError = (error) => {
		alert (error);
	  }
	
	  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
		setRowModesModel(newRowModesModel);
	  };

	const columns: GridColDef[] = [
		{ field: 'id', 
			headerName: 'Id', 
			width: 70 },
		{ field: 'name', 
			headerName: 'Company Name', 
			width: 150, 
			headerClassName: 'grid-headers',
			editable: true  },
		{ field: 'email', 
			headerName: 'Email', 
			width: 200, 
			headerClassName: 'grid-headers',
			editable: true   },
		{ field: 'address1',
		  	headerName: 'Address-1',
		  	width: 200, 
			headerClassName: 'grid-headers' ,
			editable: true 
		},
		{ field: 'address2',
			headerName: 'Address-2',
			width: 100, 
		  	headerClassName: 'grid-headers' ,
		  	editable: true 
	  	},
		{ field: 'city', 
			headerName: 'City', 
			width: 150, 
			headerClassName: 'grid-headers',
			editable: true   },
		{ field: 'state', 
			headerName: 'State', 
			width: 50, 
			headerClassName: 'grid-headers',
			editable: true   },
		{ field: 'zipcode', 
			headerName: 'Zipcode', 
			width: 100, 
			headerClassName: 'grid-headers',
			editable: true  },
		{ field: 'ref_department', 
			headerName: 'Department', 
			width: 200, 
			headerClassName: 'grid-headers',
			editable: true  },
		{ field: 'notes', 
			headerName: 'Notes', 
			width: 200, 
			headerClassName: 'grid-headers',
			editable: true  },
		{ field: 'actions', 
			headerName: 'Actions', 
			headerClassName: 'grid-headers',
			type: 'actions',
			width: 80,
			getActions: ({ id }) => {
				const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
		
				if (isInEditMode) {
				  return [
					<GridActionsCellItem
					  icon={<SaveIcon />}
					  label="Save"
					  sx={{
						color: 'primary.main',
					  }}
					  onClick={handleSaveClick(id)}
					/>,
					<GridActionsCellItem
					  icon={<CancelIcon />}
					  label="Cancel"
					  className="textPrimary"
					  onClick={handleCancelClick(id)}
					  color="inherit"
					/>,
				  ];
				}

				return [
				<GridActionsCellItem icon={<EditIcon />} label="Edit" color='primary' onClick={handleEditClick(id)} />,
				<GridActionsCellItem icon={<DeleteOutlineIcon />} label="Deactivate" onClick={handleDeactivate(id)} showInMenu/>,
				<GridActionsCellItem icon={<AddCircleOutlineIcon />} label="Activate" onClick={handleActivate(id)} showInMenu/>,
				<GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDeleteClick(id)} showInMenu />,
				]
			}
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
				editMode='row'
				rowModesModel={rowModesModel}
				onRowModesModelChange={handleRowModesModelChange}
				onRowEditStop={handleRowEditStop}
				processRowUpdate={processRowUpdate}
				onProcessRowUpdateError={processRowUpdateError}
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
				slotProps={{
					toolbar: { setCompany, setRowModesModel },
				}}
			/>
  		</Paper>
	</Stack>
  );
}
