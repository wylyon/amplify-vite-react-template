
// @ts-nocheck
import * as React from "react";
import { useState, useEffect } from "react";

export default function DisplayAttributes(props) {
  const [numberLinesBefore, setNumberLinesBefore] = useState(0);

  const handleParsingTabsLines = (html) => {
    if (html == null || html == '') {
      return;
    }
    const lineArr = html.split("<br>");
    var numLinesBefore = 0;
    var numTabBefore = 0;
    var filteredValue = '';

    for (var i = 0; i < lineArr.length; i++) {
      if (lineArr[i] == null || lineArr[i] == '') {
        numLinesBefore = numLinesBefore + 1;
      } else {
        filteredValue = lineArr[i];
      }
    }

    const tabArr = filteredValue.split("&emsp;");
    for (var i = 0; i < tabArr.length; i++) {
      if (tabArr[i] == null || tabArr[i] == '') {
        numTabBefore = numTabBefore + 1;
      } else {
        filteredValue = tabArr[i];
      }
    }

    props.onParsing(filteredValue, numTabBefore);
    setNumberLinesBefore(numLinesBefore);
  }

  useEffect(() => {
    handleParsingTabsLines(props.props.preLoadAttributes)
	});

  return (
    <div>
      { numberLinesBefore > 5 ? 
        <><br /><br /><br /><br /><br /></> : 
        numberLinesBefore == 4 ?
        <><br /><br /><br /><br /></> : 
        numberLinesBefore == 3 ?
        <><br /><br /><br /></> : 
        numberLinesBefore == 2 ?
        <><br /><br /></> : 
        numberLinesBefore == 1 ?
        <br /> : null
      }
    </div>
  );
}