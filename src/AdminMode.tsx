
// @ts-nocheck
import ShowMenu from '../src/ShowMenu';

export default function AdminMode(props) {
  const handleOnSignOut = (e) => {
    props.onSubmitChange(false);
  };

  return (
      <main>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
	<div className="topnav">
  	  <a href="#home" class="active"><i className="fa fa-building" style={{fontSize:24}} />
	  {props.isSuperAdmin ? "Super Admin" : "Admin"}
	    <div className="rightText">
		({props.userId}) <i className="fa fa-sign-out" style={{fontSize:24}}  onClick={handleOnSignOut} />
	    </div>
	  </a>
	</div>
	<p className="gwd-p-1l8f">Log/Report Capture Tool</p>
	<ShowMenu selectedCompanyId={props.companyId} isSuperAdmin={props.isSuperAdmin} numAdmin={props.adminLength}/> 
      </main> 
  );
}
