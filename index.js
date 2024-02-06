// change it to your own apiKey, you can get it from https://quizapi.io/docs/1.0/overview#request-parameters
const apiKey = "mzlGGLJ2ByLHPgC1cYYPqkSgQER3zJsfjL1eDQXK"

// get dom elements
const questionTextContainer = document.getElementById("question-text")
const optionsContainer = document.getElementById("options-container")
const errorText = document.getElementById("error-text")
const currentScoreContainer = document.getElementById("current-score-container")
const correctAnswerDiv = document.getElementById("correct-answer")
const wrongAnswerDiv = document.getElementById("wrong-answer")
const nextBtnsDiv = document.getElementById("next-btns")
const nextQuestionButtons = nextBtnsDiv.querySelectorAll("button")
const nextDifficultyChoser = document.getElementById("next-difficulty-choser")
const quitButton = document.getElementById("quit-button")
const startButton = document.getElementById("start-button")
const cutHalfWrongButton = document.getElementById("cutHalfWrongButton")
const pauseTimerBtn = document.getElementById("pause-timer")
const usernameSpan = document.getElementById("username")
const bestScoreSpan = document.getElementById("best-score")
const leaderBoardOl = document.getElementById("leader-board-container")
const leaderBoardSection = document.getElementById("leader-board")
const questionCategoryDiv = document.getElementById("question-category")
const bonusCategoryDiv = document.getElementById("bonus-category")

// constants
const scoreOfDifficulty = new Map([
  ["Easy", 1],
  ["Medium", 2],
  ["Hard", 3],
])
const categoriesNumberForBonus = 4
const wrongAnswerCeilNumber = 3
const countDownTime = 30
const alreadyFetchedQId = []

// game state
let username
let questionObj
let questionDifficulty
let questionCategory
let bonusCategory
let questionText
let nextQdifficultyParam = ""
let options = []
let shownOptions = []
let leaderBoard = []

let currentScore = 0
let bestScore = 0
let wrongAnswerNum = 0
let correctAnswerNum = 0
let correctAnswerIndex = -1

let isDeleteAnswerUsed = false
let isPauseUsed = false
let remainingSeconds
let timer

// event listeners
startButton.addEventListener("click", handleStartBtnClick)
pauseTimerBtn.addEventListener("click", handlePauseBtnClick)
quitButton.addEventListener("click", handleQuitBtnClick)
cutHalfWrongButton.addEventListener("click", handleCutWrongBtnClick)
nextQuestionButtons.forEach((btn) =>
  btn.addEventListener("click", (e) => handleContinueBtnClick(e))
)

async function init() {
  getUserName()
  await getBonusCategory()
  getLocalScores()
}

init()

async function getQuestion() {
  let data
  let questionsArr
  let flag = false
  // When there is only one correct answer to a question and it has not appeared before, the flag will become true
  while (!flag) {
    try {
      data = await fetch(
        `https://quizapi.io/api/v1/questions?limit=1&difficulty=${nextQdifficultyParam}&apiKey=${apiKey}`
      )
      questionsArr = await data.json()
      let correctAnswerNumber = 0
      Object.values(questionsArr[0].correct_answers).forEach((item, index) => {
        if (item == "true") {
          correctAnswerIndex = index
          correctAnswerNumber += 1
        }
      })
      if (
        correctAnswerNumber === 1 &&
        !alreadyFetchedQId.includes(questionsArr[0].id)
      ) {
        flag = true
      }
    } catch (error) {
      console.error("Error fetching the question:", error)
    }
  }

  questionObj = questionsArr[0]
  questionText = questionObj.question
  questionCategory = questionObj.category
  questionDifficulty = questionObj?.difficulty
  // track already fetch questions
  alreadyFetchedQId.push(questionObj.id)

  const answers = Object.values(questionObj.answers)
  shownOptions = answers.filter((item) => item !== null) // all options

  renderQuestions(questionText, shownOptions)
  clearInterval(timer)
  startCountdown(countDownTime)
}

