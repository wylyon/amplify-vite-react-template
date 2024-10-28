
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
		<Tooltip title="Add a new Template">
			<Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
		  	Add a Template
			</Button>
		</Tooltip>
		<GridToolbar />
	  </GridToolbarContainer>
	);
  }

export default function TemplateGrid(props) {
	const [loading, setLoading] = useState(true);

	const client = generateClient<Schema>();
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
		prodDate: null,
		deactiveDate: null,
		notes: '',
		created: '',
		createdBy: '',
		usePagination: false,
		useAutoSpace: false,
		useBoxControls: false,
	  }]);

	  function getDate(value) {
		if (value == null) {
			return null
		}
		return new Date(value);
	  }

	  function translateUserTemplate (item) {
		const data = [{id: item.id, 
			divisionId: item.division_id, 
			divisionName: item.division,
			company: item.company, 
			title: item.title,
			description: item.description,
			preLoadPageAttributes: item.pre_load_page_attributes,
			postLoadPageAttributes: item.post_load_page_attributes,
			liveDate: getDate(item.live_date),
			prodDate: getDate(item.prod_date),
			deactiveDate: getDate(item.deactive_date),
			notes: item.notes,
			created: item.created,
			createdBy: item.created_by,
			usePagination: item.use_pagination == 1 ? true : false,
			useAutoSpace: item.auto_space == 1 ? true : false,
			useBoxControls: item.box_controls == 1 ? true : false,
		  }];
		return data;
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
			prodDate: getDate(item.prod_date),
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
				prodDate: getDate(item.prod_date),
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

	  const getTemplates = async () => {
		const { data: items, errors } = await client.queries.listAllTemplates({
		})
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
		getTemplates();
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
	  divisionId: false,
	  preLoadPageAttributes: false,
	  postLoadPageAttributes: false,
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
		{ field: 'divisionName', headerName: 'Division Name', width: 150, headerClassName: 'grid-headers' },
		{ field: 'company', headerName: 'Company Name', width: 150, headerClassName: 'grid-headers' },
		{ field: 'title', headerName: 'Template Title', width: 150, headerClassName: 'grid-headers' },
		{ field: 'description', headerName: 'Description', width: 200, headerClassName: 'grid-headers' },
		{ field: 'preLoadPageAttributes', headerName: 'Pre-Load-Page-Attributes', width: 200 },
		{ field: 'postLoadPageAttributes', headerName: 'Post-Load-Page-Attributes', width: 200 },
		{
		  field: 'liveDate',
		  type: 'date',
		  headerName: 'Live',
		  width: 100, headerClassName: 'grid-headers'
		},
		{ field: 'prodDate', headerName: 'Prod', type: 'date', width: 100, headerClassName: 'grid-headers' },
		{ field: 'deactiveDate', headerName: 'DeActive', type: 'date', width: 100, headerClassName: 'grid-headers' },
		{ field: 'usePagination', headerName: 'Paging', type: 'boolean', width: 80, headerClassName: 'grid-headers' },
		{ field: 'useAutoSpace', headerName: 'Spacing', type: 'boolean', width: 80, headerClassName: 'grid-headers'},
		{ field: 'useBoxControls', headerName: 'Boxing', type: 'boolean', width: 80, headerClassName: 'grid-headers'},
		{ field: 'actions', headerName: 'Actions', headerClassName: 'grid-headers',
			type: 'actions',
			width: 80,
			getActions: (params) => [
				<GridActionsCellItem icon={<EditIcon />} label="Edit" color='primary' onClick={handleEdit(params.id)} />,
				<GridActionsCellItem icon={<PersonAddAltIcon />} label='Associate Users' onClick={handleAssociations(params.id)} showInMenu/>,
				<GridActionsCellItem icon={<BuildIcon />} label='Build Template' onClick={handleBuild(params.id)} showInMenu/>,
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
