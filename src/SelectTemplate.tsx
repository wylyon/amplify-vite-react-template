// @ts-nocheck
import { useState, useEffect  } from "react";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
export default function SelectTemplate(props) {

  const [selectTemplate, setSelectTemplate] = useState('');
  const [arrayTemplates, setArrayTemplates] = useState([]);

  const handleSelectChange = (e) => {
    setSelectTemplate(e.target.value);
    e.target.value.includes("!") ?
    props.onSelectTemplate(arrayTemplates[e.target.value].split("!")[0]) : e.target.value;
  };

  useEffect(() => {
	  const arrTemplates = props.theTemplates.split("|");
    setArrayTemplates(arrTemplates);
	}, []);

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl >
        <InputLabel id="demo-simple-select-label">Templates</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={0}
          label="Templates"
          onChange={handleSelectChange}
        >
          { arrayTemplates.map((comp, index) => 
            <MenuItem key={index} value={index}>{comp.split("!")[1]}</MenuItem>
          )}
        </Select>
      </FormControl>
    </Box>
  );
}