// @ts-nocheck
import * as React from 'react';
import Button from '@mui/material/Button';

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
  const TYPE_BUTTON = 'button';
  const TYPE_CHECKBOX_MULTIPLE_DROPDOWN = 'checkbox_multiple_dropdown';
  const TYPE_CONTAINED_BUTTON_COLOR = 'contained_button_color';
  const TYPE_SWITCH = 'switch';
  const TYPE_TOGGLE_BUTTON = 'toggle_button';

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  function returnButtonNameColor (questionValueArr, questionSeq) {
    if (questionValueArr.length == 1) {
      // no color chosen
      return "<Button id=\"btn" + questionSeq + "\" name=\"btn" + questionSeq + "\">" + questionValueArr[0] + "</Button>";
    } else {
      // color first, then value
      return "<Button id=\"btn" + questionSeq + "\" name=\"btn" + questionSeq + "\" style=\"background-color:" + questionValueArr[0] + "\">" + 
        questionValueArr[1] + "</Button>";
    }
  }

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
          "<input type=\"file\" id=\"photo" + questionSeq + "\" name=\"photo" + questionSeq + "\" capture=\"camera\" >";
      case TYPE_DROPDOWN:
        return "<select id=\"dd" + questionSeq + "\" name=\"dd" + questionSeq + "\">" +
        returnDropDownRadioValues(questionValueArr, true, "") +
          "</select>";
      case TYPE_MULTIPLE_DROPDOWN:
        return "<select id=\"md" + questionSeq + "\" size=\"4\" multiple name=\"md" + questionSeq + "\">" +
        returnDropDownRadioValues(questionValueArr, true, "") +
          "</select>";
      case TYPE_RADIO:
        return returnDropDownRadioValues(questionValueArr, false, questionSeq);
      case TYPE_INPUT:
        return "<input type=\"text\" id=\"input" + questionSeq + "\" name=\"input" + questionSeq + "\">";
      case TYPE_TEXT:
        return "<textarea name=\"text" + questionSeq + "\" rows=\"5\" cols=\"20\">" + questionValues +
          "</textarea>";
      case TYPE_DATE:
        return "<input type=\"date\" id=\"date" + questionSeq + "\" name=\"date" + questionSeq + "\">";
      case TYPE_BUTTON:
        return "<button type=\"button\" id=\"btn" + questionSeq + "\" name=\"btn" + questionSeq + "\">" + questionValues + "</button>";
      case TYPE_CONTAINED_BUTTON_COLOR:
        return returnButtonNameColor(questionValueArr, questionSeq);
      case TYPE_SWITCH:
        return "<label class=\"switch\"><input type=\"checkbox\"><span class=\"slider round\"></span></label>";
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
