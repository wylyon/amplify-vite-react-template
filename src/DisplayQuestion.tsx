
// @ts-nocheck

export default function DisplayQuestion(props) {
  const handleOnSignOut = (e) => {
    props.onSubmitChange(false);
  };
  const TYPE_PHOTO = 'photo';
  const TYPE_DROPDOWN = 'dropdown';
  const TYPE_MULTIPLE_DROPDOWN = 'multiple_dropdown';
  const TYPE_RADIO = 'radiobox';
  const TYPE_INPUT = 'input';
  const TYPE_TEXT = 'text';
  const TYPE_DATE = 'datepicker';

  function returnDropDownRadioValues (questionValueArr, isDropDown, name) {
    var htmlSelect = '';
    for (var i = 0; i < questionValueArr.length; i++) {
      const questionVal = questionValueArr[i];
      const questionValArr = questionVal.split(' ');
      var questionValNoSpaces = '';
      // replace space with underscore
      for (var j = 0; j < questionValArr.length; j++) {
        if (j > 0) {
          questionValNoSpaces = questionValNoSpaces + "_";
        }
        questionValNoSpaces = questionValNoSpaces + questionValArr[j];
      }
      if (isDropDown) {
        htmlSelect = htmlSelect + "<option value=\"" + questionValNoSpaces + "\">" + questionVal + "</option>";
      } else {
        htmlSelect = htmlSelect + "<input type=\"radio\" id=\"" + questionValNoSpaces + 
          "\" name=\"" + name + "\" value=\"" + questionValNoSpaces + "\"> " + questionVal + "<br>";
      }      
    }
    return htmlSelect;
  }

  function getHTMLforType (questionType, questionSeq, questionValues, isPreview) {
    const questionValueFiltered = (questionValues == null || questionValues == '') ? '' : questionValues;
    const questionValueArr = questionValueFiltered.split("|");
    switch (questionType) {
      case TYPE_PHOTO:
        return (isPreview) ? "<img src=\"https://images.unsplash.com/photo-1533827432537-70133748f5c8\" " +
          "alt=\"My Picture.\" style=\"width:100px;height:100px;\">" :
          "<input type=\"file\" id=\"photo" + questionSeq + "\" capture=\"camera\" >";
      case TYPE_DROPDOWN:
        return "<select id=\"dd" + questionSeq + "\" >" +
        returnDropDownRadioValues(questionValueArr, true, "") +
          "</select>";
      case TYPE_MULTIPLE_DROPDOWN:
        return "<select id=\"dd" + questionSeq + "\" size=\"4\" multiple>" +
        returnDropDownRadioValues(questionValueArr, true, "") +
          "</select>";
      case TYPE_RADIO:
        return returnDropDownRadioValues(questionValueArr, false, questionSeq);
      case TYPE_INPUT:
        return "<input type=\"text\" id=\"" + questionSeq + "\" name=\"" + questionSeq + "\">";
      case TYPE_TEXT:
        return "<textarea name=\"" + questionSeq + "\" rows=\"5\" cols=\"20\">" + questionValues +
          "</textarea>";
      case TYPE_DATE:
        return "<input type=\"date\" id=\"" + questionSeq + "\" name=\"" + questionSeq + "\">";
      default:
        return ;
    }
  }

  function determineHTML(theQuestion, isPreview) {
    var html;
    if (theQuestion.pre_load_attributes != null && theQuestion.pre_load_attributes != '') {
      // we want to add any pre attributes for HTML
      html = ((isPreview) ? theQuestion.pre_load_attributes : 
        ("<label for=\"photo" + theQuestion.question_order + "\">" + theQuestion.pre_load_attributes + "</label>")) +
        getHTMLforType(theQuestion.question_type, theQuestion.question_order, theQuestion.question_values, isPreview) + 
        theQuestion.post_load_attributes;
    } else {
      html = getHTMLforType(theQuestion.question_type, theQuestion.question_order, theQuestion.question_values, isPreview) + 
        theQuestion.post_load_attributes;
    }
    return html;
  }

  function createMarkup(dirty) {
	return { __html: determineHTML(dirty,  props.isPreview) };
  }

  return (
      <div key="props.question.title" dangerouslySetInnerHTML={createMarkup(props.question)} />
  );
}
