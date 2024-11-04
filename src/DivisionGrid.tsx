
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
import { v4 as uuidv4 } from 'uuid';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SelectGridCustomer from '../src/SelectGridCustomer';
import SelectGridState from '../src/SelectGridState';

interface EditToolbarProps {
	setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
	setRowModesModel: (
	  newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
	) => void;
  }

function EditToolbar(props: EditToolbarProps) {
	const { setRows, setRowModesModel } = props;
  
	const handleClick = () => {
		const id = uuidv4();
		setRows((oldRows) => [
		  ...oldRows,
		  { id, 
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
			  isNew: true
		  },
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
		  	Add Division
			</Button>
		</Tooltip>
		<GridToolbar />
	  </GridToolbarContainer>
	);
  }

export default function DivisionGrid(props) {
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState('');
	const [deleteId, setDeleteId] = useState('');
	const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

	const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
	  if (params.reason === GridRowEditStopReasons.rowFocusOut) {
		event.defaultMuiPrevented = true;
	  }
	};

	const client = generateClient<Schema>();
	const [company, setCompany] = useState<Schema["company"]["type"][]>([]);
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
	const [rows, setRows] = useState<GridRowsProp>([]);

	const allCompanies = async () => {
		const { data: items, errors } = 
		props.filter == null ?
			await client.models.company.list() :
			await client.models.company.get({
				id: props.filter.id
			});
		if (errors) {
		  alert(errors[0].message);
		} else {
		  setCompany(items);
		}
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
		const { data: items, errors } = 
		props.filter == null ?
			await client.queries.listAllDivisions({
		}) :
			await client.queries.listAllDivisionsByCompanyId({
				companyId: props.filter.id
			});
		if (Array.isArray(items) && items.length > 0) {
		  const db = JSON.stringify(items);
		  const userItems = JSON.parse(db);
		  const data = translateUserDivisions (userItems);
		  setUserData(data);
		  setRows(data);
		  setLoading(false);
		}
	  };

	useEffect(() => {
		getDivisions();
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
	}

	const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
		id: false,
	  });
  
	const handleDeactiveOrActivate = async(id, isDeactive) => {
		const now = new Date();
		const { errors, data: updatedData } = await client.models.division.update({
			id: id,
			deactive_date: (isDeactive) ? now : null
		});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
		getDivisions();
	}

	const handleDeleteRow = async(id) => {
		const { errors, data: deletedData } = await client.models.division.delete({
			id: id
		});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
	}

	const handleAddRow = async(newRow:GridRowModel) => {
		const now = new Date();
		const companyArr = newRow.company.split("|");
		const { errors, data: items } = await client.models.division.create({
			id: newRow.id,
			company_id: companyArr.length < 2 ? (Array.isArray(company) ? company[0].id : company.id) : companyArr[1],
			name: newRow.name, 
			email: newRow.email,
			address1: newRow.address1,
			address2: newRow.address2,
			city: newRow.city,
			state: newRow.state,
			zipcode: newRow.zipcode,
			ref_department: newRow.refDepartment,
			notes: newRow.notes,
			created: now,
			created_by: 0			
		});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
	}

	const handleUpdateRow = async(newRow: GridRowModel) => {
		const companyArr = newRow.company.split("|");
		const { errors, data: updatedData } = await client.models.division.update({ 
			id: newRow.id,
			company_id: companyArr.length < 2 ? newRow.companyId : companyArr[1],
			name: newRow.name, 
			email: newRow.email,
			address1: newRow.address1,
			address2: newRow.address2,
			city: newRow.city,
			state: newRow.state,
			zipcode: newRow.zipcode,
			ref_department: newRow.refDepartment,
			notes: newRow.notes
		});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
	}

	const handleDeactivate = (id: GridRowId) => () => {
		handleDeactiveOrActivate(id, true);
	}

	const handleActivate = (id: GridRowId) => () => {
		handleDeactiveOrActivate(id, false);
	}
	
	const handleDeleteClick = (id: GridRowId) => () => {
		setOpen(false);
		setError('');
		setRows(rows.filter((row) => row.id !== id));
		handleDeleteRow(id);
	};	

	const handleDelete = (id: GridRowId) => () => {
		setDeleteId(id);
		setError('');
		setOpen(true);
	}

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
	
	const editedRow = rows.find((row) => row.id === id);
		if (editedRow!.isNew) {
		setRows(rows.filter((row) => row.id !== id));
		}
	};

	const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
		const updatedRow = { ...newRow, isNew: false };
		setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
		if (newRow.name == "") {
			setError("Please provide a division name.");
			setOpen(true);
			return oldRow;
		}
		if (newRow.email == "") {
			setError("Please provide an email address.");
			setOpen(true);
			return oldRow;
		}
		if (newRow.address1 == "") {
			setError("Please provide an address.");
			setOpen(true);
			return oldRow;
		}
		if (newRow.city == "") {
			setError("Please provide a city.");
			setOpen(true);
			return oldRow;
		}
		if (newRow.zipcode == "") {
			setError("Please provide a zipcode.");
			setOpen(true);
			return oldRow;
		}
		if (newRow.isNew) {
			handleAddRow(newRow);
		} else {
			handleUpdateRow(newRow);
		}
		return updatedRow;
	};

	const processRowUpdateError = (error) => {
		setError(error);
		setOpen(true);
	}
	
	const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
		setRowModesModel(newRowModesModel);
	};

	const renderSelectEditInputCell: GridColDef['renderCell'] = (params) => {
		return <SelectGridCustomer {...params} company={company}  nullOk={false}/>;
	  };

	const renderSelectEditStateInputCell: GridColDef['renderCell'] = (params) => {
		return <SelectGridState {...params} />;
	};

	const preProcessEditCellProps = (params: GridPreProcessEditCellProps) => {
		if (!params.hasChanged) {
			return { ...params.props, error: null};
		}
		const existingCompanies = rows.map((row) => row.name.toLowerCase());
		const companyName = params.props.value!.toString();
		const exists = existingCompanies.includes(companyName.toLowerCase()) && companyName.length > 1;
		const errorMessage = exists ? `${companyName} is already taken.` : null;
		if (errorMessage != null) {
			setError(errorMessage);
			setOpen(true);
		}
		return { ...params.props, error: errorMessage};
	}

	const columns: GridColDef[] = [
		{ field: 'id', headerName: 'Id', width: 70 },
		{ field: 'company', headerName: 'Company Name', width: 150, headerClassName: 'grid-headers', editable: true,
			renderEditCell: renderSelectEditInputCell,
			valueGetter: (value) => {
				return value.split("|")[0];
			}
		  },
		{ field: 'name', headerName: 'Division Name', width: 150, headerClassName: 'grid-headers', 
			preProcessEditCellProps,
			editable: true  },
		{ field: 'email', headerName: 'Email', width: 200, headerClassName: 'grid-headers', editable: true  },
		{ field: 'address1', headerName: 'Address-1', width: 200, headerClassName: 'grid-headers', editable: true },
		{ field: 'address2', headerName: 'Address-2', width: 200, headerClassName: 'grid-headers', editable: true },
		{ field: 'city', headerName: 'City', width: 150, headerClassName: 'grid-headers', editable: true  },
		{ field: 'state', headerName: 'State', width: 100, headerClassName: 'grid-headers', 
			renderEditCell: renderSelectEditStateInputCell,
			editable: true  },
		{ field: 'zipcode', headerName: 'Zipcode', width: 100, headerClassName: 'grid-headers', editable: true },
		{ field: 'isActive',
			headerName: 'isActive',
			width: 100,
			type: 'boolean',
			headerClassName: 'grid-headers',
			valueGetter: (value, row) => {
				return row.deactiveDate == null || row.isNew;
			},
			cellClassName: (params: GridCellParams<any, number>) => {
				if (params.value) {
					return '';
				}
				return 'grid-alert';
			},
			editable: false  },
		{ field: 'refDepartment', headerName: 'Department', width: 200, headerClassName: 'grid-headers', editable: true },
		{ field: 'notes', headerName: 'Notes', width: 200, headerClassName: 'grid-headers', editable: true },
		{ field: 'actions', headerName: 'Actions', headerClassName: 'grid-headers',
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
				<GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDelete(id)} showInMenu />,
				]
			}
		}
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
          {error == '' ? "Are You Sure?" : "ERROR"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
			{error == '' ? "Are you sure you want to delete this record? (NOTE: " +
			"This can orphan rows if there is activity against this division)" : error}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
			{error == '' ? <Button variant='contained' color='success' onClick={handleDeleteClick(deleteId)}>Delete</Button> : null}
          <Button variant='contained' color='error' onClick={handleClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
	<Stack>
		<Paper sx={{ height: 600, width: '100%' }} elevation={4}>
			<DataGrid
			rows={rows}
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
			onColumnVisibilityModelChange={(newRow) =>
				setColumnVisibilityModel(newRow)
			}
			initialState={{ pagination: { paginationModel: { pageSize: 10} } }}
			pageSizeOptions={[10, 20, 50, 100, { value: -1, label: 'All'}]}
			onRowClick={handleRowClick}
			onRowCountChange={handleRowChangeEvent}
			onRowSelectionModelChange={handleRowSelection}
			sx={{ border: 0 }}
			slots={{
				toolbar: EditToolbar as GridSlots['toolbar'],
			  }}
			slotProps={{
				toolbar: { setRows, setRowModesModel },
			}}
			/>
		</Paper>
	</Stack>
	</React.Fragment>
  );
}
