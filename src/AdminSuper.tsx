
// @ts-nocheck
import CompanyGrid from '../src/CompanyGrid';
import DivisionGrid from '../src/DivisionGrid';
import TemplateGrid from '../src/TemplateGrid';
import UserGrid from '../src/UserGrid';
import SummaryAllResults from '../src/SummaryAllResults';
import SummaryByTemplate from '../src/SummaryByTemplate';
import ResultsByTemplate from '../src/ResultsByTemplate';
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Hvac } from '@mui/icons-material';

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
  function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
  
	return (
	  <div
		role="tabpanel"
		hidden={value !== index}
		id={`simple-tabpanel-${index}`}
		aria-labelledby={`simple-tab-${index}`}
		{...other}
	  >
		{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
	  </div>
	);
  }
  
  function a11yHProps(index: number) {
	return {
	  id: `simple-tab-${index}`,
	  'aria-controls': `simple-tabpanel-${index}`,
	};
  }

export default function AdminSuper(props) {
	const [value, setValue] = React.useState(0);
	const [hValue, setHValue] = React.useState(0);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
	  setValue(newValue);
	};

	const handleReportChange = (event: React.SyntheticEvent, newValue: number) => {
		setHValue(newValue);
	  };

  	const handleOnSignOut = (e) => {
    	props.onSubmitChange(false);
  	};

  return (
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
			<Tab label="Companies" {...a11yProps(0)} />
			<Tab label="Divisions" {...a11yProps(1)} />
			<Tab label="Templates" {...a11yProps(2)} />
			<Tab label="Users" {...a11yProps(3)} />
			<Tab label="Reports" {...a11yProps(4)} />
		</Tabs>
		<TabPanel value={value} index={0}>
			<CompanyGrid props={props} />
		</TabPanel>
		<TabPanel value={value} index={1}>
			<DivisionGrid props={props} filter={null} />
		</TabPanel>
		<TabPanel value={value} index={2}>
			<TemplateGrid props={props}  filter={null}/>
		</TabPanel>
		<TabPanel value={value} index={3}>
			<UserGrid props={props} filter={null}/>
		</TabPanel>
		<TabPanel value={value} index={4}>
			<Tabs
				orientation="horizontal"
				variant="scrollable"
				value={hValue}
				onChange={handleReportChange}
				aria-label="Report tabs">
				<Tab label="Detailed Report By Template" {...a11yHProps(0)} />
				<Tab label="Summary All Results" {...a11yHProps(1)} />
				<Tab label="Summary By Template" {...a11yHProps(2)} />
			</Tabs>
			<CustomTabPanel value={hValue} index={0}>
				<ResultsByTemplate props={props} filter={null} />
			</CustomTabPanel>
			<CustomTabPanel value={hValue} index={1}>
				<SummaryAllResults props={props} filter={null} />
			</CustomTabPanel>
			<CustomTabPanel value={hValue} index={2}>
				<SummaryByTemplate props={props} filter={null} />
			</CustomTabPanel>
		</TabPanel>
	</Box>
  );
}
