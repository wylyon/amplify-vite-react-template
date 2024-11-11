
// @ts-nocheck
import AdminMain from '../src/AdminMain';
import AdminSuper from '../src/AdminSuper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function AdminMode(props) {
  const handleOnSignOut = (e) => {
    props.onSubmitChange(false);
  };

  return (
    <main>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
		<div className="topnav">
		<a href="#home" className="active"><i className="fa fa-building" style={{fontSize:24}} />
		{props.isSuperAdmin ? "Super Admin" : "Admin"}
			<div className="rightText">
			({props.userId}) <i className="fa fa-sign-out" style={{fontSize:24}}  onClick={handleOnSignOut} />
			</div>
		</a>
		</div>
		<Stack>
			<Typography variant="h4" sx={{textAlign: 'center', bgcolor: 'background.paper'}}>Log/Report Capture Tool</Typography>
			{props.isSuperAdmin && <AdminSuper props={props} googleAPI={props.googleAPI} /> }
			{!props.isSuperAdmin && <AdminMain props={props} googleAPI={props.googleAPI} companyId={props.companyId}/> }
		</Stack>
    </main> 
  );
}