function renderQuestions(questionText, answers) {
  // clear last question content
  questionTextContainer.textContent = ""
  optionsContainer.innerHTML = ""

  if (questionCategory) {
    questionCategoryDiv.textContent = questionCategory
    questionCategoryDiv.style.display = "block"
  } else {
    questionCategoryDiv.style.display = "none"
  }

  questionTextContainer.textContent =
    questionText + ` (${questionObj.difficulty})`

  for (let i = 0; i < answers.length; i++) {
    const option = document.createElement("div")
    option.setAttribute("class", "option")
    option.setAttribute("id", i)
    option.setAttribute("role", "button")
    option.innerText = answers[i]
    optionsContainer.appendChild(option)
  }

  addEventToEachOption()
}

function renderLeaderBoard() {
  leaderBoardOl.innerHTML = ""
  if (!leaderBoard || !leaderBoard?.length) {
    return
  }

  leaderBoardSection.style.display = "block"

  leaderBoard.sort((a, b) => b.score - a.score)

  console.log({ leaderBoard })
  const displayBoard = leaderBoard.slice(0, 10)

  displayBoard.forEach((user) => {
    const li = document.createElement("li")
    li.textContent = `${user.username}: ${user.score}`
    if (user.username == username) {
      li.style.color = "green"
      li.textContent = `${user.username}: ${user.score} (You)`
    }
    leaderBoardOl.appendChild(li)
  })
}

async function getBonusCategory() {
  const categorySet = await getRandomCategories()
  userChoiceForBonus = prompt(
    `Please choose your bonus category from below using number 1, 2, 3, 4. If you answer this category of questions correctly, you will receive double points.

    1. ${categorySet[0]}
    2. ${categorySet[1]}
    3. ${categorySet[2]}
    4. ${categorySet[3]}

If you input other number, we regard it as you give up the chance of bonus score.
    `
  )
  bonusCategory = categorySet[userChoiceForBonus - 1]
  bonusCategoryDiv.textContent = bonusCategory
    ? `Bonus Category: ${bonusCategory}`
    : ""
  startButton.disabled = false
}

async function getRandomCategories() {
  const categorySet = new Set()

  while (categorySet.size < categoriesNumberForBonus) {
    const res = await fetch(
      `https://quizapi.io/api/v1/questions?limit=5&apiKey=${apiKey}`
    )
    const data = await res.json()
    data.forEach((question) => {
      if (question.category) {
        categorySet.add(question.category)
      }
    })
  }
  return Array.from(categorySet)
}

function getUserName() {
  while (!username) {
    username = prompt("Please input username...")
  }
  usernameSpan.textContent = username
}

function getLocalScores() {
  if (localStorage.getItem(username)) {
    bestScoreSpan.textContent = localStorage.getItem(username)
    bestScore = localStorage.getItem(username)
  }
  leaderBoard = JSON.parse(localStorage.getItem("leaderBoard"))
}

function handleAnswerClick(optionIndex) {
  clearInterval(timer)
  const correctOption = document.getElementById(correctAnswerIndex)
  const userChosenOption = document.getElementById(optionIndex)
  disableOptions()
  highlightOption(userChosenOption)

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

  nextDifficultyChoser.style.display = "block"
  cutHalfWrongButton.disabled = true
  pauseTimerBtn.disabled = true
}

function addEventToEachOption() {
  options = document.querySelectorAll(".option")
  options.forEach((option, index) => {
    option.addEventListener("click", () => handleAnswerClick(index))
  })
}

