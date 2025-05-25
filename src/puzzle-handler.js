// src/puzzle-handler.js
import { $, shuffleArray, delay, playSound } from './helpers.js'
import { generateRandomPuzzle, generateQuestionAndAnswer } from './puzzle-factory.js'
import { getPuzzleSvg } from './svg-factory.js'
import { translatePuzzle, translateQA } from './translator.js'

const progressBar = $('.answer-progress-bar')
const inputElement = $('.answer-input')

// set 10-second timer and 8 squares per puzzle
let puzzleTime = 10
let puzzleAmount = 8

// handles generating puzzle and returning result
export async function doPuzzle(){
    // reset from previous run
    $('.answer-section').classList.add('hidden')
    $(".number-container").innerHTML = ''

    // Generate squares and puzzles
    const squares = [...Array(puzzleAmount).keys()].map(i => {
        let square = document.createElement('div')
        square.id = `square-${i+1}`
        square.className = 'square'
        $('#number-container').appendChild(square)
        return square
    })
    const puzzles = [...Array(puzzleAmount)].map(() => generateRandomPuzzle())
    
    // generate numbers and display
    const nums = shuffleArray([...Array(puzzleAmount)].map((_, i) => i+1))
    await displayNumbers(nums)

    const metronome = playSound('assets/metronome.mp3')

    // clear and focus input window
    $('.answer-section').classList.remove('hidden')
    inputElement.value = ''
    inputElement.focus()

    // activate time remaining countdown bar
    progressBar.style.transition = ``
    progressBar.classList.remove('answer-progress-bar-shrink')
    await delay(0.1)
    progressBar.style.transition = `width ${puzzleTime*1000}ms linear`
    progressBar.classList.add('answer-progress-bar-shrink')

    // display puzzle in squares
    squares.forEach((square, i) => {
        square.style.backgroundColor = puzzles[i].colors['background']
        square.innerHTML = getPuzzleSvg(puzzles[i])
    })

    // generate and display question
    const [question, answer] = generateQuestionAndAnswer(nums, puzzles)
    $('.answer-question').textContent = question.toUpperCase()

    return new Promise((resolve) => {
        // resolve on Enter
        inputElement.addEventListener("keyup", (event) => {
            if (event.keyCode === 13) {
                metronome.pause()
                resolve([inputElement.value, answer])
            }
        });
        // resolve on timeout
        delay(puzzleTime).then(() => {
            metronome.pause()
            resolve([null, answer])
        });
    });
}

async function displayNumbers(numbers){
    numbers.forEach((n, i) =>
      $('#square-' + (i+1)).innerHTML =
        `<div class="big-numbers can-shrink" id="num-${i+1}">${n}</div>`
    )

    await delay(1.5)
    numbers.forEach(n => $('#num-' + (n)).classList.add('number-shrink'))
    await delay(1.5)
}

// slider inputs still present but fixed at one value
const timeRange = $('#speed-control')
const puzzleRange = $('#puzzle-control')
timeRange.addEventListener('input', () => puzzleTime = $('.time-display').textContent = timeRange.value)
puzzleRange.addEventListener('input', () => puzzleAmount = $('.puzzle-display').textContent = parseInt(puzzleRange.value))
