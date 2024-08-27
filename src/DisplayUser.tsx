
// @ts-nocheck

export default function DisableMode(props) {
  const handleOnSignOut = (e) => {
    props.onSubmitChange(false);
  };
  
  function createMarkup(dirty) {
	return { __html: dirty };
  }

  return (
      <div dangerouslySetInnerHTML={createMarkup(props.renderContent)} />
  );
}
