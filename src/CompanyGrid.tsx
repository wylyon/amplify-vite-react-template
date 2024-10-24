
// @ts-nocheck
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridToolbar, GridColumnVisibilityModel, GridEventListener, useGridApiRef, useGridApiContext } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useState, useEffect} from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition

export default function CompanyGrid(props) {
	const [loading, setLoading] = useState(true);

	const client = generateClient<Schema>();
	const [company, setCompany] = useState<Schema["company"]["type"][]>([]);

	useEffect(() => {
		const sub = client.models.company.observeQuery().subscribe({
		  next: (data) => setCompany([...data.items]),
		});
		return () => sub.unsubscribe();
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

	const paginationModel = { page: 0, pageSize: 5 };

  return (
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
		/>
  	</Paper>
  );
}
