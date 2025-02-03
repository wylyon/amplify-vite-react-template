
// @ts-nocheck
import * as React from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import {
  DataGrid,
  GridRenderCellParams,
  GridColDef,
  useGridApiContext,
} from '@mui/x-data-grid';
import { getStates } from '../src/utils.js';

export default function SelectGridState(props: GridRenderCellParams) {
  const { id, value, field } = props;
  const apiRef = useGridApiContext();

  const handleChange = async (event: SelectChangeEvent) => {
    await apiRef.current.setEditCellValue({ id, field, value: event.target.value });
    apiRef.current.stopCellEditMode({ id, field });
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      name='state'
      id='state'
      size="small"
      sx={{ height: 1 }}
      native
      autoFocus
    >
	{getStates().map(comp => 
	    (<option key={comp} value={comp}>{comp}</option>))}
    </Select>
  );
}
