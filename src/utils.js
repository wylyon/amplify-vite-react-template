export function getStates () {
  return [
     'AL', 'AK', 'AZ', 'AR', 'AS', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
      'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP',
      'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'TT', 'UT', 'VT', 'VA', 'VI', 'WA', 'WV', 'WI', 'WY'
  ]
}

export function clearState() {
  var cookies = document.cookie.split("; ");
  for (var c = 0; c < cookies.length; c++) {
      var d = window.location.hostname.split(".");
      while (d.length > 0) {
          var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
          var p = location.pathname.split('/');
          document.cookie = cookieBase + '/';
          while (p.length > 0) {
              document.cookie = cookieBase + p.join('/');
              p.pop();
          };
          d.shift();
      }
  }
}

function trimLeadingSpacesInArray(arr) {
  return arr.map(str => {
    if (typeof str === 'string') {
      return str.trimStart();
    }
  })
}

export function cleanUpTextArray(arr) {
  // filter out leading spaces and empty rows
  var newArr = [];
  for (var indx = 0; indx < arr.length; indx++) {
    if (arr[indx] != "") {
      newArr.push(arr[indx]);
    }
  }
  return trimLeadingSpacesInArray(newArr);
}

export function countNumOfTabs(text) {
  if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
    if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
      if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
        if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
          if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
            if (text.indexOf("&emsp;&emsp;&emsp;&emsp;&emsp;") < 0) {
              if (text.indexOf("&emsp;&emsp;&emsp;&emsp;") < 0) {
                if (text.indexOf("&emsp;&emsp;&emsp;") < 0) {
                  if (text.indexOf("&emsp;&emsp;") < 0) {
                    if (text.indexOf("&emsp;") < 0) {
                      return 0;
                    } else {
                      return 1;
                    }
                  } else {
                    return 2;
                  }
                } else {
                  return 3;
                }
              } else {
                return 4;
              }
            } else {
              return 5;
            }
          } else {
            return 6;
          }
        } else {
          return 7;
        }
      } else {
        return 8;
      }
    } else {
      return 9;
    }
  } else {
    return 10;
  }
}

export function setTitle (proposedTitle, arrayOfValues) {
  var newTitle = proposedTitle;
  var didSetTitle = false;
  for (var indx = 0; indx < arrayOfValues.length; indx++) {
    const searchTitle = (indx == 0 ? proposedTitle : (proposedTitle + "-" + indx));
    const item = arrayOfValues.find(comp => comp.title == searchTitle);
    if (!item) {
      didSetTitle = true;
      newTitle = searchTitle;
      indx = arrayOfValues.length;
    }
  }
  if (!didSetTitle && arrayOfValues.length > 0) {
    newTitle = newTitle + "-" + arrayOfValues.length;
  }
  return newTitle;
}

export function setLabel (proposedLabel, arrayOfValues) {
  var newLabel = proposedLabel;
  for (var indx = 0; indx < arrayOfValues.length; indx++) {
    const searchLabel = (indx == 0 ? proposedLabel : (proposedLabel + "-" + indx));
    const item = arrayOfValues.find(comp => comp.title == searchLabel);
    if (!item) {
      newLabel = searchLabel;
      indx = arrayOfValues.length;
    }
  }
  return newLabel;
}