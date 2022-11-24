'use strict'


const MINE_IMG = 'url("../img/mine.png")'
const CLICKED_MINE_IMG = 'url("../img/shown-mine.png")'
const START_SMILEY = 'url("../img/start.png")'
const LOSE_SMILEY = 'url("../img/lose.png")'
const WIN_SMILEY = 'url("../img/win.png")'
const MARKED = 'url("../img/flag.png")'




var gBoard
var gGame
var gLevel
var gTime
var gTimerInterval
var gElHinted
var gMegaHintCells





function onInit(size = 4, mines = 2) {
    if (gTimerInterval) {
        clearInterval(gTimerInterval)
    }
    updateSmileyButton(START_SMILEY)
    resetTime()
    document.querySelector('div').innerText = ''
    gMegaHintCells = []
    gLevel = {
        SIZE: size,
        MINES: mines,
        BEST: getLevelBestScore(size)
    }
    gGame = {
        isOn: false,
        isHinted: false,
        isMegaHint: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        LIVES: 3,
        SAFE: 3

    }
    renderHints()
    renderLives()
    renderBestScore()
    renderSafeClickCount()
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard)

}

function getLevelBestScore(size) {
    const name = getStorageItemName(size)
    const best = localStorage.getItem(name)
    if (best) return best
    return 0
}

