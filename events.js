var playerY = 0;
var carDivs = [];
var cars = [];
var intervalIds = [];
var timeoutIds = [];
var gameOver = false;
var timerVar = 0;


function restoreGame() {
    clearGame();
    var gameState = openFile("save.json");
    timerVar = gameState.time;
    playerY = gameState.place;
    updatePlayer();
    $.each(gameState.cars, function (index, car) {
        createCarDiv(car);
    });
    startGame();
}


function saveGame() {
    if (gameOver) {
        return;
    }
    var gameState = {
        time: timerVar,
        place: playerY,
        cars: cars
    };
    saveFile(gameState, "save.json");
}

function timer() {
    var intervalId = setInterval(function () {
        timerVar++;
    }, 1000);
    intervalIds.push(intervalId);
}

function createFastCar() {
    if (gameOver) {
        return;
    }
    var roads = [0, 0, 0, 0];
    $.each(carDivs, function (index, car) {
        var x = parseFloat(car.css("top"));
        var h = parseFloat($("#gameFieldContainer").css("height"));
        var n = Math.round(x / (h / 4));
        roads[n]++;
    });
    $.each(roads, function (index, carsN) {
        if (carsN == 0) {
            createNewDiv("fastCar", 16, 7, index);
            return false;
        }
    });
    timeoutIds.push(setTimeout(createFastCar, getRandomInt(5000, 10000)));
}

function updatePlayer() {
    $("#player").css("top", playerY + "%");
}

function clearGame() {
    clearAllTimeouts();
    clearAllIntervals();

    $.each(carDivs, function (index, car) {
        car.remove();
    });
    carDivs = [];
    cars = [];
    playerY = 0;
    updatePlayer();
    gameOver = false;
}

function startGame() {
    createAuto();
    timer();
    timeoutIds.push(setTimeout(createFastCar, getRandomInt(5000, 10000)));
}

function newGame() {
    clearGame();
    startGame();
}

function chooseRandomRoad() {
    return getRandomInt(0, 3);
}

function resizeField() {
    var h = parseFloat($("#player").css("width"));
    var windowH = $(window).height();
    $("#gameFieldContainer").css("height", 6 * h + "px");
    $("#gameFieldContainer").css("top", (windowH - 6 * h) / 2 + "px");
}

$("#gameFieldContainer").ready(function () {

    window.onbeforeunload = function (e) {
        saveGame();
        // Unlike usual browsers, in which a string should be returned and the user is
        // prompted to confirm the page unload, Electron gives developers more options.
        // Returning empty string or false would prevent the unloading now.
        // You can also use the dialog API to let the user confirm closing the application.
        e.returnValue = true;
    };

    newGame();
    resizeField();
    setTimeout(resizeField, 1000);
    $(window).resize(resizeField);
});

function deleteCar(carDiv, car) {
    carDivs = $.grep(carDivs, function (value) {
        return value != carDiv;
    });

    cars = $.grep(cars, function (value) {
        return value != car;
    });

    carDiv.remove();
}

$(document).keydown(function (e) {
    e.preventDefault(); // prevent the default action (scroll / move caret)
    if (gameOver) {
        return;
    }
    switch (e.which) {
        case 37: // left
            break;

        case 38: // up
            if (playerY - 25 >= 0) {
                playerY -= 25;
                updatePlayer();
                checkCollision();
            }
            break;

        case 39: // right
            break;

        case 40: // down
            if (playerY + 25 <= 75) {
                playerY += 25;
                updatePlayer();
                checkCollision();
            }
            break;

        default:
            return; // exit this handler for other keys
    }
});

function clearAllIntervals() {
    $.each(intervalIds, function (index, id) {
        clearInterval(id);
    });
    intervalIds = [];
}

function clearAllTimeouts() {
    $.each(timeoutIds, function (index, id) {
        clearTimeout(id);
    });
    timeoutIds = [];
}

function createCarDiv(car) {
    var d = $("<div>", {id: "car" + carDivs.length, class: car.class});
    d.css("left", car.x + "%");
    d.css("top", car.y + "%");

    carDivs.push(d);
    cars.push(car);

    $("#gameFieldContainer").append(d);
    var intervalId = setInterval(function () {
        if (car.x >= -car.width + 2) {
            car.x -= 0.5;
            d.css("left", car.x + "%");
            checkCollision();
        }
        else {
            deleteCar(d, car);
            clearInterval(intervalId);
        }
    }, car.motionInterval);
    intervalIds.push(intervalId);
}

function createNewDiv(carClass, carWidth, motionInterval, roadN) {
    if (motionInterval == undefined) {
        motionInterval = 30;
    }
    if (roadN == undefined) {
        roadN = chooseRandomRoad();
    }

    var car = {
        class: carClass,
        width: carWidth,
        y: roadN * 25,
        x: 100,
        motionInterval: motionInterval
    };

    createCarDiv(car);
}

function createAuto() {
    if (gameOver) {
        return;
    }

    var p = getRandomInt(0, 100);
    if (p >= 25) {
        createNewDiv("car", 16);
        timeoutIds.push(setTimeout(createAuto, getRandomInt(2000, 5000)));
    } else {
        createNewDiv("bus", 21);
        timeoutIds.push(setTimeout(createAuto, getRandomInt(3000, 7000)));
    }
}

function checkCollision() {
    var playerWidth = parseFloat($("#player").css("width"));
    var playerTop = parseFloat($("#player").css("top"));

    $.each(carDivs, function (index, car) {
        var carLeft = parseFloat(car.css("left"));
        var carTop = parseFloat(car.css("top"));
        if (carLeft < playerWidth) {
            if (playerTop == carTop) {
                clearAllIntervals();
                gameOver = true;
                alert("Ты продержался " + timerVar + " секунд");

                return true;
            }
        }
    });

    return false;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
