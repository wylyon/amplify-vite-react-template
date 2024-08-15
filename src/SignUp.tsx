
// @ts-nocheck
import { Amplify } from "aws-amplify"
import { signUp } from "aws-amplify/auth";
import outputs from "../amplify_outputs.json";

interface SignUpFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
}

interface SignUpForm extends HTMLFormElement {
  readonly elements: SignUpFormElements
}

export default function SignUp(props) {

  const handleOnCancel = (e) => {
    props.onSubmitChange(false);
  };

  async function handleSubmit(event: FormEvent<SignUpForm>) {
    event.preventDefault()
    const form = event.currentTarget
    // ... validate inputs
    try {
      await signUp({
        username: form.elements.email.value,
        password: form.elements.password.value,
      })
    } catch (error) {
      alert(error);
      return;
    }
    props.onSubmitChange(false);
  }

  return (
    <div className="addSignUpData">
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input type="text" id="email" name="email" value={props.email}/>
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" />
	<div class="button-container">
          <button type="submit" style={{ margin: '8px 0', padding: '5px' }}>SignUp</button>
	  <button className="cancelButton" onClick={handleOnCancel}>Cancel</button>
	</div>
      </form>
    </div>
  )
}