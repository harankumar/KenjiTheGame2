/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*********************************
 * Variables
 *********************************/
// All units in KMS system unless otherwise noted

// Misc Game Mechanics
var COLLPCT = 0.8;
var paused = false;
var gameover = false;
var started = false;
var FIELD_AMT = 20;
var prevTime = Date.now();
var g = -9.8;
var time_elapsed = 0;
var overlaycolor = "#CCC";
var t = 0;
var points = 0;

// Kenji Physics
var m = 25;
var q = 25;
var x = 100;
var y = 500;
var r = 50;

var v_x = 0;
var v_y = 50;

var a_x = 0;

var p_x = 0;
var p_y = 0;

var f_y = -9.8 * m;

var ke_x = 0;
var ke_y = 0;

// Electric Field
var E = 0;

// Adityas
var v_x_aditya = -200;
var numInCol = 0;
var numCycles = 0;
var adityas = [];

// Wilkes
var wilkes = [];

/*********************************
 * Functions
 *********************************/

// Utilities
function round(num) {
    return Math.round(num * 100) / 100;
}
function sleep(millis) {
    var date = Date.now();
    var curDate = null;
    do {
        curDate = Date.now();
    } while (curDate - date < millis);
}

// Basic Canvas Manipulation
function makeCircle(x, y, r, fill, stroke, width) {
    var g = new createjs.Graphics();
    g.setStrokeStyle(width);
    g.beginStroke(stroke);
    g.beginFill(fill);
    g.drawCircle(0, 0, r);
    var s = new createjs.Shape(g);
    s.x = x;
    s.y = y;
    stage.addChild(s);
    stage.update();
}
function makeText(x, y, text, font, color) {
    var t = new createjs.Text(text, font, color);
    t.x = x;
    t.y = y;
    t.textAlign = "center";
    stage.addChild(t);
    stage.update();
}
function makeOverlay() {
    var g = new createjs.Graphics();
    g.setStrokeStyle(1);
    g.beginFill(overlaycolor);
    g.drawRect(0, 0, 1000, 1000);
    var s = new createjs.Shape(g);
    s.x = 0;
    s.y = 0;
    s.alpha = 0.5;
    stage.addChild(s);
    stage.update();

    if (gameover) {
        makeText(500, 350, "Game Over! \n Press F5 to Restart", "bold 50px" +
            " Arial", "#000");
    } else if (paused) {
        makeText(500, 350, "Press SPACE \nto Resume", "bold 50px Arial", "#000");
    } else if (!started)
        makeText(500, 350, "Welcome to Ideal Physics Land!\n" +
            "Press any key to begin", "bold 50px Arial", "#000");
}

