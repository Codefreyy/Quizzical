// get dom elements
const questionTextContainer = document.getElementById("question-text")
const optionsContainer = document.getElementById("options-container")
const errorText = document.getElementById("error-text")
const currentScoreContainer = document.getElementById("current-score-container")
const correctAnswerDiv = document.getElementById("correct-answer")
const wrongAnswerDiv = document.getElementById("wrong-answer")
const nextQuestionButton = document.getElementById("next-question-button")
const quitButton = document.getElementById("quit-button")
const startButton = document.getElementById("start-button")
const cutHalfWrongButton = document.getElementById("cutHalfWrongButton")
const pauseTimerBtn = document.getElementById("pause-timer")
const usernameSpan = document.getElementById("username")
const bestScoreSpan = document.getElementById("best-score")
const leaderBoardOl = document.getElementById("leader-board-container")
const leaderBoardSection = document.getElementById("leader-board")
const questionCategoryDiv = document.getElementById("question-category")
let options

// constants
const scoreOfDifficulty = new Map([
  ["Easy", 1],
  ["Medium", 2],
  ["Hard", 3],
])

// state management
let questionObj
let questionCategrory
let questionDifficulty
let questionText
let currentScore = 0
let bestScore = 0
let wrongAnswerNum = 0
let correctAnswerNum = 0
let correctAnswerIndex
let questionCategory
let isDeleteAnswerUsed = false
let isPauseUsed = false
let shownAnswerOptions
const countDownTime = 30
let remainingSeconds
let leaderBoard = []
let timer
let username

function init() {
  getUserName()
  fetchLocalScores()

  startButton.addEventListener("click", handleStartBtnClick)
  pauseTimerBtn.addEventListener("click", handlePauseBtnClick)
  quitButton.addEventListener("click", handleQuitBtnClick)
  nextQuestionButton.addEventListener("click", handleContinueBtnClick)
  cutHalfWrongButton.addEventListener("click", handleCutWrongBtnClick)
}

init()

function getUserName() {
  while (!username) {
    username = prompt("Please input username...")
  }
  usernameSpan.innerHTML = username
}

function fetchLocalScores() {
  if (localStorage.getItem(username)) {
    bestScoreSpan.innerHTML = localStorage.getItem(username)
    bestScore = localStorage.getItem(username)
  }
  leaderBoard = JSON.parse(localStorage.getItem("leaderBoard"))
}

// count down https://medium.com/weekly-webtips/creating-a-precise-countdown-with-vanilla-js-cdc44c0483fa
const formatMinutesSeconds = (seconds) => {
  const thisDate = new Date(seconds * 1000)
  if (thisDate.getMinutes()) {
    return `${thisDate.getMinutes()}m :${thisDate.getSeconds()}s`
  } else {
    return `${thisDate.getSeconds()}s`
  }
}

const renderCountdown = (seconds) => {
  const counterElement = document.getElementById("count-down")
  const stringCounter = formatMinutesSeconds(seconds)
  counterElement.innerText = stringCounter
}

const startCountdown = (seconds) => {
  remainingSeconds = seconds

  timer = setInterval((_) => {
    if (remainingSeconds > 0) {
      remainingSeconds--
      renderCountdown(remainingSeconds)
      setTimeout(async () => {
        // alert after dom updated to 0
        if (remainingSeconds == 0) {
          wrongAnswerNum += 1
          wrongAnswerDiv.innerHTML = wrongAnswerNum
          checkWrongAnswerNum()

          if (wrongAnswerNum < 3) {
            await getQuestion()
            renderQuestions(questionText, shownAnswerOptions)
          }
        }
      })
    }
  }, 1000)

  renderCountdown(remainingSeconds)
}

async function getQuestion() {
  // change it to your own apiKey, you can get it from https://quizapi.io/docs/1.0/overview#request-parameters
  const apiKey = "mzlGGLJ2ByLHPgC1cYYPqkSgQER3zJsfjL1eDQXK"
  const data = await fetch(
    `https://quizapi.io/api/v1/questions?limit=1&apiKey=${apiKey}`
  )
  const questionsArr = await data.json()
  questionObj = questionsArr[0]
  questionCategory = questionObj.category
  questionCategrory = questionObj?.category
  questionDifficulty = questionObj?.difficulty
  const answers = Object.values(questionObj.answers)
  shownAnswerOptions = answers.filter((item) => item !== null) // all options
  questionText = questionObj.question

  Object.values(questionObj.correct_answers).forEach((item, index) => {
    if (item == "true") {
      correctAnswerIndex = index
    }
  })

  // render the question and answers
  renderQuestions(questionText, shownAnswerOptions)
  if (timer) {
    clearInterval(timer)
  }
  startCountdown(countDownTime)
}

