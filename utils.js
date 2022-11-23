'use strict'
var gDigitNames = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']

function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue

            if (mat[i][j].isMine) neighborsCount++
        }
    }
    return neighborsCount
}

function renderCell(elCell, value) {
    // Select the elCell and set the value
    elCell.innerHTML = value
}

function getCellsWithoutMine(mat) {
    const Cells = []
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {
            if (!mat[i][j].isMine) {

                Cells.push({ i, j })
            }
        }
    }
    console.log(Cells)
    return Cells

}

// function renderCell(location, value) {
//     const cellSelector = '.' + getClassName(location) // cell-i-j
//     const elCell = document.querySelector(cellSelector)
//     elCell.innerHTML = value
// }

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] }
    return coord
}

function uploadClock() {
    const elClock = document.querySelector('.clock')
    const now = new Date().getTime()
    // const timer = Number.parseFloat((now - gTime)/1000)
    const timer = ((now - gTime) / 1000).toFixed(0)

    elClock.innerText = timer

}


function resetTime() {
    var elClock = document.querySelector('.clock')
    elClock.innerText = '000'
}


function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}