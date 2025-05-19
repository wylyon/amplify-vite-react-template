
// @ts-nocheck
import { useState, useEffect} from "react";
import CompanyGrid from '../src/CompanyGrid';
import DivisionGrid from '../src/DivisionGrid';
import TemplateGrid from '../src/TemplateGrid';
import InputCustCompany from '../src/InputCustCompany';
import UserGrid from '../src/UserGrid';
import SummaryAllResults from '../src/SummaryAllResults';
import SummaryByTemplate from '../src/SummaryByTemplate';
import ResultsByTemplate from '../src/ResultsByTemplate';
import TransactionStatus from "../src/TransactionStatus";
import ResultSummary from '../src/ResultSummary';
import TransactionsAllByCompany from "../src/TransactionsAllByCompany";
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

export default function AdminMain(props) {
	const [value, setValue] = useState(0);
	const [hValue, setHValue] = useState(0);
	const [company, setCompany] = useState<Schema["company"]["type"][]>([]);
	const [templateId, setTemplateId] = React.useState(null);
	const [id, setId] = React.useState(null);
	const [isDivisions, setIsDivisions] = useState(false);

	const client = generateClient<Schema>();

	const handleLog = async(content) => {
		const now = new Date();
		const { data: items, errors } = await client.models.Log.create ({
			userName: props.userId,
			content: content,
			transactionDate: now
		});
		if (errors) {
			console.log('Cant create log entry for ' + content, errors);
		}
	}

	const getCompanyById = async (compId) => {
		const { data: item, errors } = await client.models.company.get({
		  id: compId
		});
		if (errors) {
		  alert(errors[0].message);
		  return;
		}
		setIsDivisions(item.enable_divisions == 1);
		setCompany(item);
	  };

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
	  setId(null);
	  setValue(newValue);
	  handleLog(
		newValue == 0 ? "Log Apps" :
		newValue == 1 ? "Users" :
		newValue == 2 && isDivisions ? "Divisions" :
		newValue == 2 ? "Transaction Status" :
		newValue == 3 && isDivisions ? "Transaction Status" :
		newValue == 3 ? "Reports"  :
		newValue == 4 && isDivisions ? "Reports" :
		newValue == 4 ? "Profile" :
		newValue == 5 ? "Profile" : ''
	  );
	};

	const handleTurnOnDivision = (isDivision) => {
		setIsDivisions(isDivision == 1);
	}

	const handleReportChange = (event: React.SyntheticEvent, newValue: number) => {
		setTemplateId(null);
		setHValue(newValue);
		handleLog(
			newValue == 0 ? "Reports - Summary All Results" :
			newValue == 1 ? "Reports - Summary By Logging App" :
			newValue == 2 ? "Reports - Detailed Report By Logging App" :
			newValue == 3 ? "Reports - Transaction Detail By Company" :
			newValue == 4 ? "Reports - Other Analytics" : ''
		);
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
		setValue(0);
	}

	const handleOnRowSelectSummaryAll = (id) => {
		setTemplateId(id);
		setHValue(1);
	}

	const handleOnRowSelectSummaryTemplate = (id) => {
		setTemplateId(id);
		setHValue(2);
	}

	const handleOnRowSelectResults = (id) => {
		setTemplateId(id);
		setHValue(4);
	}

	useEffect(() => {
		getCompanyById(props.companyId);
	}, []);

  return (
	<Stack>
	<Typography variant="h4">{company.name} Admin</Typography>
	<Box>
		<Tabs
			orientation="horizontal"
			variant="scrollable"
			value={value}
			onChange={handleChange}
			aria-label="Vertical tabs example"
		>
			<Tab label="Log Apps" {...a11yProps(0)} />
			<Tab label="Users" {...a11yProps(1)} />
			{isDivisions && <Tab label="Divisions" {...a11yProps(2)} /> }
			<Tab label="Transaction Status" {...a11yProps(3)} />
			<Tab label="Reports" {...a11yProps(4)} />
			<Tab label="Profile" {...a11yProps(5)} />
		</Tabs>
		<TabPanel value={value} index={0}>
			{ company && company.id != null && <TemplateGrid props={props} userId={props.userId} filter={company} id={id} isDivision={isDivisions} /> }
		</TabPanel>
		<TabPanel value={value} index={1}>
			<UserGrid props={props} userId={props.userId} filter={company}/>
		</TabPanel>
		<TabPanel value={value} index={isDivisions ? 2 : 5}>
			<DivisionGrid props={props} userId={props.userId} filter={company} id={id} onRowSelect={handleOnRowSelectDivision}/>
		</TabPanel>
		<TabPanel value={value} index={isDivisions ? 3 : 2}>
			<TransactionStatus props={props} filter={company} googleAPI={props.googleAPI} transactionId={templateId} />
		</TabPanel>
		<TabPanel value={value} index={isDivisions ? 4 : 3}>
			<Tabs
				orientation="horizontal"
				variant="scrollable"
				value={hValue}
				onChange={handleReportChange}
				aria-label="Report tabs">
				<Tab label="Summary All Results" {...a11yHProps(0)} />
				<Tab label="Summary By Logging App" {...a11yHProps(1)} />
				<Tab label="Detailed Report By Logging App" {...a11yHProps(2)} />
				<Tab label="Transaction Detail By Company" {...a11yHProps(3)} />
				<Tab label="Other Analytics" {...a11yHProps(4)} />
			</Tabs>
			<CustomTabPanel value={hValue} index={0}>
				<SummaryAllResults props={props} filter={company} onRowSelect={handleOnRowSelectSummaryAll} />
			</CustomTabPanel>
			<CustomTabPanel value={hValue} index={1}>
				<SummaryByTemplate props={props} filter={company} googleAPI={props.googleAPI} templateId={templateId} onRowSelect={handleOnRowSelectSummaryTemplate} />
			</CustomTabPanel>
			<CustomTabPanel value={hValue} index={2}>
				<ResultsByTemplate props={props} filter={company} googleAPI={props.googleAPI} transactionId={templateId} onRowSelect={handleOnRowSelectResults} />
			</CustomTabPanel>
			<CustomTabPanel value={hValue} index={3}>
				<TransactionsAllByCompany props={props} filter={company} googleAPI={props.googleAPI} templateId={templateId} />
			</CustomTabPanel>
			<CustomTabPanel value={hValue} index={4}>
				<ResultSummary props={props} filter={company} templateId={templateId} />
			</CustomTabPanel>
		</TabPanel>
		<TabPanel value={value} index={isDivisions ? 5 : 4}>
			<InputCustCompany props={props} 
				company={company} isAddMode = {false} onSubmitChange={handleOnSignOut} onTurnOnDivision={handleTurnOnDivision} isDivision={isDivisions} />
		</TabPanel>
	</Box>
	</Stack>
  );
}
