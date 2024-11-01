
// @ts-nocheck
import * as React from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import {
  DataGrid,
  GridRenderCellParams,
  GridColDef,
  useGridApiContext,
} from '@mui/x-data-grid';

export default function SelectEditInputCell(props: GridRenderCellParams) {
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
      size="small"
      sx={{ height: 1 }}
      native
      autoFocus
    >
  {props.nullOk ? <option key={props.company.length} value=''></option> : null}
	{props.company.map(comp => (!comp.deactive_date) ? 
	    (<option key={comp.name + "|" + comp.id} value={comp.name + "|" + comp.id}>{comp.name}</option>) : null)}
    </Select>
  );
}
