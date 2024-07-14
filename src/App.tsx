
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);
  
  return (
        
    <Authenticator>
      {({ signOut, user }) => (
      <main>
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
  	  <a href="#home" class="active"><img src={"/public/log.png"} class="leftText" alt="My Image" />
	    <div class="rightText">
		({user?.signInDetails?.loginId})
		<button type="button" onClick={signOut}>Sign Off</button>
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
