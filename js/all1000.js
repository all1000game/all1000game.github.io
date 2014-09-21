// all1000.js http://all1000.com/

var All1000 = function () {
  this.turn = 0;
  this.worker = 0;
  this.techTree = this.createTechTree();

  this.history = "";
  this.availableOrder = "a";
  this._updateCostString();
};

All1000.VERSION = "0.0.1";

All1000.colors = {
  "a": "#cc0000",
  "b": "#00cc00",
  "c": "#0000cc",
  "d": "#cc00cc",
  "e": "#cccc00",
  "f": "#00cccc",
  "g": "#cccccc",
  "h": "#cc0000",
  "i": "#00cc00",
  "j": "#0000cc",
  "k": "#cc00cc",
  "l": "#cccc00",
  "m": "#00cccc",
  "n": "#cccccc",
  "o": "#cc0000",
  "p": "#00cc00",
  "q": "#0000cc",
  "r": "#cc00cc",
  "s": "#cccc00",
  "t": "#00cccc",
  "u": "#cccccc",
  "v": "#cc0000",
  "w": "#00cc00",
  "x": "#0000cc",
  "y": "#cc00cc",
  "z": "#000000"
};

// the initial seed
All1000.seed = Math.floor(Math.random() * 10000);
 
// in order to work 'All1000.seed' must NOT be undefined,
// so in any case, you HAVE to provide a Math.seed
// http://indiegamr.com/generate-repeatable-random-numbers-in-js/
All1000.seededRandom = function(max, min) {
  max = max || 1;
  min = min || 0;

  All1000.seed = (All1000.seed * 9301 + 49297) % 233280;
  var rnd = All1000.seed / 233280;

  return min + rnd * (max - min);
};

All1000.prototype.createTechTree = function () {
  var tech_tree = {};
  All1000.DISP_ORDER.forEach(function (key, order) {
    var cost, amount, time, max_cost_time = 0, max_val = 2, cost_time = 0;
    if (order == 0) {
      max_cost_time += 100;
    } else if (order < 10) {
      max_cost_time += tech_tree[String.fromCharCode(key.charCodeAt(0) - 1)]._costTime;
      max_cost_time += order + 1;
    } else if (order < 20) {
      max_cost_time += tech_tree[String.fromCharCode(key.charCodeAt(0) - 1)]._costTime;
      max_cost_time += tech_tree[String.fromCharCode(key.charCodeAt(0) - 2)]._costTime;
      max_cost_time += order + 1;
    } else {
      max_cost_time += tech_tree[String.fromCharCode(key.charCodeAt(0) - 1)]._costTime;
      max_cost_time += tech_tree[String.fromCharCode(key.charCodeAt(0) - 2)]._costTime;
      max_cost_time += tech_tree[String.fromCharCode(key.charCodeAt(0) - 3)]._costTime;
      max_cost_time += order + 1;
    }
    while (cost_time == 0 || max_cost_time <= cost_time) {
      cost_time = 0;
      cost = {};
      amount = 1234567890; // temporary: updated later
      var dep_num = order == 0 ? 0 : order < 10 ? 1 : order < 20 ? 2 : 3;
      for (var i = 0; i < dep_num; ++i) {
        cost_depends = false;
        while (!cost_depends || cost[cost_depends]) {
          cost_depends = All1000.DISP_ORDER[Math.floor(All1000.seededRandom(order, Math.max( 0, order - 5 )))];
        }
        if (cost_depends != key) {
          cost[cost_depends] = Math.floor(All1000.seededRandom((1 + order) * 1, 0)) + 1;
          cost_time += tech_tree[cost_depends]._costTime * cost[cost_depends];
          amount = -1;
        }
      }
      time = Math.floor(All1000.seededRandom((1 + order) * 1, 0)) + 1;
      cost_time += time;
    }

    tech_tree[key] = {
      "cost": cost,
      "count": 0,
      "amount": amount,
      "auto": {
        "count": 0
      },
      "time": time,
      "_costTime": cost_time
    };
  });

  var cost_tmp = {};
  All1000.DISP_ORDER.concat().reverse().forEach(function (key, order) {
    var tech_tree_key = tech_tree[key];
    var num = 1000 + (cost_tmp[key] || 0);
    for (var cost_key in tech_tree_key.cost) {
      cost_tmp[cost_key] = (cost_tmp[cost_key] || 0);
      cost_tmp[cost_key] += tech_tree_key.cost[cost_key] * num;
    }
    if (tech_tree[key].amount != -1) {
      tech_tree[key].amount = num * 2;
    }
  });
  return tech_tree;
};


