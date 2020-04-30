function isLocalStorageAvailable() {
  try {
    // https://stackoverflow.com/questions/32374875/localstorage-not-working-in-edge
    // Local Storage didn't work for local files in IE9, so I imagine that this is still the case in MS Edge.
    localStorage.getItem('__CHECK_IF_ACCESSIBLE__');
    return true;
  } catch (e) {
    return false;
  }
}

// https://stackoverflow.com/questions/32374875/localstorage-not-working-in-edge
function detectIE() {
  if (!window || !window.navigator || !window.navigator.userAgent) {
    return false;
  }

  var ua = window.navigator.userAgent;

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    if (process.env.VUE_APP_DEBUG_MODE && console) console.log('IE detected!');
    // IE 10 or older => return version number
    return true;
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    if (process.env.VUE_APP_DEBUG_MODE && console) console.log('IE detected!');
    // IE 11 => return version number
    return true;
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    if (process.env.VUE_APP_DEBUG_MODE && console) console.log('IE detected!');
    // Edge (IE 12+) => return version number
    return true;
  }

  // other browser
  return false;
}

// On ne peut pas utiliser l'objet global "localStorage" lorsqu'IE (ou Edge)
// travaille avec des fichiers locaux accédés via le protocole "file:"
// https://www.quirksmode.org/js/cookies.html
// https://stackoverflow.com/questions/7551113/how-do-i-set-path-while-saving-a-cookie-value-in-javascript
// https://www.tutorialrepublic.com/javascript-tutorial/javascript-cookies.php
var storageObject =
  !isLocalStorageAvailable() && detectIE()
    ? {
        setItem(name, value, days = 0) {
          var expires = '';
          if (days) {
            var date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + date.toUTCString();
          }
          document.cookie =
            name +
            '=' +
            // check if value is null or undefined:
            encodeURIComponent(value == null ? '' : value) +
            expires +
            '; path=/';
        },

        removeItem(name) {
          this.setItem(name, '', -1);
        },
        getItem(name) {
          var nameEQ = name + '=';
          var ca = document.cookie.split(';');
          for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) {
              try {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
              } catch (e) {
                if (console) console.error(e);
                return null;
              }
            }
          }
          return null;
        }
      }
    : localStorage;

export { detectIE };
export default storageObject;
