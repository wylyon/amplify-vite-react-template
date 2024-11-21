
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
	const [templateId, setTemplateId] = React.useState(null);
	const [id, setId] = React.useState(null);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
	  setId(null);
	  setValue(newValue);
	};

	const handleReportChange = (event: React.SyntheticEvent, newValue: number) => {
		setTemplateId(null);
		setHValue(newValue);
	  };

  	const handleOnSignOut = (e) => {
    	props.onSubmitChange(false);
  	};

	const handleOnRowSelectCompany = (id) => {
		setId(id);
		setValue(1);
	}

	const handleOnRowSelectDivision = (id) => {
		setId(id);
		setValue(2);
	}

	const handleOnRowSelectSummaryAll = (id) => {
		setTemplateId(id);
		setHValue(1);
	}

	const handleOnRowSelectSummaryTemplate = (id) => {
		setTemplateId(id);
		setHValue(2);
	}

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
			<CompanyGrid props={props} onRowSelect={handleOnRowSelectCompany}/>
		</TabPanel>
		<TabPanel value={value} index={1}>
			<DivisionGrid props={props} filter={null} id={id} onRowSelect={handleOnRowSelectDivision}/>
		</TabPanel>
		<TabPanel value={value} index={2}>
			<TemplateGrid props={props}  filter={null} id={id}/>
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
				<Tab label="Summary All Results" {...a11yHProps(0)} />
				<Tab label="Summary By Template" {...a11yHProps(1)} />
				<Tab label="Detailed Report By Template" {...a11yHProps(2)} />
				<Tab label="Other Analytics" {...a11yHProps(3)} />
			</Tabs>
			<CustomTabPanel value={hValue} index={0}>
				<SummaryAllResults props={props} filter={null} onRowSelect={handleOnRowSelectSummaryAll} />
			</CustomTabPanel>
			<CustomTabPanel value={hValue} index={1}>
				<SummaryByTemplate props={props} filter={null} googleAPI={props.googleAPI} templateId={templateId} onRowSelect={handleOnRowSelectSummaryTemplate} />
			</CustomTabPanel>
			<CustomTabPanel value={hValue} index={2}>
				<ResultsByTemplate props={props} filter={null} googleAPI={props.googleAPI} transactionId={templateId} />
			</CustomTabPanel>
			<CustomTabPanel value={hValue} index={3}>
			</CustomTabPanel>
		</TabPanel>
	</Box>
  );
}
