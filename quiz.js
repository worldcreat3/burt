let questions = []
let answers = {}
let revealed = {}

let generating = false
let lastRequest = 0
const REQUEST_DELAY = 3000

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

const prompt = `
Create ${numQ} multiple-choice questions about ${topic}.
Difficulty: ${diff}.

Return ONLY valid JSON.
No explanations, no markdown.

Format:
[
{
"question":"text",
"options":["A","B","C","D"],
"answer":0,
"explanation":"short explanation"
}
]
`

try{

const res = await fetch(
"https://burtcoza.lkaisoleo.workers.dev",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({ prompt })
}
)

if(!res.ok){
throw new Error("API error: " + res.status)
}

const data = await res.json()

console.log("Full response:", data)

const text = data?.choices?.[0]?.message?.content || ""

if(!text){
throw new Error("Empty AI response")
}

const clean = text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim()

try{
questions = JSON.parse(clean)
}catch(e){
console.error("Bad AI output:", clean)
throw new Error("AI did not return valid JSON")
}

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