function getStorageItemName(size) {
    if (size === 4) return 'beginnerBest'
    if (size === 8) return 'mediumBest'
    if (size === 12) return 'expertBest'
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
            const className = getAllClassNames(cell)
            strHtml += `<td class=" cell cell-${i}-${j} ${className}" oncontextmenu = "cellMarked(this,${i},${j})" onclick="onCellClicked(this,${i},${j})">
            
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
    const pos = getEmptyCell(board)
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



function cellMarked(elCell, cellI, cellJ) {

    const cell = gBoard[cellI][cellJ]
    if (cell.isShown) return

    if (cell.isMarked) {
        gGame.markedCount--
        elCell.style.backgroundImage = ''
    } else {
        gGame.markedCount++
        elCell.style.backgroundImage = MARKED
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
    if (gGame.isHinted) {
        showHint(gBoard, cellI, cellJ)
        return
    }
    if (gGame.isMegaHint) {
        setMegaHint(cellI, cellJ)
        return
    }
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

    }
}

function mineClicked(elCell, cell) {
    gGame.LIVES--
    renderLives()
    gGame.markedCount++
    cell.isShown = true
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
        const currTime = gGame.secsPassed
        if (currTime < gLevel.BEST) {
            const name = getStorageItemName(gLevel.SIZE)
            localStorage.setItem(name, currTime)
        }
    }
}

function gameLost() {
    const mines = document.querySelectorAll('.mine')
    for (var i = 0; i < mines.length; i++) {
        const elMine = mines[i]
        if (elMine.classList.contains('shown')) continue

        renderMine(elMine, MINE_IMG)
    }
    updateSmileyButton(LOSE_SMILEY)
    gameOver(',you lose')
}

function gameOver(msg) {
    clearInterval(gTimerInterval)
    document.querySelector('div').innerText = 'GAME OVER' + msg
}

function renderLives() {
    document.querySelector('.lives').innerText = gGame.LIVES + ' '
}

function renderBestScore() {
    const elBest = document.querySelector('.best')
    elBest.innerText = gLevel.BEST
}



function updateSmileyButton(value) {
    document.querySelector('.smiley').style.backgroundImage = value
}




function onHintClick(elHint) {
    gElHinted = elHint
    if (!gGame.isOn || gGame.isHinted) return
    elHint.style.color = 'red'
    gGame.isHinted = true
    console.log('hey')

}

function renderHints() {
    var strHTML = ''
    for (var i = 0; i < 3; i++) {
        strHTML += '<button class="hint" onclick="onHintClick(this)">Hint</button>'
    }
    const elHints = document.querySelector('.hints')
    elHints.innerHTML = strHTML

}

function renderSafeClickCount() {
    const elSafe = document.querySelector('.safeClick')
    elSafe.innerText = gGame.SAFE
}


function randomSafeCell() {
    if (!gGame.SAFE) return
    gGame.SAFE--
    renderSafeClickCount()
    const pos = getEmptyCell(gBoard)
    const className = getClassName(pos)
    const elSafeCell = document.querySelector(`.${className}`)
    elSafeCell.classList.add('safe')
    setTimeout(() => elSafeCell.classList.remove('safe'), 3000)

}



function onSevenBoomClick() {
    gGame.isOn = true
    gBoard = buildSevenBoomBoard()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)

}
function buildSevenBoomBoard() {
    const board = []
    var cellIdx = 0
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }

            if (isContainsSeven(cellIdx)) {
                cell.isMine = true
                console.log(cellIdx)
            }

            board[i][j] = cell
            cellIdx++
        }
    }
    return board
}

function isContainsSeven(num) {
    if (num === 7) return true
    if (num % 7 === 0) return true
    while (num > 10) {
        num = Math.floor(num / 10)
        if (num === 7) return true

    }
    return false
}

function onMegaHintClick(elMegaButton) {
    if (!gGame.isOn) return
    gGame.isMegaHint = true
    elMegaButton.style.color = 'red'

}

function setMegaHint(cellI, cellJ) {
    if (!gMegaHintCells.length) {
        gMegaHintCells.push({ i: cellI, j: cellJ })
        return
    }
    if (gMegaHintCells[0].i > cellI ||
        gMegaHintCells[0].j > cellJ) return

    gMegaHintCells.push({ i: cellI, j: cellJ })
    gGame.isMegaHint = false
    showMegaHint(gBoard)



}


function showHint(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            const currCell = board[i][j]
            if (currCell.isShown) continue

            showCell(currCell, i, j)
        }
    }
    setTimeout(() => {
        hideHint(board, cellI, cellJ)
        gGame.isHinted = false
        gElHinted.style.display = 'none'
    }, 1000)
}

function showCell(cell, cellI, cellJ) {
    const className = getClassName({ i: cellI, j: cellJ })
    const elCell = document.querySelector(`.${className}`)
    console.log(elCell, className)

    if (cell.isMarked) {
        elCell.style.backgroundImage = ''
        console.log(elCell.style.backgroundImage)
    }


    if (cell.minesAroundCount === null) {
        renderMine(elCell, MINE_IMG)
    } else {
        var value = cell.minesAroundCount ? cell.minesAroundCount : ''
        renderCell(elCell, value)
    }
}
function showMegaHint(board) {
    const startI = gMegaHintCells[0].i
    const endI = gMegaHintCells[1].i
    const startJ = gMegaHintCells[0].j
    const endJ = gMegaHintCells[1].j
    for (var i = startI; i <= endI; i++) {
        for (var j = startJ; j <= endJ; j++) {
            const currCell = board[i][j]
            if (currCell.isShown) continue
            showCell(currCell, i, j)
        }

    }
    setTimeout(() => {
        hideMegaHint(board, startI, endI, startJ, endJ)
    }, 3000)

}

function hideMegaHint(board, startI, endI, startJ, endJ) {
    for (var i = startI; i <= endI; i++) {
        for (var j = startJ; j <= endJ; j++) {
            const currCell = board[i][j]
            if (currCell.isShown) continue
            hideCell(currCell, i, j)
        }
    }
    gMegaHintCells = []
    document.querySelector('.mega').style.color = ''
}


function hideHint(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            const currCell = board[i][j]
            if (currCell.isShown) continue
            hideCell(currCell, i, j)
        }
    }
}

function hideCell(cell, cellI, cellJ) {
    const className = getClassName({ i: cellI, j: cellJ })
    const elCell = document.querySelector(`.${className}`)
    unrenderCell(elCell, '', cell)
}