function listenAnswerChoice() {
  options = document.querySelectorAll(".option")
  options.forEach((option, index) => {
    option.addEventListener("click", () => handleAnswerClick(index))
  })
}

function disableOptions() {
  // in case the user chooses the same correct answer and get multiple scores
  options.forEach((option) => {
    option.style.pointerEvents = "none"
  })
}

function handleAnswerClick(optionIndex) {
  clearInterval(timer)
  // const optionIndex = e.target.dataset.index
  const correctOption = document.getElementById(correctAnswerIndex)
  const userChosenOption = document.getElementById(optionIndex)
  disableOptions()
  highlightOption(userChosenOption)
  highlightOption(correctOption, true)

  // user chose correct answer
  if (optionIndex == correctAnswerIndex) {
    updateSuccessStatus()
    highlightOption(correctOption, true)
  } else {
    // user chose wrong answer
    highlightOption(correctOption, true)
    updateFailStatus()
    setTimeout(() => {
      // so that the alert will happen after the user see the answer result (highligh option)
      checkWrongAnswerNum()
    })
  }
  nextQuestionButton.style.display = "block"
  cutHalfWrongButton.disabled = true
  pauseTimerBtn.disabled = true
}

function checkWrongAnswerNum() {
  if (wrongAnswerNum >= 3) {
    alert(
      "Game over! You have answered three questions wrong. Your score has been cleared."
    )

    currentScore = 0

    bestScore = Math.max(bestScore, currentScore)
    bestScoreSpan.innerHTML = bestScore
    localStorage.setItem(username, bestScore)

    if (!localStorage.getItem("leaderBoard")) {
      if (!leaderBoard) {
        leaderBoard = [{ username, score: bestScore }]
      } else {
        leaderBoard.push({ username, score: bestScore })
      }
      localStorage.setItem("leaderBoard", JSON.stringify(leaderBoard))
    } else if (bestScore == currentScore) {
      leaderBoard.forEach((user) => {
        if (user.username == username) {
          user.score = bestScore
        }
      })
      let board = JSON.parse(localStorage.getItem("leaderBoard"))
      board.forEach((item) => {
        if (item.username == username) {
          item.score = bestScore
        }
      })
      localStorage.setItem("leaderBoard", JSON.stringify(board))
    }

    currentScoreContainer.innerHTML = currentScore

    setTimeout(() => {
      // ensure that the display property is set after other changes in the DOM have taken effect
      nextQuestionButton.style.display = "none"
    })
    resetStatus()
    renderLeaderBoard()
  }
}

function updateSuccessStatus() {
  correctAnswerNum += 1
  currentScore += scoreOfDifficulty.get(questionDifficulty)
  currentScoreContainer.innerHTML = currentScore
  correctAnswerDiv.innerHTML = correctAnswerNum
}

function updateFailStatus() {
  wrongAnswerNum += 1
  wrongAnswerDiv.innerHTML = wrongAnswerNum
}

function resetStatus() {
  optionsContainer.innerHTML = "⬇️ Click to start"
  questionTextContainer.innerHTML = ""
  questionCategoryDiv.style.display = "none"

  questionCategrory = ""
  questionDifficulty = ""
  questionObj = {}
  shownAnswerOptions = []

  currentScore = 0
  currentScoreContainer.innerHTML = 0

  wrongAnswerNum = 0
  wrongAnswerDiv.innerHTML = 0

  correctAnswerNum = 0
  correctAnswerDiv.innerHTML = 0
  correctAnswerIndex = 0

  // buttons
  cutHalfWrongButton.disabled = true
  pauseTimerBtn.disabled = true

  startButton.style.display = "block"
  startButton.innerHTML = "Start Game"

  quitButton.disabled = true
  nextQuestionButton.style.display = "none"
  cutHalfWrongButton.innerHTML = "Cut half wrong answers 1 / 1"
  pauseTimerBtn.innerHTML = "Pause timer 1 / 1"

  isDeleteAnswerUsed = false
  isPauseUsed = false

  clearInterval(timer)
}

function highlightOption(option, isCorrect = false) {
  if (isCorrect) {
    option.style.border = "2px solid black"
    option.style.fontWeight = "bold"
    option.style.backgroundColor = "green"
    option.style.color = "white"
  } else {
    option.style.border = "2px solid #000"
    option.style.fontWeight = "bold"
    option.style.backgroundColor = "#f8fbff"
    option.style.color = "#636974"
  }
}

