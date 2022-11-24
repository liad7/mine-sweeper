'use strict'


const MINE_IMG = 'url("../img/mine.png")'
const CLICKED_MINE_IMG = 'url("../img/shown-mine.png")'
const START_SMILEY = 'url("../img/start.png")'
const LOSE_SMILEY = 'url("../img/lose.png")'
const WIN_SMILEY = 'url("../img/win.png")'



var gBoard
var gGame
var gLevel
var gTime
var gTimerInterval





function onInit(size = 4, mines = 2) {
    if (gTimerInterval) {
        clearInterval(gTimerInterval)
    }
    updateSmileyButton(START_SMILEY)
    resetTime()
    document.querySelector('div').innerText = ''

    gLevel = {
        SIZE: size,
        MINES: mines
    }
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        LIVES: 3
        // secsPassed: 0

    }
    updateLives()

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
        }
    }
    return board
}



function renderBoard(board) {
    var strHtml = ''
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            // const val = cell.isMine ? 'X' : ''
            const className = getAllClassNames(cell)
            console.log(className)
            strHtml += `<td class=" cell cell-${i}-${j} ${className}" oncontextmenu = "cellMarked(this,event,${i},${j})" onclick="onCellClicked(this,${i},${j})">
            
                        </td>`
        }
        strHtml += '</tr>'
    }
    var elTBody = document.querySelector('.mines-board')
    elTBody.innerHTML = strHtml

    console.log(elTBody.querySelector('.cell'))
}

function getAllClassNames(cell) {
    const count = cell.minesAroundCount
    const digit = count ? gDigitNames[count] : ''
    console.log(count, digit)
    // var className = ` ${digit} `
    var className = digit
    className += (cell.isShown) ? 'shown ' : ''
    className += (cell.isMarked) ? 'marked ' : ''
    className += cell.isMine ? 'mine' : ''
    console.log(className)
    return className
}

function newGame() {
    onInit(gLevel.SIZE, gLevel.MINES)
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

    if (!gGame.isOn && !gTime) {
        console.log('first')
        gTime = new Date().getTime()
        gTimerInterval = setInterval(uploadClock, 1000)
    }

}

function firstClick(cell) {
    gGame.isOn = true
    placeMines(gBoard)
    if (cell.isMine) {
        placeMine(gBoard)
        cell.isMine = false
    }
    setMinesNegsCount(gBoard)
    console.log(cell.minesAroundCount)
    renderBoard(gBoard)

}

function onCellClicked(elCell, cellI, cellJ) {
    const cell = gBoard[cellI][cellJ]
    if (cell.isShown || cell.isMarked) return

    if (cell.isMine) {
        mineClicked(elCell, cell)
        return
    }


    updateCell(cell)
    if (!gGame.isOn) {
        firstClick(cell)
        const className = getClassName({ i: cellI, j: cellJ })
        elCell = document.querySelector(`.${className}`)
    }


    const value = cell.minesAroundCount ? cell.minesAroundCount : ''
    console.log(value)
    console.log(elCell)
    console.log(document.querySelector('.cell'))
    renderCell(elCell, value)


    if (value === '') {
        fullExpand(gBoard, cellI, cellJ)
        // expandShown(gBoard, cellI, cellJ)
    }
}

function mineClicked(elCell, cell) {
    gGame.LIVES--
    updateLives()
    cell.isShown = true
    // renderCell(elCell, CLICKED_MINE_IMG)
    renderMine(elCell, CLICKED_MINE_IMG)
    if (!gGame.LIVES) gameLost()


}


function expandShown(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            const currCell = board[i][j]
            if (currCell.isMarked || currCell.isShown || currCell.isMine) continue

            const className = getClassName({ i, j })
            const elCell = document.querySelector(`.${className}`)
            updateCell(currCell)
            const value = currCell.minesAroundCount ? currCell.minesAroundCount : ''
            renderCell(elCell, value)
        }
    }
}
function fullExpand(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            const currCell = board[i][j]
            if (currCell.isMarked || currCell.isShown || currCell.isMine) continue


            const className = getClassName({ i, j })
            const elCell = document.querySelector(`.${className}`)
            updateCell(currCell)
            const value = currCell.minesAroundCount ? currCell.minesAroundCount : ''
            if (value === '') fullExpand(gBoard, i, j)
            renderCell(elCell, value)
        }
    }
}

function checkVictory() {
    const emptyCells = gLevel.SIZE ** 2 - gLevel.MINES
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === emptyCells) {
        updateSmileyButton(WIN_SMILEY)
        gameOver(',you win')
    }
}

function gameLost() {
    const mines = document.querySelectorAll('.mine')
    for (var i = 0; i < mines.length; i++) {
        const elMine = mines[i]
        if (elMine.classList.contains('shown')) continue
        // renderCell(elMine, MINE_IMG)
        renderMine(elMine, MINE_IMG)
    }
    updateSmileyButton(LOSE_SMILEY)
    gameOver(',you lose')
}

function gameOver(msg) {

    clearInterval(gTimerInterval)
    document.querySelector('div').innerText = 'GAME OVER' + msg
}

function updateLives() {
    document.querySelector('.lives').innerText = gGame.LIVES + ' '
}




function updateSmileyButton(value) {
    document.querySelector('.smiley').style.backgroundImage = value
}

function renderMine(elCell, value) {
    elCell.classList.add('shown')
    elCell.style.backgroundImage = value
}