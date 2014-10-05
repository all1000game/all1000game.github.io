// all1000-browser.js http://all1000.com/

var all1000 = new All1000();


document.write('<pre id="title">all1000 v' + All1000.VERSION + ' #' + All1000.seed  + '\na-z - set worker, A-Z - remove worker, 0-9 - research</pre>');
document.write('<pre id="screen"></pre>');

var displayScreen = function () {
  document.getElementById("screen").innerHTML = all1000.getDisplayText().replace(/\{(#.{6})-fg\}(.*?)\{\/\1-fg\}/g, function (str, p1, p2) {
    return '<span style="color: ' + p1 + '">' + p2 + '</span>';
  });
};

document.body.onkeypress = function (e) {
  all1000.inputKey(String.fromCharCode(e.charCode));
  displayScreen();
};

var timer = setInterval(function () {
  if (all1000.next()) {
    clearInterval(timer);
  }
  displayScreen();
}, 725);

displayScreen();
