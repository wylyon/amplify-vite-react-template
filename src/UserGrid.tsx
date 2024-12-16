
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
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import PopupNewUser from '../src/PopupNewUser';
import moment from 'moment';
import SignUp from '../src/SignUp';
import PasswordIcon from '@mui/icons-material/Password';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { resetPassword } from 'aws-amplify/auth';

interface EditToolbarProps {
	filter: string;
	arrayDivisions: [{}];
	rows: GridRowsProp;
	isAdmin: boolean;
	setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
	setRowModesModel: (
	  newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
	) => void;
  }

function EditToolbar(props: EditToolbarProps) {
	const { filter, arrayDivisions, rows, isAdmin, setRows, setRowModesModel } = props;
	const [openNew, setOpenNew] = useState(false);
	const [item, setItem] = useState({});
 
	const handleOnClose = () => {
		setOpenNew(false);
	}

	function getDate(value) {
		if (value == null) {
			return null
		}
		const date = moment(value);
		const formattedDate = date.format("YYYY-MM-DD 23:00:00");
		return new Date(formattedDate);
	  }

	  const handleOnSubmit = (item) => {
		setItem(item);
		setRows((oldRows) => [
			...oldRows,
			isAdmin ?
			{ id: item.id, 
				username: '',
				companyId: filter.id,
				company: filter.name,
				email: item.email_address,
				firstName: item.first_name,
				middleName: item.middle_name,
				lastName: item.last_name,
				activeDate: getDate(item.active_date),
				notes: item.notes,
				isNew: false
			} :
			{ id: item.id, 
			  username: '',
			  companyId: filter.id,
			  divisionId: item.division_id,
			  division: arrayDivisions.filter(comp => comp.id == item.division_id)[0].name,
			  company: filter.name,
			  email: item.email_address,
			  firstName: item.first_name,
			  middleName: item.middle_name,
			  lastName: item.last_name,
			  activeDate: getDate(item.active_date),
			  notes: item.notes,
			  isNew: false
			},
		  ]);
		  setOpenNew(false);
	}

	const handleClick = () => {
		if (filter != null) {
			setOpenNew(true);
			return;
		}
		const id = uuidv4();
		setRows((oldRows) => [
		  ...oldRows,
		  { id, 
			  username: '',
			  companyId: '',
			  company: '',
			  divisionId: '',
			  division: '',
			  email: '', 
			  firstName: '',
			  lastName: '',
			  middleName: '',
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
		<React.Fragment>
			{openNew && <PopupNewUser props={props} arrayDivisions={arrayDivisions} company={filter} rows={rows} isAdmin={isAdmin} onClose={handleOnClose} onSubmit={handleOnSubmit} />}
			<GridToolbarContainer>
			<Tooltip title="Add a new User">
				<Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
				{isAdmin ? "Add an Admin" : "Add a User"}
				</Button>
			</Tooltip>
			<GridToolbar />
		</GridToolbarContainer>
		</React.Fragment>
	);
  }

export default function UserGrid(props) {
	const [loading, setLoading] = useState(true);
	const [arrayDivisions, setArrayDivisions] = useState([{}]);
	const [isAdmin, setIsAdmin] = useState(props.filter == null ? true : false);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState('');
	const [deleteId, setDeleteId] = useState('');
	const [isSignUpTime, setIsSignUpTime] = useState(false);
	const [signUpEmail, setSignUpEmail] = useState('');
	const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

	const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
	  if (params.reason === GridRowEditStopReasons.rowFocusOut) {
		event.defaultMuiPrevented = true;
	  }
	};

	const client = generateClient<Schema>();
	const [filter, setFilter] = useState(props.filter);
	const [company, setCompany] = useState<Schema["company"]["type"][]>([]);
	const [division, setDivision] = useState<Schema["division"]["type"][]>([]);
	const [userData, setUserData] = useState([{
		id: '',   
		userName: '',
		companyId: '',
		company: '',
		divisionId: '',
		division: '',
		email: '',
		firstName: '',
		lastName: '',
		middleName: '',
		activeDate: null,
		deactiveDate: null,
		notes: '',
		created: '',
		createdBy: '',
	  }]);
	  const [checked, setChecked] = useState(true);
	  const [rows, setRows] = useState<GridRowsProp>([]);

	const allCompanies = async () => {
		const { data: items, errors } = await client.models.company.list();
		if (errors) {
		setError(errors[0].message);
		setOpen(true);
		} else {
		setCompany(items);
		}
	}
	
	const allDivisions = async () => {
		const { data: items, errors } = 
		props.filter == null ?
			await client.models.division.list() :
			await client.queries.listDivisionByCompanyId({
				companyId: props.filter.id
			});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		} else {
			var array = [];
			items.map(comp => {
				array.push({id: comp.id, name: comp.name});
			})
			setArrayDivisions(array);
			setDivision(items);
		}
		setLoading(false);
		}

	  const handleUserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked);
		setLoading(true);
		getUsers(event.target.checked, true);
		setIsAdmin(event.target.checked);
	  };

	  function getDate(value) {
		if (value == null) {
			return null
		}
		const date = moment(value);
		const formattedDate = date.format("YYYY-MM-DD 23:00:00");
		return new Date(formattedDate);
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
			notes: item.notes,
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
			notes: item.notes,
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
				notes: item.notes,
				created: item.created,
				createdBy: item.created_by,}
		  );
		}
		return data;
	  }

	  const getUsers = async (isAdmin, isLoading) => {
		const { data: items, errors } = 
			(isAdmin) ? (
				props.filter == null ?
					await client.queries.listAllAdmin({
				}) : 
					await client.queries.listAllAdminByCompanyId({
						companyId: props.filter.id
					})
			) : (
				props.filter == null ? 
					await client.queries.listAllUsers({}) :
					await client.queries.listAllUsersByCompanyId({
						companyId: props.filter.id
					})
			);
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		} else {
			if (Array.isArray(items) && items.length > 0) {
				const db = JSON.stringify(items);
				const userItems = JSON.parse(db);
				if (items.length < 2) {
				  const data = translateUserTemplate (userItems);
				  setUserData(data);
				  setRows(data);
				} else {
				  const data = translateUserTemplates(userItems);
				  setUserData(data);
				  setRows(data);
				}
			  }
		}
		if (isLoading) {
			setLoading(false);
		  }
	  };

	useEffect(() => {
		getUsers(isAdmin, props.filter != null);
		if (props.filter == null) {
			allCompanies();
		}
		allDivisions();
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

	const handleSuperAdmin = async(id) => {
		const { errors, data: updatedData} = await client.models.admin.update({
			id: id,
			company_id: null
		});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
		setLoading(true);
		getUsers(isAdmin, true);		
	}

	const handleDeactiveOrActivate = async(id, isDeactive) => {
		const now = new Date();
		const { errors, data: updatedData } = 
			(isAdmin) ? 	
				await client.models.admin.update({
					id: id,
					deactive_date: (isDeactive) ? now : null
				}) :
				await client.models.user.update({
					id: id,
					deactive_date: (isDeactive) ? now : null
				});				
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
		setLoading(true);
		getUsers(isAdmin, true);
	}

	const handleDeleteRow = async(id) => {
		const { errors, data: deletedData } = 
		(isAdmin) ?
			await client.models.admin.delete({
				id: id
			}) :
			await client.models.user.delete({
				id: id
			});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
	}

	const handleAddRow = async(newRow:GridRowModel) => {
		const now = new Date();
		const companyArr = (isAdmin) ? newRow.company.split("|") : newRow.division.split("|");
		if (isAdmin) {
			const { errors, data: items } = await client.models.admin.create({
				id: newRow.id,
				company_id: companyArr.length < 2 ? (newRow.companyId == '' ? null : newRow.companyId) : companyArr[1],
				email_address: newRow.email,
				first_name: newRow.firstName,
				last_name: newRow.lastName,
				middle_name: newRow.middleName,
				active_date: newRow.activeDate != null ? newRow.activeDate.toISOString().slice(0, 10) : null,
				created: now,
				created_by: 0			
			});			
			if (errors) {
				setError(errors[0].message);
				setOpen(true);
			}
		} else {
			const { errors, data: items } = await client.models.user.create({
				id: newRow.id,
				division_id: companyArr.length < 2 ? division[0].id : companyArr[1],
				email_address: newRow.email,
				first_name: newRow.firstName,
				last_name: newRow.lastName,
				middle_name: newRow.middleName,
				notes: newRow.notes,
				active_date: newRow.activeDate === undefined ? null : (newRow.activeDate != null ? newRow.activeDate.toISOString().slice(0, 10) : null),
				created: now,
				created_by: 0			
			}); 		
			if (errors) {
				setError(errors[0].message);
				setOpen(true);
			}	
		}
	}

	const handleUpdateRow = async(newRow: GridRowModel) => {
		const companyArr = (isAdmin) ? newRow.company.split("|") : newRow.division.split("|");
		const { errors, data: updatedData } = 
		(isAdmin) ?
			await client.models.admin.update({ 
				id: newRow.id,
				company_id: companyArr.length < 2 ? (newRow.companyId == '' ? null : newRow.companyId) : companyArr[1],
				email_address: newRow.email,
				first_name: newRow.firstName,
				last_name: newRow.lastName,
				middle_name: newRow.middleName,
				active_date: newRow.activeDate != null ? newRow.activeDate.toISOString().slice(0, 10) : null,
			}) :
			await client.models.user.update({ 
				id: newRow.id,
				division_id: companyArr.length < 2 ? newRow.companyId : companyArr[1],
				email_address: newRow.email,
				first_name: newRow.firstName,
				last_name: newRow.lastName,
				middle_name: newRow.middleName,
				active_date: newRow.activeDate === undefined ? null : (newRow.activeDate != null ? newRow.activeDate.toISOString().slice(0, 10) : null),
				notes: newRow.notes
			}); 			
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
	}

	const handleSignOnCancel = (e) => {
		setIsSignUpTime(false);
		setSignUpEmail('');
	 };

	 const handleEnroll = (id: GridRowId) => () => {
		const row = rows.filter((row) => row.id === id);
		setSignUpEmail(row[0].email);
		setIsSignUpTime(true);
	 }

	const handleDeactivate = (id: GridRowId) => () => {
		handleDeactiveOrActivate(id, true);
	}

	const handleResetPassword = async(emailAddress) => {
		try {
		  const output = await resetPassword({
		username: emailAddress
		  });
		  console.log(output.isPasswordReset);
		} catch (error) {
			setError(error);
			setOpen(true);
		}
	  }
	  

	const handleReset = (id: GridRowId) => () => {
		const row = rows.filter((row) => row.id === id);
		handleResetPassword(row[0].email);
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

	const handleMakeSuperAdmin = (id: GridRowId) => () => {
		handleSuperAdmin(id);
	}

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
		if (newRow.email == "") {
			setError("Please provide an email address.");
			setOpen(true);
			return oldRow;
		}
		if (newRow.firstName == "") {
			setError("Please provide a first name.");
			setOpen(true);
			return oldRow;
		}
		if (newRow.lastName == "") {
			setError("Please provide a last name.");
			setOpen(true);
			return oldRow;
		}
		setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
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
		return <SelectGridCustomer {...params} company={company} nullOk={true}/>;
	  };

	const renderSelectDivisionEditInputCell: GridColDef['renderCell'] = (params) => {
	return <SelectGridCustomer {...params} company={division}  nullOk={false}/>;
	};

	const preProcessEditCellProps = (params: GridPreProcessEditCellProps) => {
		if (!params.hasChanged) {
			return { ...params.props, error: null};
		}
		const existingUsers = rows.map((row) => row.email.toLowerCase());
		const userEmail = params.props.value!.toString();
		const exists = existingUsers.includes(userEmail.toLowerCase()) && userEmail.length > 1;
		const errorMessage = exists ? `${userEmail} is already taken.` : null;
		if (errorMessage != null) {
			setError(errorMessage);
			setOpen(true);
		}
		return { ...params.props, error: errorMessage};
	}

	const columns: GridColDef[] = [
		{ field: 'id', headerName: 'Id', width: 70 },
		{ field: 'divisionId', headerName: 'DivisionId', width: 70 },
		isAdmin ? { field: 'company', headerName: 'Company Name', width: 150, headerClassName: 'grid-headers', editable: true,
			renderEditCell: renderSelectEditInputCell,
			valueGetter: (value) => {
				return value == null ? null : value.split("|")[0];
			}
		  } :
		  { field: 'company', headerName: 'Company Name', width: 150, headerClassName: 'grid-headers', editable: true,
			valueGetter: (value, row) => {
				return row.isNew ? "--" : value;
			}
		   },
		  isAdmin ? { field: 'companyId', headerName: 'CompanyId', width: 70 } : 
		  { field: 'division', headerName: 'Division Name', width: 150, headerClassName: 'grid-headers',
			renderEditCell: renderSelectDivisionEditInputCell,
			valueGetter: (value) => {
				return value == null ? null : value.split("|")[0];
		  }, editable: true 
		 },
		{ field: 'email', headerName: 'Email Address', width: 200, headerClassName: 'grid-headers', 
			preProcessEditCellProps,
			editable: true  },
		{ field: 'firstName', headerName: 'First Name', width: 150, headerClassName: 'grid-headers', editable: true },
		{ field: 'lastName', headerName: 'Last Name', width: 150, headerClassName: 'grid-headers', editable: true  },
		{ field: 'middleName', headerName: 'Middle', width: 80, headerClassName: 'grid-headers', editable: true  },
		!isAdmin ? { field: 'notes', headerName: 'Notes', width: 150, headerClassName: 'grid-headers', editable: true  } :
		  { field: 'isSuperAdmin', headerName: 'isSuperAdmin', width: 120, type: 'boolean', headerClassName: 'grid-headers',
			valueGetter: (value, row) => {
				return row.companyId == null;
			}
		  },
		{ field: 'activeDate', type: 'date', headerName: 'Active Date', width: 100, headerClassName: 'grid-headers', editable: true},
		{ field: 'isActive',
			headerName: 'isEnabled',
			width: 80,
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
				<GridActionsCellItem icon={<SupervisedUserCircleIcon />} label="Make SuperAdmin" disabled 
					onClick={handleMakeSuperAdmin(id)} showInMenu/>,
				<GridActionsCellItem icon={<PasswordIcon />} label="Reset Password" onClick={handleReset(id)} disabled showInMenu />,
				<GridActionsCellItem icon={<AssignmentIndIcon />} label="Enroll User" onClick={handleEnroll(id)} showInMenu />,
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
			"This can orphan rows if there is activity against this user)" : error}
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
	{isSignUpTime && <SignUp email={signUpEmail} onSubmitChange={handleSignOnCancel} /> }
    <FormGroup>
      <Typography variant='subtitle1'>Company User 
		<FormControlLabel control={<Switch defaultChecked={props.filter == null ? true : false} onChange={handleUserChange}/>} 
			label="Admin User" />
	  </Typography>
    </FormGroup>
		<Paper sx={{ height: 600, width: '100%' }} elevation={4}>
			<DataGrid
			rows={rows}
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
				toolbar: { filter, arrayDivisions, rows,  isAdmin, setRows, setRowModesModel },
			}}
			/>
		</Paper>
	</Stack>
	</React.Fragment>
  );
}
