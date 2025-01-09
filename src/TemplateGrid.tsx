
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
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Tooltip from '@mui/material/Tooltip';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import BuildIcon from '@mui/icons-material/Build';
import PreviewIcon from '@mui/icons-material/Preview';
import HtmlIcon from '@mui/icons-material/Html';
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
import PopupReview from '../src/PopupPreview';
import AssociateUsers from '../src/AssociateUsers';
import SetupTemplate from '../src/SetupTemplate';
import PopupNewTemplate from '../src/PopupNewTemplate';
import moment from 'moment';

interface EditToolbarProps {
	filter: string;
	arrayDivisions: [{}];
	rows: GridRowsProp;
	setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
	setRowModesModel: (
	  newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
	) => void;
  }

function EditToolbar(props: EditToolbarProps) {
	const { filter, arrayDivisions, rows, setRows, setRowModesModel } = props;
	const [openNew, setOpenNew] = useState(false);
	const [openBuild, setOpenBuild] = useState(false);
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
			{ id: item.id, 
			  divisionId: item.division_id,
			  divisionName: arrayDivisions.filter(comp => comp.id == item.division_id)[0].name,
			  company: filter.name,
			  title: item.title,
			  description: item.description,
			  preLoadPageAttributes: '',
			  postLoadPageAttributes: '',
			  liveDate: getDate(item.live_date),
			  deactiveDate: null,
			  notes: item.notes,
			  usePagination: item.use_pagination,
			  useAutoSpace: true,
			  useBoxControls: false,
			  isNew: false
			},
		  ]);
		setOpenBuild(true);
	}

	const handleUpdateOnCancel = (e) => {
		setOpenBuild(false);
		setItem({});
	  };

	const handleClick = () => {
		if (filter != null) {
			setOpenNew(true);
			return;
		}
		const id = uuidv4();
		setRows((oldRows) => [
		  ...oldRows,
		  { id, 
			divisionId: '',
			divisionName: '',
			company: '',
			title: '',
			description: '',
			preLoadPageAttributes: '',
			postLoadPageAttributes: '',
			liveDate: null,
			deactiveDate: null,
			notes: '',
			usePagination: false,
			useAutoSpace: false,
			useBoxControls: false,
			isNew: true
		  },
		]);
		setRowModesModel((oldModel) => ({
		  ...oldModel,
		  [id]: { mode: GridRowModes.Edit, fieldToFocus: 'title' },
		}));
	  };
  
	return (
		<React.Fragment>
			{openNew && <PopupNewTemplate props={props} arrayDivisions={arrayDivisions} rows={rows} onClose={handleOnClose} onSubmit={handleOnSubmit} />}
			{openBuild && <SetupTemplate onSubmitAdd={handleUpdateOnCancel} 
				onSubmitChange={handleUpdateOnCancel} 
				name={item.title} 
				templateId={item.id} 
				divisionId={item.division_id} 
				preLoadAttributes={''} 
				postLoadAttributes={''}
				usePages={item.use_pagination == 1} />}
	  <GridToolbarContainer>
		<Tooltip title="Add a new Template">
			<Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
		  	Add a Template
			</Button>
		</Tooltip>
		<GridToolbar />
	  </GridToolbarContainer>
	  </React.Fragment>
	);
  }

