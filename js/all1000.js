// all1000.js http://all1000.com/

var All1000 = function () {
  this.turn = 0;
  this.worker = this.workerAll = 10;
  this.workerMax = 100;
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
  "z": "#000000",
  "0": "#cccccc",
  "1": "#cc0000",
  "2": "#00cc00",
  "3": "#0000cc",
  "4": "#cc00cc",
  "5": "#cccc00",
  "6": "#00cccc",
  "7": "#cccccc",
  "8": "#cc0000",
  "9": "#00cc00"
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

All1000.raiseCostByCount = function (tech_tree_key) {
  for (var cost_key in tech_tree_key.cost) {
    var base_cost = tech_tree_key.cost[cost_key];
    base_cost /= tech_tree_key.count;
    tech_tree_key.cost[cost_key] = Math.round(base_cost * (tech_tree_key.count + 1));
  }
};
All1000.prototype.createTechTree = function () {
  var tech_tree = {};

  // generate crafting tech tree
  var a_0_diff = "a".charCodeAt(0) - "0".charCodeAt(0);
  All1000.ITEM_ORDER.forEach(function (key, order) {
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
    while (cost_time == 0 || max_cost_time * 5 <= cost_time) {
    //while (cost_time == 0) {
      cost_time = 0;
      cost = {};
      amount = 1234567890; // temporary: updated later
      var dep_num = order == 0 ? 0 : order < 10 ? 1 : order < 20 ? 2 : 3;
      for (var i = 0; i < dep_num; ++i) {
        cost_depends = false;
        while (!cost_depends || cost[cost_depends]) {
          cost_depends = All1000.ITEM_ORDER[Math.floor(All1000.seededRandom(order, Math.max( 0, order - dep_num - 1 )))];
        }
        if (cost_depends != key) {
          cost[cost_depends] = Math.floor(All1000.seededRandom((1 + order) * 1, 0)) * 2 + 1;
          cost_time += tech_tree[cost_depends]._costTime * cost[cost_depends];
          amount = -1;
        }
      }
      time = Math.floor(All1000.seededRandom((1 + order) * 2, 0)) + order;
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

  // generate possible amount
  var cost_tmp = {};
  All1000.ITEM_ORDER.concat().reverse().forEach(function (key, order) {
    var tech_tree_key = tech_tree[key];
    var num = 1000 + (cost_tmp[key] || 0);
    for (var cost_key in tech_tree_key.cost) {
      cost_tmp[cost_key] = (cost_tmp[cost_key] || 0);
      cost_tmp[cost_key] += tech_tree_key.cost[cost_key] * num;
    }
    if (tech_tree[key].amount != -1) {
      tech_tree[key].amount = num * 2; // add buffer
    }
  });

  var research = {
    "0": {
      "text": "Research next item (%d times).",
      "onResearch": function (tech_tree_key) {
        this.availableOrder = String.fromCharCode(this.availableOrder.charCodeAt(0) + 1);
        for (var cost_key in tech_tree_key.cost) {
          var base_cost = tech_tree_key.cost[cost_key];
          base_cost /= tech_tree_key.count;
          tech_tree_key.cost[String.fromCharCode(cost_key.charCodeAt(0) + 1)] = Math.round(base_cost * (tech_tree_key.count + 1));
          delete tech_tree_key.cost[cost_key];
        }
      },
      "isMax": function (tech_tree_key) {
        return this.availableOrder == "z";
      }
    },
    "1": {
      "text": "Increase workers by 5 (%d times).",
      "onResearch": function (tech_tree_key) {
        var increase = Math.min(5, this.workerMax - this.workerAll);
        this.worker += increase;
        this.workerAll += increase;
        All1000.raiseCostByCount(tech_tree_key);
      },
      "isMax": function (tech_tree_key) {
        return this.workerAll >= this.workerMax;
      }
    },
    "2": {
      "text": "Increase maximum workers by 100 (%d times).",
      "onResearch": function (tech_tree_key) {
        var increase = 100;
        this.workerMax += increase;
        All1000.raiseCostByCount(tech_tree_key);
      }
    },
    //"2": {
    //  "text": "Increase workers by 10 % (%d times).",
    //  "onResearch": function (tech_tree_key) {
    //    var increase = Math.min(Math.round(this.workerAll * 0.1), this.workerMax - this.workerAll);
    //    this.worker += increase;
    //    this.workerAll += increase;
    //    All1000.raiseCostByCount(tech_tree_key);
    //  }
    //},
    "3": {
      "text": "Increase items by %d % every 60 sec.",
      "onResearch": function (tech_tree_key) {
        All1000.raiseCostByCount(tech_tree_key);
      },
      "onTurn": function (tech_tree_key) {
        if (this.turn % 60 != 0) {
          return;
        }
        var count = tech_tree_key.count;
        var tech_tree = this.techTree;
        All1000.ITEM_ORDER.forEach(function (key) {
          if (tech_tree[key].count == 0) {
            return;
          }
          var increase = Math.round(tech_tree[key].count * (count / 100));
          tech_tree[key].count += increase;
        });
      }
    },
    "4": {
      "text": "Increase workers by %d every 60 sec.",
      "onResearch": function (tech_tree_key) {
        All1000.raiseCostByCount(tech_tree_key);
      },
      "onTurn": function (tech_tree_key) {
        if (this.turn % 60 != 0) {
          return;
        }
        var increase = Math.min(tech_tree_key.count, this.workerMax - this.workerAll);
        this.worker += increase;
        this.workerAll += increase;
      }
    },
    "5": {
      "text": "Set %d workers to the < 1000 item every 10 sec.",
      "onResearch": function (tech_tree_key) {
        All1000.raiseCostByCount(tech_tree_key);
      },
      "onTurn": function (tech_tree_key) {
        if (this.turn % 10 != 0 || this.worker == 0) {
          return;
        }
        var available_order = this.availableOrder;
        var tech_tree = this.techTree;
        var min_key = "a";
        All1000.ITEM_ORDER.concat().reverse().forEach(function (key) {
          if (key <= available_order && tech_tree[key].count < 1000) {
            min_key = key;
          }
        });
        var move = this.worker > tech_tree_key.count ? tech_tree_key.count : Math.max(this.worker, tech_tree_key.count);
        tech_tree[min_key].auto.count += move;
        this.worker -= move;
      }
    },
    "6": {
      "text": "Increase researched items by %d every 60 sec (TODO).",
      "onResearch": function (tech_tree_key) {
        All1000.raiseCostByCount(tech_tree_key);
      }
    },
    "7": {
      "text": "Research as much as possible every 10 - %d min (TODO).",
      "onResearch": function (tech_tree_key) {
        All1000.raiseCostByCount(tech_tree_key);
      }
    },
    "8": {
      "text": "Reduce all work times by 1 s (%d times) (TODO).",
      "onResearch": function (tech_tree_key) {
        All1000.raiseCostByCount(tech_tree_key);
      }
    },
    "9": {
      "text": "Reduce all costs by 10 % (%d times) (TODO).",
      "onResearch": function (tech_tree_key) {
        All1000.raiseCostByCount(tech_tree_key);
      }
    }
  };
  // generate research tech tree
  var key_to_resouce = function (key) { return String.fromCharCode(Math.ceil(key * 2.5) + "a".charCodeAt(0)); };
  All1000.RESEARCH_ORDER.forEach(function (key, order) {
    var cost, amount, time, max_cost_time = 0, max_val = 2, cost_time = 0;
    if (order <= 3) {
      max_cost_time += tech_tree[key_to_resouce(key)]._costTime;
      max_cost_time += order + 1;
    } else if (order <= 6) {
      max_cost_time += tech_tree[key_to_resouce(key)]._costTime * 2;
      max_cost_time += order + 1;
    } else {
      max_cost_time += tech_tree[key_to_resouce(key)]._costTime * 3;
      max_cost_time += order + 1;
    }
    while (cost_time == 0 || max_cost_time * 200 <= cost_time) {
      cost_time = 0;
      cost = {};
      var dep_num = order <= 3 ? 1 : order <= 6 ? 2 : 3;
      for (var i = 0; i < dep_num; ++i) {
        cost_depends = false;
        while (!cost_depends || cost[cost_depends]) {
          cost_depends = All1000.ITEM_ORDER[Math.floor(All1000.seededRandom(Math.ceil(order * 2.5), Math.max( 0, Math.ceil(order * 2.5) - dep_num - 1 )))];
        }
        cost[cost_depends] = Math.floor(All1000.seededRandom((1 + Math.ceil(order * 2.5)) * 1, 0)) * 10 + 10;
        cost_time += tech_tree[cost_depends]._costTime * cost[cost_depends];
      }
    }

    tech_tree[key] = {
      "text": research[key].text,
      "cost": cost,
      "count": 0,
      "_costTime": cost_time,
      "onResearch": research[key].onResearch,
      "onTurn": research[key].onTurn,
      "isMax": research[key].isMax
    };
  });

  return tech_tree;
};

All1000.prototype.next = function () {
  ++this.turn;
  if (All1000.ITEM_ORDER.every(function (key) { return this.techTree[key].count >= 1 }, this)) {
    alert("win");
    return true;
  }
  this._resolveResearch();
  this._resolveAuto();
};

All1000.prototype._resolveResearch = function () {
  var tech_tree = this.techTree;
  All1000.RESEARCH_ORDER.forEach(function (key) {
    var tech_tree_key = tech_tree[key];
    if (0 < tech_tree_key.count && tech_tree_key.onTurn) {
      tech_tree_key.onTurn.call(this, tech_tree_key);
    }
  }, this);
};

All1000.prototype._resolveAuto = function () {
  var tech_tree = this.techTree;
  All1000.ITEM_ORDER.forEach(function (key) {
    var tech_tree_key = tech_tree[key];
    if (tech_tree_key.autoNow) {
      --tech_tree_key.autoNow.time;
      if (tech_tree_key.autoNow.time == 0) {
        tech_tree_key.count += tech_tree_key.autoNow.count;
        tech_tree_key.autoNow = "";

      }
    }
    if (!tech_tree_key.autoNow && tech_tree_key.auto.count > 0) {
      var cost_ok = 0;
      for (var i = 0; i < tech_tree_key.auto.count; ++i) {
        if (this.payItemsFromKey(key)) {
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

All1000.prototype.payItemsFromKey = function (key) {
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
  All1000.ITEM_ORDER.forEach(function (key) {
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
  All1000.RESEARCH_ORDER.forEach(function (key) {
    var tech_tree_key = tech_tree[key];
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
  });
};

All1000.stripTags = function (str) {
  return str.replace(/\{\/?.{7}-fg\}/g, "");
};

All1000.prototype._updateCostString = function () {
  var tech_tree = this.techTree;
  var max_cost_length = 0;
  All1000.ITEM_ORDER.forEach(function (key) {
    var tech_tree_key = tech_tree[key];
    max_cost_length = Math.max(max_cost_length, All1000.stripTags(All1000.cost2string(tech_tree_key.cost)).length);
  });

  All1000.ITEM_ORDER.forEach(function (key) {
    var tech_tree_key = tech_tree[key];
    tech_tree_key.costString = All1000.cost2string(tech_tree_key.cost, max_cost_length);
  });

  tech_tree._blankCostString = tech_tree.a.costString.split("").map(function () { return " "; }).join("");

  max_cost_length = 0;
  var max_text_length = 0;
  All1000.RESEARCH_ORDER.forEach(function (key) {
    var tech_tree_key = tech_tree[key];
    max_cost_length = Math.max(
      max_cost_length,
      All1000.stripTags(All1000.cost2string(tech_tree_key.cost)).length
    );
    max_text_length = Math.max(
      max_text_length,
      tech_tree_key.text.replace("%d", tech_tree_key.count).length
    );
  });

  All1000.RESEARCH_ORDER.forEach(function (key) {
    var tech_tree_key = tech_tree[key];
    tech_tree_key.costString = All1000.cost2string(tech_tree_key.cost, max_cost_length);
    tech_tree_key.textString = All1000.text2string(
      tech_tree_key.text.replace("%d", "{" + All1000.colors[key] + "-fg}" + tech_tree_key.count + "{/" + All1000.colors[key] + "-fg}"
    ), max_text_length);
  });
};

All1000.costMul = function (cost, num) {
  var result = {};
  for (var cost_key in cost) {
    if (typeof cost[cost_key] == "number") {
      result[cost_key] = cost[cost_key] * num;
    }
  }
  return result;
};

All1000.cost2string = function (cost, max) {
  var str = JSON.stringify(cost).replace(/"/g, "").replace(/(\w):(\d+)/g, function (str, p1, p2) {
    return "{" + All1000.colors[p1] + "-fg}" + p1 + ":" + All1000.number2string(p2, true) + "{/" + All1000.colors[p1] + "-fg}";
  });
  for (var i = All1000.stripTags(str).length; i < max; ++i) {
    str += " ";
  }
  return str;
};

All1000.text2string = function (before, max) {
  var str = before;
  for (var i = All1000.stripTags(before).length; i < max; ++i) {
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
  if (tmp >= 86400) {
    day = Math.floor(tmp / 86400);
    tmp -= day * 86400;
  }
  if (tmp >= 3600) {
    hour = Math.floor(tmp / 3600);
    tmp -= hour * 3600;
  }
  if (tmp >= 60) {
    min = Math.floor(tmp / 60);
    tmp -= min * 60;
  }
  sec = tmp;

  return (day < 100 ? (day < 10 ? "  " : " ") : "") + day + "d" + (hour < 10 ? " " : "") + hour + "h" + (min < 10 ? " " : "") + min + "m" + (sec < 10 ? " " : "") + sec + "s";
};

All1000.number2string = function (number, no_space) {
  var space1 = " ", space2 = "  ", space3 = "   ", space4 = "    ";
  if (no_space) {
    space1 = space2 = space3 = space4 = "";
  }
  if (number < 10) {
    return space4 + number;
  } else if (number < 100) {
    return space3 + number;
  } else if (number < 1000) {
    return space2 + number;
  } else if (number < 10000) {
    return String(Math.floor(number / 10)).replace(/(\d)/, "$1.") + "K";
  } else if (number < 100000) {
    return String(Math.floor(number / 100)).replace(/(\d{2})/, "$1.") + "K";
  } else if (number < 1000000) {
    return space1 + Math.floor(number / 1000) + "K";
  } else if (number < 10000000) {
    return String(Math.floor(number / 10000)).replace(/(\d)/, "$1.") + "M";
  } else if (number < 100000000) {
    return String(Math.floor(number / 100000)).replace(/(\d{2})/, "$1.") + "M";
  } else if (number < 1000000000) {
    return space1 + Math.floor(number / 1000000) + "M";
  } else if (number < 10000000000) {
    return String(Math.floor(number / 10000000)).replace(/(\d)/, "$1.") + "G";
  } else if (number < 100000000000) {
    return String(Math.floor(number / 100000000)).replace(/(\d{2})/, "$1.") + "G";
  } else if (number < 1000000000000) {
    return space1 + Math.floor(number / 1000000000) + "G";
  } else if (number < 10000000000000) {
    return String(Math.floor(number / 10000000000)).replace(/(\d)/, "$1.") + "T";
  } else if (number < 100000000000000) {
    return String(Math.floor(number / 100000000000)).replace(/(\d{2})/, "$1.") + "T";
  } else if (number < 1000000000000000) {
    return space1 + Math.floor(number / 1000000000000) + "T";
  } else if (number < 10000000000000000) {
    return String(Math.floor(number / 10000000000000)).replace(/(\d)/, "$1.") + "P";
  } else if (number < 100000000000000000) {
    return String(Math.floor(number / 100000000000000)).replace(/(\d{2})/, "$1.") + "P";
  } else if (number < 1000000000000000000) {
    return space1 + Math.floor(number / 1000000000000000) + "P";
  }
  return Math.floor(number / 1000000000000000) + "P";
};

All1000.IS_AUTOMATE = /^[a-z]$/;
All1000.IS_AUTOMATE_SELL = /^[A-Z]$/;
All1000.IS_RESEARCH = /^[0-9]$/;
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

  // 0-9
  } else if (match = All1000.IS_RESEARCH.exec(input_str)) {
    var key = match[0];
    var tech_tree_key = this.techTree[key];
    if (tech_tree_key.isMax && tech_tree_key.isMax.call(this, tech_tree_key)) {
      // nothing
    } else if (this.payItemsFromKey(key)) {
      ++tech_tree_key.count;
      tech_tree_key.onResearch.call(this, tech_tree_key);
      this._updateCostString();
    }
  }
};

All1000.ITEM_ORDER = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
];

All1000.RESEARCH_ORDER = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
];

All1000.prototype.getDisplayText = function () {
  this._updateTechTreeAvailable();
  var result = All1000.time2string2(this.turn) + "\n"
    + "@ " + All1000.number2string(this.worker) + "(" + All1000.number2string(this.workerAll) + ")/" + All1000.number2string(this.workerMax) + "\n";
  var tech_tree = this.techTree;
  var available = true;
  var available_order = this.availableOrder;
  All1000.ITEM_ORDER.forEach(function (key, order) {
    var tech_tree_key = tech_tree[key];
    if (!available) {
      result +=  "{" + All1000.colors[key] + "-fg}" + key + "{/" + All1000.colors[key] + "-fg}"
        + "                           " + tech_tree._blankCostString+ "|";
    } else {
      if (available_order == key) {
        available = false;
      }
      result += "{" + All1000.colors[key] + "-fg}" + key + " " + All1000.number2string(tech_tree_key.count) + "{/" + All1000.colors[key] + "-fg}"
        + "(" + All1000.number2string(tech_tree_key.available) + ")+"
        + All1000.number2string(tech_tree_key.auto.count) + "/"
        + All1000.time2string(tech_tree_key.autoNow ? tech_tree_key.autoNow.time : tech_tree_key.time) + "/"
        + All1000.time2string(tech_tree_key.time) + tech_tree_key.costString
        //+ All1000.time2string2(tech_tree_key._costTime)
        + "|";
    }
    if (order < 10) {
      var reserch_num = order;
      result += "{" + All1000.colors[reserch_num] + "-fg}" + reserch_num + "{/" + All1000.colors[reserch_num] + "-fg} "
        + tech_tree[reserch_num].textString + tech_tree[reserch_num].costString;
    }
    result += "\n";
  });
  return result;
};

// for node.js, not for CommonJS
if (typeof module === "object" && module) {
  module.exports = All1000;
}