All1000.prototype.next = function () {
  if (All1000.DISP_ORDER.every(function (key) { return this.techTree[key].count >= 1 }, this)) {
    alert("win");
    return true;
  }
  if (++this.turn % 10 == 1) {
    ++this.worker;
  }
  this._resolveAuto();
};

All1000.prototype._resolveAuto = function () {
  var tech_tree = this.techTree;
  All1000.DISP_ORDER.forEach(function (key) {
    var tech_tree_key = tech_tree[key];
    if (tech_tree_key.autoNow) {
      --tech_tree_key.autoNow.time;
      if (tech_tree_key.autoNow.time == 0) {
        tech_tree_key.count += tech_tree_key.autoNow.count;
        tech_tree_key.autoNow = "";
        if (this.availableOrder.charCodeAt(0) < key.charCodeAt(0) + 1) {
          this.availableOrder = String.fromCharCode(key.charCodeAt(0) + 1);
        }
      }
    }
    if (!tech_tree_key.autoNow && tech_tree_key.auto.count > 0) {
      var cost_ok = 0;
      for (var i = 0; i < tech_tree_key.auto.count; ++i) {
        if (this.payResourcesFromKey(key)) {
          ++cost_ok;
        } else {
          break;
        }
      }
      if (cost_ok > 0) {
        tech_tree_key.autoNow = {
          time: tech_tree_key.time,
          count: cost_ok
        };
      }
    }
  }, this);
};

All1000.prototype.payResourcesFromKey = function (key) {
  this._updateTechTreeAvailable();
  // a-z
  var tech_tree = this.techTree;
  var tech_tree_key = tech_tree[key];
  if (tech_tree_key.available == 0) {
    return "";
  }
  var result = "";
  for (var cost_key in tech_tree_key.cost) {
    tech_tree[cost_key].count -= tech_tree_key.cost[cost_key];
  }
  if (tech_tree_key.amount != -1) {
    --tech_tree_key.amount;
  }
  return key;
};

All1000.prototype._updateTechTreeAvailable = function () {
  var tech_tree = this.techTree;
  All1000.DISP_ORDER.forEach(function (key) {
    var tech_tree_key = tech_tree[key];
    if (tech_tree_key.amount == 0) {
      tech_tree_key.available = 0;
    } else {
      var cost = tech_tree_key.cost;
      var minimum = tech_tree_key.amount == -1 ? Number.MAX_VALUE : tech_tree_key.amount;
      for (var cost_key in cost) {
        if (tech_tree[cost_key].count < cost[cost_key]) {
          minimum = 0;
          break;
        } else {
          minimum = Math.min( minimum, Math.floor(tech_tree[cost_key].count / cost[cost_key]) );
        }
      }
      tech_tree_key.available = minimum;
    }
  });
};

All1000.stripTags = function (str) {
  return str.replace(/\{\/?.{7}-fg\}/g, "");
};

All1000.prototype._updateCostString = function () {
  var tech_tree = this.techTree;
  var max_cost_length = 0;
  All1000.DISP_ORDER.forEach(function (key) {
    var tech_tree_key = tech_tree[key];
    max_cost_length = Math.max(max_cost_length, All1000.stripTags(All1000.cost2string(tech_tree_key.cost)).length);
  });

  All1000.DISP_ORDER.forEach(function (key) {
    var tech_tree_key = tech_tree[key];
    tech_tree_key.costString = All1000.cost2string(tech_tree_key.cost, max_cost_length);
  });
};

All1000.cost2string = function (cost, max) {
  var str = JSON.stringify(cost).replace(/"/g, "").replace(/(\w):(\d+)/g, function (str, p1, p2) {
    return "{" + All1000.colors[p1] + "-fg}" + p1 + ":" + p2 + "{/" + All1000.colors[p1] + "-fg}";
  });
  for (var i = All1000.stripTags(str).length; i < max; ++i) {
    str += " ";
  }
  return str;
};

All1000.time2string = function (time) {
  if (time < 10) {
    return " " + time + "s";
  }
  return time + "s";
};

