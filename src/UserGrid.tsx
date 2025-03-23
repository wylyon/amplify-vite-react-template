
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
import PasswordIcon from '@mui/icons-material/Password';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { resetPassword } from 'aws-amplify/auth';
import CryptoJS from 'crypto-js';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

interface EditToolbarProps {
	filter: string;
	arrayDivisions: [{}];
	rows: GridRowsProp;
	isAdmin: boolean;
	userId: string;
	setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
	setRowModesModel: (
	  newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
	) => void;
  }

function EditToolbar(props: EditToolbarProps) {
	const { filter, arrayDivisions, rows, isAdmin, userId, setRows, setRowModesModel } = props;
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
				userStatus: 'User added...',
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
			  userStatus: 'User added...',
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
			{openNew && <PopupNewUser props={props} 
				arrayDivisions={arrayDivisions} company={filter} rows={rows} isAdmin={isAdmin} userId={userId} onClose={handleOnClose} onSubmit={handleOnSubmit} />}
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
	  const [userId, setUserId] = useState(props.userId);

	  const [access, setAccess] = useState('');
	  const [secret, setSecret] = useState('');
	  const [region, setRegion] = useState(null);
	  const [ourWord, setOurWord] = useState('');
	  const [userPoolId, setUserPoolId] = useState('');
	  const [isBackups, setIsBackups] = useState(true);

	  const getAppSettings = async() => {
		const { data: items, errors } = await client.models.app_settings.list();
		if (errors) {
		  alert(errors[0].message);
		} else {
			const backupDeletes = items.filter(map => map.code == 'BACKUP');
			if (backupDeletes.length < 1) {
				setIsBackups(false);
			} else {
				if (backupDeletes[0].value != 'true') {
					setIsBackups(false);
				}
			}
		  const what3words = items.filter(map => map.code.includes('WHAT3WORDS_API_KEY'));
		  if (what3words.length < 1) {
			setError("Cant get credentials for Admin.");
			setOpenError(true);    
			return;   
		  }
		  setOurWord(what3words[0].value + what3words[0].value);
		  const domain = window.location.hostname;
		  const userPool = domain.includes('localhost') ? items.filter(map => map.code.includes('USERPOOLID-DEV')) : items.filter(map => map.code.includes('USERPOOLID-PRD'));
		  if (userPool.length < 1) {
			setError("Cant get userPool for Admin.");
			setOpenError(true);    
			return;   
		  }
		  setUserPoolId(userPool[0].value);
		  const creds = items.filter(map => map.code.includes('ACCESS'));
		  if (creds.length < 1) {
			setError("Cant get access credentials for Admin.");
			setOpenError(true);
		  } else {
			const accessId = creds[0].value;
			const secret = items.filter(map => map.code.includes('SECRET'));
			if (secret.length < 1) {
			  setError("Cant get secret credentials for Admin.");
			  setOpenError(true);
			} else {
			  const secretId = secret[0].value;
			  const region = items.filter(map => map.code.includes('REGION'));
			  if (region.length < 1) {
				setError("Cant get region credentials for Admin.");
				setOpenError(true);
			  } else {
				const regionId = region[0].value;
				setAccess(accessId);
				setSecret(secretId);
				setRegion(regionId);
			  }
			}
		  }
		}
	  }

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
	
	  const getUserStatus = async (data) => {
		const cognito = new CognitoIdentityProvider({
			region: region,
			credentials: {
				accessKeyId: CryptoJS.AES.decrypt(access, ourWord).toString(CryptoJS.enc.Utf8),
				secretAccessKey: CryptoJS.AES.decrypt(secret, ourWord).toString(CryptoJS.enc.Utf8),
			}
		});
		var dataStatus = [];
		for (var i=0; i < data.length; i++) {
			var userStatus = null;
			try {
				const response = await cognito.adminGetUser({
					UserPoolId: userPoolId,
					Username: data[i].email
				});
				userStatus = response.UserStatus;
			} catch (error) {

			}
			dataStatus.push({
				id: data[i].id,
				company: data[i].company,
				divisionId: data[i].divisionId,
				division: data[i].division,
				companyId: data[i].companyId,
				email: data[i].email,
				firstName: data[i].firstName,
				lastName: data[i].lastName,
				middleName: data[i].middleName,
				activeDate: data[i].activeDate,
				deactiveDate: data[i].deactiveDate,
				userStatus: userStatus,
				notes: data[i].notes,
				created: data[i].created,
				createdBy: data[i].createdBy,
			})
		}
		setUserData(dataStatus);
		setRows(dataStatus);
	  }

	  function translateUserTemplates (items) {
		const item = JSON.parse(items[0]);
		var data = [];
		for (var i=0; i < items.length; i++) {
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
				userStatus: null,
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
				const data = translateUserTemplates(userItems);
				getUserStatus(data);
			  }
		}
		if (isLoading) {
			setLoading(false);
		  }
	  };

	useEffect(() => {
		getAppSettings();
		if (region) {
			getUsers(isAdmin, props.filter != null);
			if (props.filter == null) {
				allCompanies();
			}
			allDivisions();
		}
	  }, [region]);

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
	  company: false,
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

	const handleDeactiveOrActivate = async(id, isDeactive, emailAddress) => {
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
		} else {
			const cognito = new CognitoIdentityProvider({
				region: region,
				credentials: {
					accessKeyId: CryptoJS.AES.decrypt(access, ourWord).toString(CryptoJS.enc.Utf8),
					secretAccessKey: CryptoJS.AES.decrypt(secret, ourWord).toString(CryptoJS.enc.Utf8),
				}
				});
			try {
				const response = (isDeactive) ? await cognito.adminDisableUser({
					UserPoolId: userPoolId,
					Username: emailAddress
				}).promise() :
					await cognito.adminEnableUser({
						UserPoolId: userPoolId,
						Username: emailAddress
					}).promise();
		
			} catch (error) {
				setError("Warning...Could not initiate reset password.");
				setOpen(true);
			}
		}
		setLoading(true);
		getUsers(isAdmin, true);
	}

	const deleteAllReferences = async(id, emailAddress) => {
		var deleteCognito = true;
		if (!isAdmin) {
		// first delete any links between a user and a template
			const { errors, data: items } = await client.queries.listTemplatePermissionsByUser({
				userId: id
			});
			if (errors) {
			} else {
				if (items) {
					for (var indx = 0; indx < items.length; indx++) {
						const { errors, data: deletedData } = await client.models.template_permissions.delete({
							id: items[indx].id
						});
					}
				}
			}
		} else {
			const { errors, data: items } = await client.queries.listUserByEmail ({
				email: emailAddress
			});
			if (errors) {
			} else {
				if (items && items.length > 0) {
					// if a user as well as admin, then dont delete cognito row.
					deleteCognito = false;
				}
			}
		}
		if (deleteCognito) {
		// now delete the cognito row
			const cognito = new CognitoIdentityProvider({
				region: region,
				credentials: {
					accessKeyId: CryptoJS.AES.decrypt(access, ourWord).toString(CryptoJS.enc.Utf8),
					secretAccessKey: CryptoJS.AES.decrypt(secret, ourWord).toString(CryptoJS.enc.Utf8),
				}
				});
			try {
				const response = await cognito.adminDeleteUser({
					UserPoolId: userPoolId,
					Username: emailAddress
				}).promise();

			} catch (error) {
			}
		}
	}

	const deletePrepAllReferences = async(id, emailAddress) => {
		if (isBackups && !isAdmin) {
			const { errors, data } = await client.mutations.backupTemplatePermissionsByUserId ({
				userId: id
			});
			deleteAllReferences(id, emailAddress);
		} else {
			deleteAllReferences(id, emailAddress);
		}
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
		const row = rows.filter((row) => row.id === id);
		deletePrepAllReferences(id, row[0].email);
	}

	const handleDeletePrep = async(id) => {
		if (isBackups) {
			const { errors: err, data: items } =
			(isAdmin) ?
				await client.mutations.backupAdminById({
					id: id
				}) :
				await client.mutations.backupUserById({
					id: id
				});
			handleDeleteRow(id);
		} else {
			handleDeleteRow(id);
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
				created_by: props.userId		
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
				created_by: props.userId			
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

	const handleDeactivate = (id: GridRowId) => () => {
		const row = rows.filter((row) => row.id === id);
		handleDeactiveOrActivate(id, true, row[0].email);
	}

	const handleResetPassword = async(emailAddress) => {
		const cognito = new CognitoIdentityProvider({
			region: region,
			credentials: {
				accessKeyId: CryptoJS.AES.decrypt(access, ourWord).toString(CryptoJS.enc.Utf8),
				secretAccessKey: CryptoJS.AES.decrypt(secret, ourWord).toString(CryptoJS.enc.Utf8),
			}
			});
		try {
		const response = await cognito.adminResetUserPassword({
			UserPoolId: userPoolId,
			Username: emailAddress
		}).promise();
	
		} catch (error) {
			setError("Warning...Could not initiate reset password.");
			setOpen(true);
		}
	  }

	const handleReset = (id: GridRowId) => () => {
		const row = rows.filter((row) => row.id === id);
		handleResetPassword(row[0].email);
	}

	const handleActivate = (id: GridRowId) => () => {
		const row = rows.filter((row) => row.id === id);
		handleDeactiveOrActivate(id, false, row[0].email);
	}
	
	const handleDeleteClick = (id: GridRowId) => () => {
		setOpen(false);
		setError('');
		setRows(rows.filter((row) => row.id !== id));
		handleDeletePrep(id);
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
			editable: false  },
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
		{ field: 'userStatus', type: 'string', headerName: 'User Status', width: 225, headerClassName: 'grid-headers', editable: false},
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
				<GridActionsCellItem icon={<PasswordIcon />} label="Reset Password" onClick={handleReset(id)} showInMenu />,
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
			{error == '' ? "Are you sure you want to delete this record?" : error}
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
				toolbar: { filter, arrayDivisions, rows,  isAdmin, userId, setRows, setRowModesModel },
			}}
			/>
		</Paper>
	</Stack>
	</React.Fragment>
  );
}
