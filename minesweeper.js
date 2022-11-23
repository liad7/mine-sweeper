'use strict'


var gBoard
var gGame
var gLevel
var gTime
var gTimerInterval

const MINE_IMG = 'x'


function onInit() {
    gLevel = {
        SIZE: 4,
        MINES: 2
    }
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0

    }
    // gSize = 4
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard)
    clearInterval(gTimerInterval)



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
    placeMines(board)
    // board[1][1].isMine = board[2][2].isMine = true
    // board[1][1].isShown = board[2][2].isShown = true

    setMinesNegsCount(board)

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

            var className = `${digit} cell-${i}-${j}`
            className += (cell.isShown) ? 'shown ' : ''
            className += (cell.isMarked) ? 'marked' : ''
            // const tdId = `cell-${i}-${j}`
            // strHtml += `<td id="${tdId}" class=" cell ${className}" oncontextmenu="mouseEvent(this,event)">
            strHtml += `<td class=" cell ${className}" oncontextmenu = "cellMarked(this,event,${i},${j})" onclick="onCellClicked(this,${i},${j})">
            ${val}
                        </td>`
        }
        strHtml += '</tr>'
    }
    var elTBody = document.querySelector('.mines-board')
    elTBody.innerHTML = strHtml
}
renderCell

function placeMines(board) {
    for (let i = 0; i < gLevel.MINES; i++) {
        const cells = getCellsWithoutMine(board)

        const idx = getRandomInt(0, cells.length)
        const pos = cells[idx]

        board[pos.i][pos.j].isMine = true


    }

}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            if (!cell.isMine) {
                const count = countNeighbors(i, j, board)
                console.log(count)
                cell.minesAroundCount = count
            }

        }

    }
}

function onCellClicked(elCell, cellI, cellJ) {
    const cell = gBoard[cellI][cellJ]
    if (cell.isShown || cell.isMarked) return
    cell.isShown = true
    gGame.shownCount++
    console.log(gGame.shownCount)
    checkGameOver()

    elCell.classList.add('shown')

    if (!cell.isMine) {
        const value = cell.minesAroundCount ? cell.minesAroundCount : ''
        renderCell(elCell, value)
    }

    if (cell.minesAroundCount === 0) {
        expandShown(gBoard, cellI, cellJ)
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
        checkGameOver()
    }
    console.log(gGame.markedCount)
    cell.isMarked = !cell.isMarked

    elCell.classList.toggle('marked')
    console.log(elCell)

}


function checkGameOver() {
    const emptyCells = gLevel.SIZE ** 2 - gLevel.MINES
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === emptyCells) {
        clearInterval(gTimerInterval)
        document.querySelector('div').innerText = 'GAME OVER'
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

            currCell.isShown = true
            gGame.shownCount++
            checkGameOver()
            const className = getClassName({ i, j })
            const elCell = document.querySelector(`.${className}`)
            elCell.classList.add('shown')

            if (!currCell.isMine) {
                const value = currCell.minesAroundCount ? currCell.minesAroundCount : ''
                renderCell(elCell, value)
            }


        }
    }
}

function onFirstClick() {
    if (!gGame.isOn) {
        console.log('first')
        gGame.isOn = true
        gTime = new Date().getTime()
        gTimerInterval = setInterval(uploadClock, 1000)
    }
}