All1000.time2string2 = function (time) {
  var day = 0, hour = 0, min = 0, sec = 0;
  var tmp = time;
  while (tmp >= 86400) {
    tmp -= 86400;
    ++day;
  }
  while (tmp >= 3600) {
    tmp -= 3600;
    ++hour;
  }
  while (tmp >= 60) {
    tmp -= 60;
    ++min;
  }
  sec = tmp;

  return (day < 100 ? (day < 10 ? "  " : " ") : "") + day + "d" + (hour < 10 ? " " : "") + hour + "h" + (min < 10 ? " " : "") + min + "m" + (sec < 10 ? " " : "") + sec + "s";
};

All1000.number2string = function (number) {
  if (number < 10) {
    return "   " + number;
  } else if (number < 100) {
    return "  " + number;
  } else if (number < 1000) {
    return " " + number;
  } else if (number < 10000) {
    return number;
  } else if (number < 100000) {
    return " " + Math.floor(number / 1000) + "K";
  } else if (number < 1000000) {
    return Math.floor(number / 1000) + "K";
  } else if (number < 10000000) {
    return String(Math.floor(number / 100000)).replace(/(\d)/, "$1.") + "M";
  } else if (number < 100000000) {
    return " " + Math.floor(number / 1000000) + "M";
  } else if (number < 1000000000) {
    return Math.floor(number / 1000000) + "M";
  } else if (number < 10000000000) {
    return String(Math.floor(number / 100000000)).replace(/(\d)/, "$1.") + "G";
  } else if (number < 100000000000) {
    return " " + Math.floor(number / 1000000000) + "G";
  } else if (number < 1000000000000) {
    return Math.floor(number / 1000000000) + "G";
  } else if (number < 10000000000000) {
    return String(Math.floor(number / 100000000000)).replace(/(\d)/, "$1.") + "T";
  } else if (number < 100000000000000) {
    return " " + Math.floor(number / 1000000000000) + "T";
  } else if (number < 1000000000000000) {
    return Math.floor(number / 1000000000000) + "T";
  } else if (number < 10000000000000000) {
    return String(Math.floor(number / 100000000000000)).replace(/(\d)/, "$1.") + "P";
  } else if (number < 100000000000000000) {
    return " " + Math.floor(number / 1000000000000000) + "P";
  }
  return Math.floor(number / 1000000000000000) + "P";
};



All1000.IS_AUTOMATE = /^[a-z]$/;
All1000.IS_AUTOMATE_SELL = /^[A-Z]$/;
All1000.prototype.inputKey = function (input_str) {
  var match;
  // a-z
  if (match = All1000.IS_AUTOMATE.exec(input_str)) {
    var key = match[0];
    if (key <= this.availableOrder && this.worker > 0) {
      ++this.techTree[key].auto.count;
      --this.worker;
    }

  // A-Z
  } else if (match = All1000.IS_AUTOMATE_SELL.exec(input_str)) {
    var key = match[0];
    var tech_tree_key = this.techTree[key.toLowerCase()];
    if (tech_tree_key.auto.count > 0) {
      --tech_tree_key.auto.count;
      ++this.worker;
    }
  }
};

All1000.DISP_ORDER = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
];

All1000.prototype.getDisplayText = function () {
  this._updateTechTreeAvailable();
  var result = "@ " + All1000.number2string(this.worker) + "/" + All1000.time2string2(this.turn) + "\n";
  var tech_tree = this.techTree;
  var available = true;
  var available_order = this.availableOrder;
  All1000.DISP_ORDER.forEach(function (key, order) {
    var tech_tree_key = tech_tree[key];
    if (!available) {
      return;
    } else if (available_order == key) {
      available = false;
    }
    result += "{" + All1000.colors[key] + "-fg}" + key + " " + All1000.number2string(tech_tree_key.count) + "{/" + All1000.colors[key] + "-fg}"
      + "(" + All1000.number2string(tech_tree_key.available) + ")+"
      + All1000.number2string(tech_tree_key.auto.count) + "/"
      + All1000.time2string(tech_tree_key.autoNow ? tech_tree_key.autoNow.time : tech_tree_key.time) + "/"
      + All1000.time2string(tech_tree_key.time) + tech_tree_key.costString + All1000.time2string2(tech_tree_key._costTime)
      + "|";
    if (order < 10) {
      result += order + " " + All1000.number2string(tech_tree_key.count) + tech_tree_key.costString + "|";
    }
    result += "\n";
  });
  return result;
};

// for node.js, not for CommonJS
if (typeof module === "object" && module) {
  module.exports = All1000;
}