function renderQuestions(questionText, answers) {
  // clear last question content
  questionTextContainer.innerHTML = ""
  optionsContainer.innerHTML = ""
  if (questionCategory) {
    questionCategoryDiv.innerHTML = questionCategory
    questionCategoryDiv.style.display = "block"
  } else {
    questionCategoryDiv.style.display = "none"
  }
  questionTextContainer.innerHTML =
    questionText + ` (${questionObj.difficulty})`
  for (let i = 0; i < answers.length; i++) {
    const option = document.createElement("div")
    option.setAttribute("class", "option")
    option.setAttribute("id", i)
    option.setAttribute("role", "button")
    option.innerText = answers[i]
    optionsContainer.appendChild(option)
  }

  listenAnswerChoice()
}

function cutHalfWrongAnswers(answers) {
  if (!answers || !answers.length) return

  if (answers.length == 2) {
    answers = answers.filter((answer, index) => {
      return index == correctAnswerIndex
    })
  }

  const wrongAnswers = answers.filter(
    (_, index) => index !== correctAnswerIndex
  )

  const numberToRemove = Math.floor(wrongAnswers.length / 2)
  const optionsToRemove = []

  while (optionsToRemove.length < numberToRemove) {
    const randomIndex = Math.floor(Math.random() * wrongAnswers.length)
    if (!optionsToRemove.includes(randomIndex)) {
      optionsToRemove.push(randomIndex)
    }
  }

  optionsToRemove.forEach((index) => {
    answers.splice(index, 1)
  })

  return answers
}

function renderLeaderBoard() {
  leaderBoardOl.innerHTML = ""
  if (!leaderBoard || !leaderBoard?.length) {
    return
  }

  leaderBoardSection.style.display = "block"

  leaderBoard.sort((a, b) => b.score - a.score)

  const displayBoard = leaderBoard.slice(0, 11)

  displayBoard.forEach((user) => {
    const li = document.createElement("li")
    li.innerHTML = `${user.username}: ${user.score}`
    if (user.username == username) {
      li.style.color = "green"
      li.innerHTML = `${user.username}: ${user.score} (You)`
    }
    leaderBoardOl.appendChild(li)
  })
}

async function handleStartBtnClick() {
  await getQuestion()
  renderQuestions(questionText, shownAnswerOptions)
  leaderBoardSection.style.display = "none"
  startButton.style.display = "none"
  cutHalfWrongButton.disabled = false
  pauseTimerBtn.disabled = false
  quitButton.disabled = false
}

function handlePauseBtnClick() {
  if (!isPauseUsed) {
    isPauseUsed = true
    clearInterval(timer)
    pauseTimerBtn.innerHTML = "Pause timer 0 / 1"
    pauseTimerBtn.disabled = true

    setTimeout(() => {
      startCountdown(remainingSeconds)
      pauseTimerBtn.innerText = "Pause timer 0 / 1"
    }, 60 * 1000)
  }
}

function handleQuitBtnClick() {
  alert("Game over")
  bestScore = Math.max(bestScore, currentScore)
  bestScoreSpan.innerHTML = bestScore
  localStorage.setItem(username, bestScore)

  const storedBoard = JSON.parse(localStorage.getItem("leaderBoard"))

  if (!storedBoard || !storedBoard.find((item) => item.username == username)) {
    if (!leaderBoard) {
      leaderBoard = [{ username, score: bestScore }]
    } else {
      leaderBoard.push({ username, score: bestScore })
    }
    localStorage.setItem("leaderBoard", JSON.stringify(leaderBoard))
  } else if (bestScore == currentScore) {
    leaderBoard.forEach((user) => {
      if (user.username == username) {
        user.score = bestScore
      }
    })
    let board = JSON.parse(localStorage.getItem("leaderBoard"))
    board.forEach((item) => {
      if (item.username == username) {
        item.score = bestScore
      }
    })
    localStorage.setItem("leaderBoard", JSON.stringify(board))
  }
  resetStatus()
  renderLeaderBoard()
}

async function handleContinueBtnClick() {
  await getQuestion()
  renderQuestions(questionText, shownAnswerOptions)
  if (!isDeleteAnswerUsed) {
    cutHalfWrongButton.disabled = false
  }

  if (!isPauseUsed) {
    pauseTimerBtn.disabled = false
  }

  nextQuestionButton.style.display = "none"
}

async function handleCutWrongBtnClick() {
  cutHalfWrongButton.disabled = true
  if (!isDeleteAnswerUsed) {
    isDeleteAnswerUsed = true
    // cut half wrong answer
    const res = cutHalfWrongAnswers(shownAnswerOptions)
    renderQuestions(questionText, res)
    cutHalfWrongButton.innerHTML = `Cut half wrong answers 0 / 1`
  }
}
