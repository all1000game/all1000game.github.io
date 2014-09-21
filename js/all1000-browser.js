// all1000-browser.js http://all1000.com/

All1000.prototype.displayScreen = function () {
  document.getElementById("screen").innerHTML = all1000.getDisplayText().replace(/\{(#.{6})-fg\}(.*?)\{\/\1-fg\}/g, function (str, p1, p2) {
    return '<span style="color: ' + p1 + '">' + p2 + '</span>';
  });
};

var all1000 = new All1000();

document.write('<pre id="title">all1000 v' + All1000.VERSION + ' #' + All1000.seed  + '\na-z - ++add worker, A-Z - ++remove worker</pre>');
document.write('<pre id="screen"></pre>');

document.body.onkeypress = function (e) {
  all1000.inputKey(String.fromCharCode(e.charCode));
  all1000.displayScreen();
};

var timer = window.setInterval(function () {
  if (all1000.next()) {
    window.clearInterval(timer);
  }
  all1000.displayScreen();
}, 250);
//}, 725);

all1000.displayScreen();
