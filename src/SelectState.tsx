
// @ts-nocheck
import * as React from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { getStates } from '../src/utils.js';

export default function SelectState(props) {

  const handleChange = async (event: SelectChangeEvent) => {
    props.onChange(event.target.value);
  };

  return (
    <Select
      label="State"
      required
      onChange={handleChange}
      size="small"
      native
      autoFocus
    >
	{getStates().map(comp => 
	    (<option key={comp} value={comp}>{comp}</option>))}
    </Select>
  );
}
