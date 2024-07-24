
// @ts-nocheck
import { useState, useEffect } from "react";
import InputSettings from '../src/InputSettings';
export default function ShowSettings() {
  const [isOpen, setIsOpen] = useState(false);

  function toggle() {
    setIsOpen((isOpen) => !isOpen);
  }

  return (
    <div className="grid-container">
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
	    <li><a href="about.html">Settings +</a>
		<ul>
		  <li onClick={toggle}><a href="#">Web Access</a></li>
		</ul>
	    </li>
   	  </ul>
  	</div>
	<div>
	  {isOpen && <InputSettings onSubmitChange={toggle}/>}
	</div>
    </div>
  );
}