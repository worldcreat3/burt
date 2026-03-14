let questions = []
let answers = {}
let revealed = {}

let generating = false
let lastRequest = 0
const REQUEST_DELAY = 3000 // 3 seconds between requests

async function generate(){

if(generating) return

const now = Date.now()
if(now - lastRequest < REQUEST_DELAY){
alert("Please wait a few seconds before generating again.")
return
}

const topic = document.getElementById("topic").value.trim()

if(!topic){
alert("Enter a topic")
return
}

const numQ = document.getElementById("numQ").value
const diff = document.getElementById("diff").value
const quiz = document.getElementById("quiz")
const btn = document.getElementById("generateBtn")

generating = true
lastRequest = now
btn.disabled = true

quiz.innerHTML = "Generating..."

const prompt = `Create ${numQ} multiple-choice questions about ${topic}.
Difficulty: ${diff}.
Return ONLY a JSON array.
Each object must contain:
question:string
options:array of 4 strings
answer:index 0-3
explanation:short sentence.`

try{

const res = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[{parts:[{text:prompt}]}]
})
}
)

if(!res.ok){
throw new Error("API error: " + res.status)
}

const data = await res.json()

const text =
data?.candidates?.[0]?.content?.parts?.[0]?.text || ""

const clean = text.replace(/```json|```/g,"").trim()

questions = JSON.parse(clean)

answers = {}
revealed = {}

render()

}catch(err){

quiz.innerHTML =
"<div style='color:red'>Failed to generate questions. Try again.</div>"

console.error(err)

}finally{

generating = false
btn.disabled = false

}

}

function render(){

let correct = 0
let answered = Object.keys(revealed).length

Object.keys(revealed).forEach(i=>{
if(answers[i] == questions[i].answer) correct++
})

let html = ""

if(answered > 0){
html += `<div class="score">
<span>Score</span>
<b>${correct}/${answered}</b>
</div>`
}

questions.forEach((q,i)=>{

html += `<div class="card">
<b>${q.question}</b>`

q.options.forEach((opt,j)=>{

let cls = "option"

if(revealed[i]){
if(j === q.answer) cls += " correct"
else if(answers[i] === j) cls += " wrong"
}

html += `<div class="${cls}" onclick="pick(${i},${j})">${opt}</div>`

})

if(revealed[i]){
html += `<div class="explanation">${q.explanation}</div>`
}else if(answers[i] !== undefined){
html += `<button onclick="reveal(${i})">Check Answer</button>`
}

html += `</div>`

})

document.getElementById("quiz").innerHTML = html

}

function pick(q,o){

if(revealed[q]) return

answers[q] = o
render()

}

function reveal(q){

revealed[q] = true
render()

}