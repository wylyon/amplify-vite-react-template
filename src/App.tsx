
// @ts-nocheck
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function App() {
  return (
     
    <Authenticator>
      {({ signOut, user }) => (
      <main>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
  	<div id="nav">
    	  <ul>
      	    <li><a href="index.html">Home</a></li>
      	    <li><a href="about.html">Report</a></li>
      	    <li><a href="products.html">SetUp +</a>
		<ul>
		  <li><a href="#">Company</a></li>
		  <li><a href="#">Division</a></li>
		  <li><a href="#">Users +</a>
		    <ul>
			<li><a href="#">Admin</a></li>
			<li><a href="#">Customer</a></li>
		    </ul>
		  </li>
		  <li><a href="#">Template</a></li>
		</ul>
	    </li>
	    <li><a href="about.html">Update +</a>
		<ul>
		  <li><a href="#">Company</a></li>
		  <li><a href="#">Division</a></li>
		  <li><a href="#">Users +</a>
		    <ul>
			<li><a href="#">Admin</a></li>
			<li><a href="#">Customer</a></li>
		    </ul>
		  </li>
		  <li><a href="#">Template</a></li>
		</ul>
	    </li>
   	  </ul>
  	</div>
	<div class="topnav">
  	  <a href="#home" class="active"><img src="images/log.png" class="leftText" alt="My Image" />
	    <div class="rightText">
		({user?.signInDetails?.loginId}) <i className="fa fa-sign-out" style={{fontSize:24}}  onClick={signOut} />
	    </div>
	  </a>
	</div>
	<p class="gwd-p-1l8f">Log/Report Capture Tool</p>
      </main>
      )}
    </Authenticator>
  );
}

export default App;
