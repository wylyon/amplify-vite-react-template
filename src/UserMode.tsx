
// @ts-nocheck

export default function UserMode(props) {
  const handleOnSignOut = (e) => {
    props.onSubmitChange(false);
  };

  return (
      <main>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
	<div className="topnav">
  	  <a href="#home" class="active"><i className="fa fa-building" style={{fontSize:24}} />User
	    <div className="rightText">
		({props.userId}) <i className="fa fa-sign-out" style={{fontSize:24}}  onClick={handleOnSignOut} /><span className="fa-solid fa-bars" style={{fontSize:20}}  onClick={handleOnSignOut} />
	    </div>
	  </a>
	</div>
	<p className="gwd-p-1l8f">Log/Report Capture Tool</p> 
      </main> 
  );
}
