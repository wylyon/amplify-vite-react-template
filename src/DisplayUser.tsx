
// @ts-nocheck

export default function DisplayUser(props) {
  const handleOnSignOut = (e) => {
    props.onSubmitChange(false);
  };
  
  function createMarkup(dirty) {
	return { __html: dirty };
  }

  return (
      <div className="startProgram" dangerouslySetInnerHTML={createMarkup(props.renderContent)} />
  );
}