// Keyboard Input
function addEventListeners() {
    document.addEventListener('keydown', function (e) {
        if (paused || gameover)
            return;
        if (e.keyCode == 38 || e.charCode == 38 || e.key == "ArrowUp")
            E = FIELD_AMT;
        if (e.keyCode == 40 || e.charCode == 40 || e.key == "ArrowDown")
            E = -FIELD_AMT;
    });
    document.addEventListener('keyup', function (e) {
        if (paused || gameover)
            return;
        if (e.keyCode == 38 || e.charCode == 38 || e.key == "ArrowUp")
            E = 0;
        if (e.keyCode == 40 || e.charCode == 40 || e.key == "ArrowDown")
            E = 0;
    });
    document.addEventListener('keypress', function (e) {
        if (e.keyCode == 32 || e.key == " " || e.charCode == 32) {
            if (!started) {
                started = true;
                createjs.Ticker.addEventListener("tick", runCycle);
                prevTime = Date.now();

            } else if (!gameover)
                togglePaused();
        }
    });
}
// Main Loop
function getDeltaT() {
    var currTime = Date.now();
    t = (currTime - prevTime) / 1000;
    prevTime = currTime;
    framerate = 1.0 / t;
    time_elapsed += t * 1000;
    points += t / 5;
}
function updateKenji() {
    f_y = q * E + m * g;
    a_y = f_y / m;
    v_y += a_y;
    y += v_y * t;
    p_y = m * v_y;
    ke_y = m * v_y * v_y * 0.5;
    pe_f = m * 9.8 * y;

    // Check for collision with walls
    // This is a pretty hacky approximation of a collision ¯\_(ツ)_/¯
    if (y - r <= 0) {
        v_y *= -1 * COLLPCT;
        y = r;
    }
    if (y + r >= 800) {
        v_y *= -1 * COLLPCT;
        y = 800 - r;
    }
}
function updateAdityas() {
    // move adityas
    numCycles++;
    v_x_aditya -= Math.sqrt(numCycles) * 0.0005;
    for (var i = 0; i < adityas.length; i++) {
        var a = adityas[i];
        if (adityas[i].x - 600 < v_x_aditya * t && adityas[i].inCol) {
            numInCol--;
            adityas[i].inCol = false;
        }
        a.x += v_x_aditya * t;
    }

}
function updateWilkes() {
    numCycles++;
    v_x_aditya += Math.sqrt(numCycles) * 0.0005;
    for (var i = 0; i < wilkes.length; i++) {
        var w = wilkes[i];
        w.x += v_x_aditya * t;
    }
}
function updateVarDisplay() {
    $('#E').text(round(E));
    $('#points').text(Math.floor(points));
    $('#fr').text(round(framerate));
    $('#t').text(round(time_elapsed / 1000));
    $('#x').text(round(x));
    $('#y').text(round(y));
    $('#mass').text(round(m));
    $('#radius').text(round(r));
    //$('#xvelocity').text(round(v_x));
    $('#yvelocity').text(round(v_y));
    //$('#xmomentum').text(round(p_x));
    $('#ymomentum').text(round(p_y));
    //$('#xacceleration').text(round(a_x));
    $('#yacceleration').text(round(a_y));
    //$('#xforce').text(round(f_x));
    $('#yforce').text(round(f_y));
    $('#pe').text(round(pe_f / 1000000));
    //$('#xke').text(round(ke_x / 1000000));
    $('#yke').text(round(ke_y / 1000000));
    //$('#work').text(round(work / 1000000));
    //$('#totalwork').text(round(total_work / 1000000));
}
function drawScreen() {
    stage.removeAllChildren();
    stage.update();
    for (var i = 0; i < adityas.length; i++) {
        var a = adityas[i];
        makeCircle(a.x, 800 - a.y, a.r, "#8e3816", "#58220d", 5);
        var bm = new createjs.Bitmap("adicha.png");
        bm.alpha = 0.8;
        bm.x = a.x - a.r;
        bm.y = 800 - a.y - a.r;
        bm.scaleX = a.r / 100 * 2;
        bm.scaleY = a.r / 100 * 2;
        stage.addChild(bm);
        stage.update();
    }
    for (var i = 0; i < wilkes.length; i++) {
        var w = wilkes[i];
        makeCircle(w.x, 800 - w.y, w.r, "darkgreen", "green", 5);
        bm = new createjs.Bitmap("wilkerino.png");
        bm.alpha = 0.8;
        bm.x = w.x - w.r;
        bm.y = 800 - w.y - w.r;
        bm.scaleX = w.r / 100 * 2;
        bm.scaleY = w.r / 100 * 2;
        stage.addChild(bm);
        stage.update();
    }

    makeCircle(x, 800 - y, r, "#FFFF00", "#F0F000", 5);
    var bm = new createjs.Bitmap("kennyrino.png");
    bm.alpha = 0.8;
    bm.x = x - r;
    bm.y = 800 - y - r;
    bm.scaleX = r / 100 * 2;
    bm.scaleY = r / 100 * 2;
    stage.addChild(bm);
    stage.update();
}
function spawnAdityas() {
    var spawnPct = 0.005 * Math.sqrt(numCycles) - numInCol * numInCol / 2 - adityas.length * adityas.length / 5;
    if (adityas.length > 10)
        spawnPct = 0;
    else if (adityas.length == 0)
        spawnPct = 1;
    else if (adityas.length <= 3 && numInCol == 0)
        spawnPct = 0.1;
    else if (Math.random() >= spawnPct)
        return;
    var yVal = Math.random() * 700 + 50;
    adityas.push({x: 800, y: yVal, r: 50, inCol: true});
    numInCol++;
}
function spawnWilkes() {
    var spawnPct = 0.005;
    if (Math.random() >= spawnPct)
        return;
    var rVal = 15;
    var yVal = Math.random() * (800 - 2 * rVal) + rVal;
    wilkes.push({x: 800, y: yVal, r: rVal});
}
function clearAdityas() {
    if (numCycles % 1000 != 0)
        return;
    for (var i = 0; i < adityas.length; i++) {
        if (adityas[i].x <= -25 || isNaN(adityas[i].x))
            adityas.splice(i, 1);
    }
}
function clearWilkes() {
    if (numCycles % 1005 != 0)
        return;
    for (var i = 0; i < wilkes.length; i++) {
        if (wilkes[i].x <= -25 || isNaN(wilkes[i].x))
            wilkes.splice(i, 1);
    }
}
function endgame() {
    gameover = true;
    overlaycolor = "red";
    initBounceCycle();
}
function inaditya() {
    for (var i = 0; i < adityas.length; i++) {
        var a = adityas[i];
        if (Math.pow(x - a.x, 2) + Math.pow(y - a.y, 2) <= Math.pow(a.r + r, 2))
            return true;
    }
    return false;
}
function checkForWilkes() {
    for (var i = 0; i < wilkes.length; i++) {
        var a = wilkes[i];
        if (Math.pow(x - a.x, 2) + Math.pow(y - a.y, 2) <= Math.pow(a.r + r, 2)) {
            points += 5;
            wilkes.splice(i, 1);
            // TODO: play a sound
            i--;
        }
    }
}
function runCycle() {
    if (numCycles % 5 == 0 && inaditya())
        endgame();

    if (numCycles % 5 == 3)
        checkForWilkes();

    clearAdityas();
    clearWilkes();
    spawnAdityas();
    spawnWilkes();
    getDeltaT();
    updateKenji();
    updateAdityas();
    updateWilkes();
    updateVarDisplay();
    drawScreen();
}
function initBounceCycle() {
    f_y = -9.8 * m;
    createjs.Ticker.removeAllEventListeners();
    createjs.Ticker.addEventListener("tick", bounceCycle);
    //setTimeout(function () {
    //    if (store.enabled) {
    //        var scores = store.get("highscores") || [];
    //        var newScore = {points: points, name: "Cool Person"};
    //        scores.push(newScore);
    //        scores = scores.sort(function (x, y) {
    //            return x.points > y.points
    //        });
    //        if (scores.length <= 5 || scores[4].points < points) {
    //            console.log("u r gud");
    //            newScore.name = prompt("That's a high score! What's your" +
    //                " name!") || "Cool Person";
    //            scores = scores.sort(function (x, y) {
    //                return x.points > y.points
    //            });
    //        }
    //        store.set("highscores", scores);
    //    }
    //}, 1);
    v_y = 0;
}
function bounceCycle() {
    f_y = -9.8 * m;
    E = 0;
    updateKenji();
    updateVarDisplay();
    drawScreen();
    makeOverlay();

    if (v_y < 0.01 && x <= r - 0.01 && gameover) {
        createjs.Ticker.removeAllEventListeners();

    }
}
function unpause() {
    prevTime = Date.now();
    paused = false;
    createjs.Ticker.addEventListener("tick", runCycle);
}
function pause() {
    paused = true;
    overlaycolor = "#CCC";
    createjs.Ticker.removeAllEventListeners();
    makeOverlay();
}
function togglePaused() {
    if (paused)
        unpause();
    else
        pause();
}

/*********************************
 * Initialization
 *********************************/
var stage = null;

$(document).ready(function () {
    stage = new createjs.Stage("canvas");
    createjs.Ticker.setFPS(120);
    addEventListeners();
    makeOverlay();
    //if (store.enabled) {
    //    var scores = store.get("highscores") || [];
    //    console.log(scores);
    //    scores = scores.sort(function(x, y){return x.points > y.points});
    //    console.log(scores);
    //    for (var i = 0; i < scores.length && i < 5; i++) {
    //        var score = scores[i];
    //        $("#highscores").append("<div>" + score.name + " " + Math.floor(score.points) + "</div>");
    //        console.log(score.points);
    //    }
    //}
});

