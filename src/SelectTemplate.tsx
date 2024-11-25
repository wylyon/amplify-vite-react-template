// @ts-nocheck
import { useState, useEffect  } from "react";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
export default function SelectTemplate(props) {

  const [selectTemplate, setSelectTemplate] = useState(0);
  const [arrayTemplates, setArrayTemplates] = useState([]);

  function findIndexOfTemplate (arr, tname) {
    var theIndex = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].includes(tname)) {
        theIndex = i;
      }
    }
    return theIndex;
  }

  const handleSelectChange = (e) => {
    setSelectTemplate(e.target.value);
    props.onSelectTemplate(arrayTemplates[e.target.value].split("!")[0]);
  };

  useEffect(() => {
	  const arrTemplates = props.theTemplates.split("|");
    setArrayTemplates(arrTemplates);
    setSelectTemplate(props.templateName == null ? 0 : arrTemplates.length > 0 ? findIndexOfTemplate(arrTemplates, props.templateName) : 0);
	});

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl >
        <InputLabel id="demo-simple-select-label">Templates</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectTemplate}
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