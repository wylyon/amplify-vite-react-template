
// @ts-nocheck
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridToolbar, GridColumnVisibilityModel } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useState, useEffect} from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition

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
		setLoading(false);
	}

	const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
      id: false,
    });

	
	const columns: GridColDef[] = [
		{ field: 'id', headerName: 'Id', width: 70 },
		{ field: 'name', headerName: 'Company Name', width: 150 },
		{ field: 'email', headerName: 'Email', width: 200 },
		{
		  field: 'address1',
		  headerName: 'Address',
		  width: 200,
		},
		{ field: 'city', headerName: 'City', width: 150 },
		{ field: 'state', headerName: 'State', width: 50 },
		{ field: 'zipcode', headerName: 'Zipcode', width: 100},
		{ field: 'ref_department', headerName: 'Department', width: 200}
	  ];

	const paginationModel = { page: 0, pageSize: 9 };

  return (
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
		/>
  	</Paper>
  );
}