function checkWrongAnswerNum() {
  if (wrongAnswerNum >= wrongAnswerCeilNumber) {
    alert(
      "Game over! You have answered three questions wrong. Your score has been cleared."
    )

    currentScore = 0

    bestScore = Math.max(bestScore, currentScore)
    bestScoreSpan.textContent = bestScore
    localStorage.setItem(username, bestScore)

    // if leadboard does not exist
    if (!localStorage.getItem("leaderBoard")) {
      if (!leaderBoard) {
        leaderBoard = [{ username, score: bestScore }]
      } else {
        leaderBoard.push({ username, score: bestScore })
      }
      localStorage.setItem("leaderBoard", JSON.stringify(leaderBoard))
      // if leaderboard exists
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

    currentScoreContainer.textContent = currentScore

    setTimeout(() => {
      // ensure that the display property is set after other changes in the DOM have taken effect
      nextDifficultyChoser.style.display = "none"
    })
    resetStatus()
    renderLeaderBoard()
  }
}

function updateSuccessStatus() {
  correctAnswerNum += 1
  if (questionCategory == bonusCategory) {
    const addScore = scoreOfDifficulty.get(questionDifficulty) * 2
    currentScore += addScore
  } else {
    currentScore += scoreOfDifficulty.get(questionDifficulty)
  }
  currentScoreContainer.textContent = currentScore
  correctAnswerDiv.textContent = correctAnswerNum
}

function updateFailStatus() {
  wrongAnswerNum += 1
  wrongAnswerDiv.textContent = wrongAnswerNum
}

function resetStatus() {
  optionsContainer.textContent = "⬇️ Click to start"
  questionTextContainer.textContent = ""
  questionCategoryDiv.style.display = "none"

  questionCategory = ""
  questionDifficulty = ""
  questionObj = {}
  shownOptions = []

  currentScore = 0
  currentScoreContainer.textContent = 0

  wrongAnswerNum = 0
  wrongAnswerDiv.textContent = 0

  correctAnswerNum = 0
  correctAnswerDiv.textContent = 0
  correctAnswerIndex = 0

  // buttons
  cutHalfWrongButton.disabled = true
  pauseTimerBtn.disabled = true

  startButton.style.display = "block"
  startButton.textContent = "Start Game"

  quitButton.disabled = true
  nextDifficultyChoser.style.display = "none"

  cutHalfWrongButton.textContent = "Cut half wrong answers 1 / 1"
  pauseTimerBtn.textContent = "Pause timer 1 / 1"

  isDeleteAnswerUsed = false
  isPauseUsed = false

  clearInterval(timer)
}

function cutHalfWrongAnswers(answers) {
  if (!answers || !answers.length) return

  if (answers.length == 2) {
    answers = answers.filter((_, index) => {
      return index == correctAnswerIndex
    })
    correctAnswerIndex = 0
    return answers
  }

  const correctAnswerText = answers[correctAnswerIndex]

  let wrongAnswerIndexArr = answers.map((_, index) => {
    if (index !== correctAnswerIndex) return index
  })
  wrongAnswerIndexArr = wrongAnswerIndexArr.filter((item) => item != null)

  const numberToRemove = Math.floor(wrongAnswerIndexArr.length / 2)
  const shuffledArray = shuffleArr(wrongAnswerIndexArr)
  shuffledArray.slice(0, numberToRemove)

  answers.forEach((_, index) => {
    if (wrongAnswerIndexArr.includes(index)) {
      answers.splice(index, 1)
    }
  })

  // update correct answer index
  for (let i = 0; i < answers.length; i++) {
    if (answers[i] == correctAnswerText) {
      correctAnswerIndex = i
    }
  }

  return answers
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

function disableOptions() {
  // in case the user chooses the same correct answer and get multiple scores
  options.forEach((option) => {
    option.style.pointerEvents = "none"
  })
}

// timer https://medium.com/weekly-webtips/creating-a-precise-countdown-with-vanilla-js-cdc44c0483fa
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
          wrongAnswerDiv.textContent = wrongAnswerNum
          checkWrongAnswerNum()

          if (wrongAnswerNum < 3) {
            await getQuestion()
            renderQuestions(questionText, shownOptions)
          }
        }
      })
    }
  }, 1000)

  renderCountdown(remainingSeconds)
}

// event hanlders
async function handleStartBtnClick() {
  await getQuestion()
  renderQuestions(questionText, shownOptions)
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
    pauseTimerBtn.textContent = "Pause timer 0 / 1"
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
  bestScoreSpan.textContent = bestScore
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

async function handleContinueBtnClick(e) {
  nextQdifficultyParam = e.target.innerHTML
  await getQuestion()
  renderQuestions(questionText, shownOptions)
  if (!isDeleteAnswerUsed) {
    cutHalfWrongButton.disabled = false
  }

  if (!isPauseUsed) {
    pauseTimerBtn.disabled = false
  }

  nextDifficultyChoser.style.display = "none"
}

async function handleCutWrongBtnClick() {
  cutHalfWrongButton.disabled = true
  if (!isDeleteAnswerUsed) {
    isDeleteAnswerUsed = true
    // cut half wrong answer
    const res = cutHalfWrongAnswers(shownOptions)
    renderQuestions(questionText, res)
    cutHalfWrongButton.textContent = `Cut half wrong answers 0 / 1`
  }
}

// utils
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArr(array) {
  let currentIndex = array.length,
    randomIndex

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}
