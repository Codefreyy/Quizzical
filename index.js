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
let currentQuestionObj
let questionCategrory
let questionDifficulty
let questionText
let currentScore = 0
let bestScore = 0
let wrongAnswerNum = 0
let correctAnswerNum = 0
let correctAnswerIndex
let currentQuesitonDifficulty
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
  // todo: must input username
  // while (!username) {
  //   console.log("init")
  username = prompt("Please input username...")
  // }
  usernameSpan.innerHTML = username
  if (localStorage.getItem(username)) {
    bestScoreSpan.innerHTML = localStorage.getItem(username)
    bestScore = localStorage.getItem(username)
  }

  leaderBoard = JSON.parse(localStorage.getItem("leaderBoard"))

  startButton.addEventListener("click", () => {
    getQuestion()
    resetStatus()
    leaderBoardSection.style.display = "none"
    startButton.style.display = "none"
    cutHalfWrongButton.disabled = false
    pauseTimerBtn.disabled = false
    quitButton.disabled = false
  })

  pauseTimerBtn.addEventListener("click", () => {
    console.log("pause timer")
    if (!isPauseUsed) {
      isPauseUsed = true
      clearInterval(timer)
      pauseTimerBtn.innerHTML = "Pause timer 0 / 1"
      pauseTimerBtn.disabled = true

      setTimeout(() => {
        console.log("timer start again!!!!")
        startCountdown(remainingSeconds)
        pauseTimerBtn.innerText = "Pause timer 0 / 0"
      }, 60 * 1000)
    }
  })

  quitButton.addEventListener("click", () => {
    alert("Game over")
    bestScore = Math.max(bestScore, currentScore)
    bestScoreSpan.innerHTML = bestScore
    localStorage.setItem(username, bestScore)

    const storedBoard = JSON.parse(localStorage.getItem("leaderBoard"))

    if (
      !storedBoard ||
      !storedBoard.find((item) => item.username == username)
    ) {
      console.log({ leaderBoard })
      if (!leaderBoard) {
        leaderBoard = [{ username, score: bestScore }]
      } else {
        leaderBoard.push({ username, score: bestScore })
      }
      localStorage.setItem("leaderBoard", JSON.stringify(leaderBoard))
    } else if (bestScore == currentScore) {
      console.log("renew")
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
  })

  nextQuestionButton.addEventListener("click", getQuestion)
  cutHalfWrongButton.addEventListener("click", () => {
    cutHalfWrongButton.disabled = true
    if (!isDeleteAnswerUsed) {
      isDeleteAnswerUsed = true
      // cut half wrong answer
      const cutRes = cutHalfWrongAnswers(shownAnswerOptions, correctAnswerIndex)
      if (!cutRes) return
      correctAnswerIndex = cutRes.correctIndexInShuffled
      shownAnswerOptions = cutRes.shuffledAnswers
      renderQuestions(questionText, shownAnswerOptions)
      cutHalfWrongButton.innerHTML = `Cut half wrong answers 0 / 1`
      listenAnswerChoice()
    }
  })
}

