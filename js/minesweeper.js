'use strict'


var gBoard
var gGame
var gLevel
var gTime
var gTimerInterval

const MINE_IMG = 'x'


function onInit(size = 4, mines = 2) {
    if (gTimerInterval) {
        clearInterval(gTimerInterval)
    }
    resetTime()
    gLevel = {
        SIZE: size,
        MINES: mines
    }
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        // secsPassed: 0

    }

    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard)



}


function buildBoard(size) {
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {

            const cell = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
            console.log(cell)
        }
    }
    return board
}



function renderBoard(board) {
    var strHtml = ''
    for (var i = 0; i < board.length; i++) {
        const row = board[i]
        strHtml += '<tr>'
        for (var j = 0; j < row.length; j++) {
            const cell = row[j]
            // figure class name
            const val = cell.isMine ? 'X' : ''
            const digit = cell.minesAroundCount ? gDigitNames[cell.minesAroundCount] : ''

            var className = `${digit} cell-${i}-${j} `
            className += (cell.isShown) ? 'shown ' : ''
            className += (cell.isMarked) ? 'marked ' : ''
            className += cell.isMine ? 'mine' : ''

            strHtml += `<td class=" cell ${className}" oncontextmenu = "cellMarked(this,event,${i},${j})" onclick="onCellClicked(this,${i},${j})">
            ${val}
                        </td>`
        }
        strHtml += '</tr>'
    }
    var elTBody = document.querySelector('.mines-board')
    elTBody.innerHTML = strHtml
}


function placeMines(board) {
    for (let i = 0; i < gLevel.MINES; i++) {
        placeMine(board)

    }

}
function placeMine(board) {
    const cells = getCellsWithoutMine(board)
    const idx = getRandomInt(0, cells.length)
    const pos = cells[idx]
    console.log(pos)
    board[pos.i][pos.j].isMine = true
}


function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            if (!cell.isMine) {
                const count = countNegsMines(i, j, board)
                cell.minesAroundCount = count
            }

        }

    }
}



function cellMarked(elCell, ev, cellI, cellJ) {
    ev.preventDefault()
    const cell = gBoard[cellI][cellJ]
    if (cell.isShown) return

    if (cell.isMarked) {
        gGame.markedCount--
    } else {
        gGame.markedCount++
        checkVictory()
    }
    cell.isMarked = !cell.isMarked

    elCell.classList.toggle('marked')

}

function onStartTimer() {

    if (!gGame.isOn) {
        console.log('first')
        gTime = new Date().getTime()
        gTimerInterval = setInterval(uploadClock, 1000)
    }

}

function firstClick(i, j) {
    gGame.isOn = true
    placeMines(gBoard)
    while (gBoard[i][j].isMine) {
        placeMine(gBoard)
        gBoard[i][j].isMine = false
    }
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)

}

function onCellClicked(elCell, cellI, cellJ) {
    const cell = gBoard[cellI][cellJ]
    if (cell.isMine) {
        gameLost()
        return
    }
    if (cell.isShown || cell.isMarked) return

    if (!gGame.isOn) firstClick(cellI, cellJ)


    showCell(cell)
    const value = currCell.minesAroundCount ? currCell.minesAroundCount : ''
    renderCell(elCell, value)

    if (cell.minesAroundCount === 0) {
        expandShown(gBoard, cellI, cellJ)
    }
}
function expandShown(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            const currCell = board[i][j]
            if (currCell.isMarked || currCell.isShown) continue

            const className = getClassName({ i, j })
            const elCell = document.querySelector(`.${className}`)
            showCell(currCell)
            const value = currCell.minesAroundCount ? currCell.minesAroundCount : ''
            renderCell(elCell, value)
        }
    }
}

function checkVictory() {
    const emptyCells = gLevel.SIZE ** 2 - gLevel.MINES
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === emptyCells) {
        gameOver()
    }
}

function gameLost() {
    const mines = document.querySelectorAll('.mine')
    console.log(mines)
    for (var i = 0; i < mines.length; i++) {
        const currMine = mines[i]
        currMine.classList.add('shown')
    }

    gameOver()
}

function gameOver() {

    clearInterval(gTimerInterval)
    document.querySelector('div').innerText = 'GAME OVER'
}




