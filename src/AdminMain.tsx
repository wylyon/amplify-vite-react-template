
// @ts-nocheck
import { useState, useEffect} from "react";
import CompanyGrid from '../src/CompanyGrid';
import DivisionGrid from '../src/DivisionGrid';
import TemplateGrid from '../src/TemplateGrid';
import InputCustCompany from '../src/InputCustCompany';
import UserGrid from '../src/UserGrid';
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource'; // Path to your backend resource definition

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
  }

  function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
  
	return (
	  <div
		role="tabpanel"
		hidden={value !== index}
		id={`vertical-tabpanel-${index}`}
		aria-labelledby={`vertical-tab-${index}`}
		{...other}
	  >
		{value === index && (
		  <Box sx={{ p: 3 }}>
			<Typography>{children}</Typography>
		  </Box>
		)}
	  </div>
	);
  }
  
  function a11yProps(index: number) {
	return {
	  id: `vertical-tab-${index}`,
	  'aria-controls': `vertical-tabpanel-${index}`,
	};
  }

export default function AdminMain(props) {
	const [value, setValue] = useState(0);
	const [company, setCompany] = useState<Schema["company"]["type"][]>([]);

	const client = generateClient<Schema>();

	const getCompanyById = async (compId) => {
		const { data: item, errors } = await client.models.company.get({
		  id: compId
		});
		if (errors) {
		  alert(errors[0].message);
		  return;
		}
		setCompany(item);
	  };

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
	  setValue(newValue);
	};

  	const handleOnSignOut = (e) => {
    	props.onSubmitChange(false);
  	};

	useEffect(() => {
		getCompanyById(props.companyId);
	}, []);

  return (
	<Stack>
	<Typography variant="h4">{company.name} Admin</Typography>
	<Box
		sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 1000 }}>
		<Tabs
			orientation="vertical"
			variant="scrollable"
			value={value}
			onChange={handleChange}
			aria-label="Vertical tabs example"
			sx={{ borderRight: 1, borderColor: 'divider' }}
		>
			<Tab label="Templates" {...a11yProps(0)} />
			<Tab label="Users" {...a11yProps(1)} />
			<Tab label="Divisions" {...a11yProps(2)} />
			<Tab label="Reports" {...a11yProps(3)} />
			<Tab label="Profile" {...a11yProps(4)} />
		</Tabs>
		<TabPanel value={value} index={0}>
			{ company && company.id != null && <TemplateGrid props={props} filter={company} /> }
		</TabPanel>
		<TabPanel value={value} index={1}>
			<UserGrid props={props} filter={company}/>
		</TabPanel>
		<TabPanel value={value} index={2}>
			<DivisionGrid props={props} filter={company} />
		</TabPanel>
		<TabPanel value={value} index={3}>
			NOTE:   Reports not yet implemented.
		</TabPanel>
		<TabPanel value={value} index={4}>
			<InputCustCompany props={props} 
				company={company} isAddMode = {false} />
		</TabPanel>
	</Box>
	</Stack>
  );
}