export default function TemplateGrid(props) {
	const [loading, setLoading] = useState(true);
	const [arrayDivisions, setArrayDivisions] = useState([{}]);
	const [open, setOpen] = useState(false);
	const [openHtml, setOpenHtml] = useState(false);
	const [error, setError] = useState('');
	const [deleteId, setDeleteId] = useState('');
	const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
	const [preHtml, setPreHtml] = useState('');
	const [postHtml, setPostHtml] = useState('');
	const [htmlId, setHtmlId] = useState('');
	const [preview, setPreview] = useState(false);
	const [usePages, setUsePages] = useState(false);
	const [isAssociateUser, setIsAssociateUser] = useState(false);
	const [isSetupTemplate, setIsSetupTemplate] = useState(false);
	const [isEmpty, setIsEmpty] = useState(false);

	const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
	  if (params.reason === GridRowEditStopReasons.rowFocusOut) {
		event.defaultMuiPrevented = true;
	  }
	};

	const client = generateClient<Schema>();
	const [division, setDivision] = useState<Schema["division"]["type"][]>([]);
	const [userData, setUserData] = useState([{
		id: '',   
		divisionId: '',
		divisionName: '',
		company: '',
		title: '',
		description: '',
		preLoadPageAttributes: '',
		postLoadPageAttributes: '',
		liveDate: null,
		deactiveDate: null,
		notes: '',
		created: '',
		createdBy: '',
		usePagination: false,
		useAutoSpace: false,
		useBoxControls: false,
	  }]);

	  const [rows, setRows] = useState<GridRowsProp>([]);
	  const [filter, setFilter] = useState(props.filter);
	  const [filtered, setFiltered] = useState<Schema["template_question"]["type"][]>([]);

	  const getQuestionsByTemplate = async (tempId) => {
		const { data: items, errors } = await client.queries.listQuestionsByTemplateId({
		  templateId: tempId
		});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		  setLoading(false);
		  return;
		}
		if (items == null || items.length < 1) {
			setFiltered(null);
			setIsEmpty(true);
		} else {
			setFiltered(items.filter(comp => !comp.question_type.includes('dialog_input')));
			setIsEmpty(false);
		}
		setLoading(false);
	  };

	  const allDivisions = async () => {
		  const { data: items, errors } = 
		    props.id != null ?
		  	await client.models.division.get({
				id: props.id
			})
		    : props.filter == null ?
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
		var data = [{id: item.id, 
			divisionId: item.division_id, 
			divisionName: item.division,
			company: item.company, 
			title: item.title,
			description: item.description,
			preLoadPageAttributes: item.pre_load_page_attributes,
			postLoadPageAttributes: item.post_load_page_attributes,
			liveDate: getDate(item.live_date),
			deactiveDate: getDate(item.deactive_date),
			notes: item.notes,
			created: item.created,
			createdBy: item.created_by,
			usePagination: item.use_pagination == 1 ? true : false,
			useAutoSpace: item.auto_space == 1 ? true : false,
			useBoxControls: item.box_controls == 1 ? true : false,
		  }];
		for (var i=1; i < items.length; i++) {
		  const item = JSON.parse(items[i]);
		  data.push(
			{id: item.id, 
				divisionId: item.division_id, 
				divisionName: item.division,
				company: item.company, 
				title: item.title,
				description: item.description,
				preLoadPageAttributes: item.pre_load_page_attributes,
				postLoadPageAttributes: item.post_load_page_attributes,
				liveDate: getDate(item.live_date),
				deactiveDate: getDate(item.deactive_date),
				notes: item.notes,
				created: item.created,
				createdBy: item.created_by,
				usePagination: item.use_pagination == 1 ? true : false,
				useAutoSpace: item.auto_space == 1 ? true : false,
				useBoxControls: item.box_controls == 1 ? true : false,}
		  );
		}
		return data;
	  }

	  const getTemplates = async (isLoading) => {
		const { data: items, errors } = 
			props.id != null ?
			await client.queries.listAllTemplatesByDivisionId({
				divisionId: props.id
			})
			: props.filter == null ?
			await client.queries.listAllTemplates({
			}) :
			await client.queries.listAllTemplatesByCompanyId({
				companyId: props.filter.id
			});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
			return;
		}
		if (Array.isArray(items) && items.length > 0) {
		  	const db = JSON.stringify(items);
		  	const userItems = JSON.parse(db);
		  	const data = translateUserTemplates(userItems);
			setUserData(data);
			setRows(data);
			if (isLoading) {
				setLoading(false);
			}
		}
	  };

	useEffect(() => {
		getTemplates(false);
		allDivisions();
	  }, []);

	  function handleRowClick (params, event, details) {
	}

	const handleRowChangeEvent: GridEventListener<'rowCountChange'> = (params, event, details) => {
	}

	const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
		id: false,
		divisionId: false,
	  });
  
	const handleDeactiveOrActivate = async(id, isDeactive) => {
		const now = new Date();
		const { errors, data: updatedData } = await client.models.template.update({
			id: id,
			deactive_date: (isDeactive) ? now : null
		});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
		setLoading(true);
		getTemplates(true);
	}

	const handleDeleteRow = async(id) => {
		const { errors, data: deletedData } = await client.models.template.delete({
			id: id
		});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
	}

	const handlePrePostAttributeUpdate = async(id, pre, post) => {
		const now = new Date();
		const { errors, data: updatedData } = await client.models.template.update({
			id: id,
			pre_load_page_attributes: pre,
			post_load_page_attributes: post,
		});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
		setLoading(true);
		getTemplates(true);
	}

	const handleAddRow = async(newRow:GridRowModel) => {
		const now = new Date();
		const companyArr = newRow.divisionName.split("|");
		const { errors, data: items } = await client.models.template.create({
			id: newRow.id,
			division_id: companyArr.length < 2 ? division[0].id : companyArr[1],
			title: newRow.title, 
			description: newRow.description,
			live_date: newRow.liveDate != null ? newRow.liveDate.toISOString().slice(0, 10) : now.toISOString().slice(0, 10),
			prod_date: newRow.liveDate != null ? newRow.liveDate.toISOString().slice(0, 10) : now.toISOString().slice(0, 10),
			notes: newRow.notes,
			created: now,
			created_by: 0,
			use_pagination: newRow.usePagination ? 1 : 0,
			auto_space: newRow.useAutoSpace ? 1 : 0,
			box_controls: newRow.useBoxControls ? 1 : 0		
		});
		if (errors) {
			setError(errors[0].message);
			setOpen(true);
		}
	}

	const handleUpdateRow = async(newRow: GridRowModel) => {
		const now = new Date();
		const companyArr = newRow.divisionName.split("|");
		const { errors, data: updatedData } = await client.models.template.update({ 
			id: newRow.id,
			division_id: companyArr.length < 2 ? newRow.divisionId : companyArr[1],
			title: newRow.title, 
			description: newRow.description,
			live_date: newRow.liveDate != null ? newRow.liveDate.toISOString().slice(0, 10) : now.toISOString().slice(0, 10),
			prod_date: newRow.liveDate != null ? newRow.liveDate.toISOString().slice(0, 10) : now.toISOString().slice(0, 10),
			notes: newRow.notes,
			use_pagination: newRow.usePagination ? 1 : 0,
			auto_space: newRow.useAutoSpace ? 1 : 0,
			box_controls: newRow.useBoxControls ? 1 : 0		
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
		if (newRow.title == "") {
			setError("Please provide a template title.");
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
		return <SelectGridCustomer {...params} company={division}  nullOk={false}/>;
	  };

	const handleAssociations = (id: GridRowId) => () => {
		const row = rows.filter((row) => row.id == id);
		setHtmlId(id);
		setPreHtml(row[0].title);
		setPostHtml(row[0].divisionId);
		setIsAssociateUser(true);
	}

	const handleBuild = (id: GridRowId) => () => {
		const row = rows.filter((row) => row.id == id);
		setHtmlId(id);
		setPreHtml(row[0].title);
		setPostHtml(row[0].divisionId);
		setUsePages(row[0].usePagination);
		setIsSetupTemplate(true);
	}

	const handleUpdateOnCancel = (e) => {
		setIsAssociateUser(false);
		setIsSetupTemplate(false);
		setPostHtml('');
		setPreHtml('');
		setHtmlId('');
		setUsePages(false);
	  };

	const handlePreviewClick = (id: GridRowId) => () => {
		setLoading(true);
		const row = rows.filter((row) => row.id == id);
		setPostHtml(row[0].postLoadPageAttributes);
		setPreHtml(row[0].preLoadPageAttributes);
		setHtmlId(row[0].title);
		setUsePages(row[0].usePagination);
		getQuestionsByTemplate(id);
		setPreview(true);
	}

	const handlePrePostHtmlAttributes = (id: GridRowId) => () => {
		setHtmlId(id);
		const row = rows.filter((row) => row.id == id);
		setPostHtml(row[0].postLoadPageAttributes);
		setPreHtml(row[0].preLoadPageAttributes);
		setOpenHtml(true);
	}

	const handleClose = () => {
		setOpen(false);
		setError('');
		setDeleteId('');
	};

	const handleCloseHtml = () => {
		setOpenHtml(false);
		setPostHtml('');
		setPreHtml('');
		setHtmlId('');
	};

	const handlePostPageAttributes = (pre, post, id) => {
		setOpenHtml(false);
		setPostHtml('');
		setPreHtml('');
		setHtmlId('');
		handlePrePostAttributeUpdate(id, pre, post);
	}

	const handlePreviewClose = () => {
		setPreview(false);
		setPostHtml('');
		setPreHtml('');
		setHtmlId('');
		setUsePages(false);
	}

	function handleRowSelection (rowSelectionModel, details) {
		// called on checkbox for row.   
		if (rowSelectionModel.length == 0) {
  
		} else {
		  if (rowSelectionModel.length == 1) {
			const id = rowSelectionModel[0];
			const row = rows.filter((row) => row.id == id);
			setHtmlId(id);
			setPreHtml(row[0].title);
			setPostHtml(row[0].divisionId);
			setUsePages(row[0].usePagination);
			setIsSetupTemplate(true);
		  } else {
		  }
		}
	  }

	const preProcessEditCellProps = (params: GridPreProcessEditCellProps) => {
		if (!params.hasChanged) {
			return { ...params.props, error: null};
		}
		const existingTemplates = rows.map((row) => row.title.toLowerCase());
		const titleName = params.props.value!.toString();
		const exists = existingTemplates.includes(titleName.toLowerCase()) && titleName.length > 1;
		const errorMessage = exists ? `${titleName} is already taken.` : null;
		if (errorMessage != null) {
			setError(errorMessage);
			setOpen(true);
		}
		return { ...params.props, error: errorMessage};
	}

	const columns: GridColDef[] = [
		{ field: 'id', headerName: 'Id', width: 70 },
		{ field: 'divisionId', headerName: 'DivisionId', width: 70 },
		{ field: 'company', headerName: 'Company Name', width: 100, headerClassName: 'grid-headers',
			valueGetter: (value, row) => {
				return row.isNew ? "--" : value;
			}
		 },
		{ field: 'divisionName', headerName: 'Division Name', width: 100, headerClassName: 'grid-headers',
			renderEditCell: renderSelectEditInputCell,
			valueGetter: (value) => {
				return value.split("|")[0];
		  }, editable: true 
		 },
		{ field: 'title', headerName: 'Template Title', width: 160, headerClassName: 'grid-headers', 
			preProcessEditCellProps,
			editable: true  },
		{ field: 'description', headerName: 'Description', width: 200, headerClassName: 'grid-headers', editable: true  },
		{ field: 'notes', headerName: 'Notes', headerClassName: 'grid-headers', width: 100, editable: true  },
		{ field: 'liveDate', type: 'date', 
			headerName: 'Live', width: 100, headerClassName: 'grid-headers', editable: true },
		{ field: 'isActive',
			headerName: 'isActive',
			width: 70,
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
		{ field: 'usePagination', headerName: 'Pages', type: 'boolean', width: 70, headerClassName: 'grid-headers', editable: true  },
		{ field: 'useAutoSpace', headerName: 'Space', type: 'boolean', width: 70, headerClassName: 'grid-headers', editable: true },
		{ field: 'useBoxControls', headerName: 'Box', type: 'boolean', width: 70, headerClassName: 'grid-headers', editable: true },
		{ field: 'actions', headerName: 'Actions', headerClassName: 'grid-headers',
			type: 'actions',
			width: 100,
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
				<Tooltip title="Preview Template">
					<GridActionsCellItem icon={<PreviewIcon />} label="Preview" color='success' onClick={handlePreviewClick(id)} />
				</Tooltip>,
				<GridActionsCellItem icon={<EditIcon />} label="Edit" color='primary' onClick={handleEditClick(id)} />,
				<GridActionsCellItem icon={<HtmlIcon />} label="html" color='success' onClick={handlePrePostHtmlAttributes(id)} showInMenu/>,
				<GridActionsCellItem icon={<PersonAddAltIcon />} label='Associate Users' onClick={handleAssociations(id)} showInMenu/>,
				<GridActionsCellItem icon={<BuildIcon />} label='Build Template' onClick={handleBuild(id)} showInMenu/>,
				<GridActionsCellItem icon={<DeleteOutlineIcon />} label="Deactivate" onClick={handleDeactivate(id)} showInMenu/>,
				<GridActionsCellItem icon={<AddCircleOutlineIcon />} label="Activate" onClick={handleActivate(id)} showInMenu/>,
				<GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDelete(id)} showInMenu />,
				]
			}
		}
	  ];

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
			"This can orphan rows if there is activity against this template)" : error}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
			{error == '' ? <Button variant='contained' color='success' onClick={handleDeleteClick(deleteId)}>Delete</Button> : null}
          <Button variant='contained' color='error' onClick={handleClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openHtml}
        onClose={handleCloseHtml}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const pre = formJson.pre;
			const post = formJson.post;
            handlePostPageAttributes(pre, post, htmlId);
          },
        }}
      >
        <DialogTitle>Pre-Post Load Page HTML Attributes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter Pre-load Page HTML:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="pre"
            name="pre"
            label="Pre-load page attributes"
            fullWidth
            multiline
			rows={5}
			defaultValue={preHtml}
          />
        </DialogContent>
        <DialogContent>
          <DialogContentText>
            Enter Post-load Page HTML:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="post"
            name="post"
            label="Post-load page attributes"
            fullWidth
            multiline
			rows={5}
			defaultValue={postHtml}
          />
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='error' onClick={handleCloseHtml}>Cancel</Button>
          <Button variant='contained' color='success' type="submit">Save</Button>
        </DialogActions>
      </Dialog>
      {preview && (isEmpty || (filtered && filtered.length > 0)) && <PopupReview props={props} 
        onSubmitClose={handlePreviewClose}
        preLoadAttributes={preHtml}
        usePages={usePages}
        name={htmlId}
        filtered={filtered}
        postLoadAttributes={postHtml}
      />}
	  {isAssociateUser && <AssociateUsers 
	  	onSubmitAdd={handleUpdateOnCancel} 
		onSubmitChange={handleUpdateOnCancel} 
		name={preHtml} id={htmlId} divisionId={postHtml}/>}
      {isSetupTemplate && <SetupTemplate onSubmitAdd={handleUpdateOnCancel} 
        onSubmitChange={handleUpdateOnCancel} 
        name={preHtml} 
		isWizard={false}
        templateId={htmlId} 
        divisionId={postHtml} 
        preLoadAttributes={''} 
        postLoadAttributes={''}
        usePages={usePages} /
      >}
	<Stack>
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
				toolbar: { filter, arrayDivisions, rows, setRows, setRowModesModel },
			}}
			/>
		</Paper>
	</Stack>
	</React.Fragment>
  );
}
