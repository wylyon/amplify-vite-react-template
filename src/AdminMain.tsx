
// @ts-nocheck
import CompanyGrid from '../src/CompanyGrid';
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

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
	const [value, setValue] = React.useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
	  setValue(newValue);
	};

  	const handleOnSignOut = (e) => {
    	props.onSubmitChange(false);
  	};

  return (
	<Box
		sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 1000 }}
	>
	<Tabs
		orientation="vertical"
		variant="scrollable"
		value={value}
		onChange={handleChange}
		aria-label="Vertical tabs example"
		sx={{ borderRight: 1, borderColor: 'divider' }}
	>
		<Tab label="Companies" {...a11yProps(0)} wrapped/>
		<Tab label="Divisions" {...a11yProps(1)} />
		<Tab label="Templates" {...a11yProps(2)} />
		<Tab label="Users" {...a11yProps(3)} />
		<Tab label="Reports" {...a11yProps(4)} />
	</Tabs>
	<TabPanel value={value} index={0}>
		<CompanyGrid props={props} />
	</TabPanel>
	<TabPanel value={value} index={1}>
		Item Two
	</TabPanel>
	<TabPanel value={value} index={2}>
		Item Three
	</TabPanel>
	<TabPanel value={value} index={3}>
		Item Four
	</TabPanel>
	<TabPanel value={value} index={4}>
		Item Five
	</TabPanel>
	</Box>
  );
}