init()

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
  console.log("start countdown")

  timer = setInterval((_) => {
    console.log(1)
    if (remainingSeconds > 0) {
      remainingSeconds--
      renderCountdown(remainingSeconds)
      setTimeout(() => {
        // alert after dom updated to 0
        if (remainingSeconds == 0) {
          wrongAnswerNum += 1
          wrongAnswerDiv.innerHTML = wrongAnswerNum
          checkWrongAnswerNum()

          if (wrongAnswerNum < 3) {
            getQuestion()
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
  currentQuestionObj = questionsArr[0]
  console.log({ currentQuestionObj })
  questionCategory = currentQuestionObj.category
  questionCategrory = currentQuestionObj?.category
  questionDifficulty = currentQuestionObj?.difficulty
  const answers = Object.values(currentQuestionObj.answers)
  shownAnswerOptions = answers.filter((item) => item !== null) // all options
  questionText = currentQuestionObj.question

  Object.values(currentQuestionObj.correct_answers).forEach((item, index) => {
    if (item == "true") {
      correctAnswerIndex = index
    }
  })

  // render the question and answers
  renderQuestions(questionText, shownAnswerOptions)
  listenAnswerChoice()
  cutHalfWrongButton.disabled = false
  pauseTimerBtn.disabled = false
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

function toggleOptionStatus(disableThem = true) {
  if (!disableThem) {
    options.forEach((option) => {
      option.style.pointerEvents = "auto"
    })
  } else {
    // in case the user chooses the same correct answer and get multiple scores
    options.forEach((option) => {
      option.style.pointerEvents = "none"
    })
  }
}

function handleAnswerClick(optionIndex) {
  clearInterval(timer)
  console.log("clear interval")
  // const optionIndex = e.target.dataset.index
  const correctOption = document.getElementById(correctAnswerIndex)
  const userChosenOption = document.getElementById(optionIndex)
  toggleOptionStatus()
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
      console.log("renew")
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
    startButton.innerHTML = "Start Again"
    startButton.style.display = "block"
    pauseTimerBtn.disabled = true
    cutHalfWrongButton.disabled = true
    quitButton.disabled = true
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

  currentQuestionObj = {}
  shownAnswerOptions = []

  cutHalfWrongButton.disabled = true
  pauseTimerBtn.disabled = true
  startButton.style.display = "block"
  startButton.innerHTML = "Start Game"
  questionCategoryDiv.style.display = "none"
  quitButton.disabled = true
  questionCategrory = ""
  questionDifficulty = ""
  currentScore = 0
  currentScoreContainer.innerHTML = 0
  wrongAnswerNum = 0
  wrongAnswerDiv.innerHTML = 0
  console.log({ wrongAnswerDiv })
  correctAnswerNum = 0
  correctAnswerDiv.innerHTML = 0
  correctAnswerIndex = 0
  currentQuesitonDifficulty = ""
  nextQuestionButton.style.display = "none"
  cutHalfWrongButton.innerHTML = "Cut half wrong answers 1 / 1"
  isDeleteAnswerUsed = false
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
  console.log({ questionCategoryDiv })
  questionTextContainer.innerHTML =
    questionText + ` (${currentQuestionObj.difficulty})`
  for (let i = 0; i < answers.length; i++) {
    const option = document.createElement("div")
    option.setAttribute("class", "option")
    option.setAttribute("id", i)
    option.setAttribute("role", "button")
    option.setAttribute("data-index", i)
    option.innerText = answers[i]
    optionsContainer.appendChild(option)
  }
}

function cutHalfWrongAnswers(answers, correctIndex) {
  if (!answers || !answers.length) return
  if (answers.length == 2) {
    answers = answers.filter((answer, index) => {
      return index == correctIndex
    })
  }

  const wrongAnswers = answers.filter((_, index) => index !== correctIndex)

  console.log({ wrongAnswers }, { answers }, { correctIndex })

  const numberToRemove = Math.floor(wrongAnswers.length / 2)
  const optionsToRemove = []

  while (optionsToRemove.length < numberToRemove) {
    const randomIndex = Math.floor(Math.random() * wrongAnswers.length)
    if (!optionsToRemove.includes(randomIndex)) {
      optionsToRemove.push(randomIndex)
    }
  }

  optionsToRemove.forEach((index) => {
    wrongAnswers.splice(index, 1)
  })

  const mergedAnswers = [...wrongAnswers, answers[correctIndex]]
  const shuffledAnswers = mergedAnswers.sort(() => Math.random() - 0.5)

  const correctIndexInShuffled = shuffledAnswers.indexOf(answers[correctIndex])

  return { shuffledAnswers, correctIndexInShuffled }
}

function renderLeaderBoard() {
  leaderBoardOl.innerHTML = ""
  if (!leaderBoard || !leaderBoard?.length) {
    return
  }

  leaderBoardSection.style.display = "block"

  leaderBoard.sort((a, b) => b.score - a.score)

  const displayBoard = leaderBoard.slice(0, 11)

  console.log({ displayBoard })

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
