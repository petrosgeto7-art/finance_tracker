const api = '/api/transactions'

async function fetchTx() {
  const res = await fetch(api)
  return res.json()
}

function fmtMoney(v) {
  const sign = v >= 0 ? '$' : '-$'
  return sign + Math.abs(v).toFixed(2)
}

function render(txs) {
  const list = document.getElementById('tx-list')
  list.innerHTML = ''
  let income = 0
  let outcome = 0
  txs.forEach(t => {
    const amt = Number(t.amount) || 0
    if (amt >= 0) income += amt
    else outcome += amt
    const li = document.createElement('li')
    li.innerHTML = `
      <div>
        <div>${escapeHtml(t.description)}</div>
        <div class="tx-meta">${t.date}</div>
      </div>
      <div>
        <div class="amount ${amt<0? 'negative':''}">${fmtMoney(amt)}</div>
        <button class="delete" data-id="${t.id}">✕</button>
      </div>`
    list.appendChild(li)
  })
  const total = income + outcome
  document.getElementById('total').textContent = fmtMoney(total)
  document.getElementById('income').textContent = fmtMoney(income)
  document.getElementById('outcome').textContent = fmtMoney(outcome)
  document.getElementById('debt').textContent = fmtMoney(Math.abs(outcome))
  document.querySelectorAll('.delete').forEach(b => b.addEventListener('click', async (e)=>{
    const id = e.target.dataset.id
    await fetch(api + '/' + id, {method:'DELETE'})
    load()
  }))
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
  })[c])
}

async function load(){
  const txs = await fetchTx()
  render(txs)
}

document.getElementById('tx-form').addEventListener('submit', async (e)=>{
  e.preventDefault()
  const description = document.getElementById('description').value
  const amount = document.getElementById('amount').value
  const type = document.getElementById('type').value
  await fetch(api, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({description, amount, type})})
  document.getElementById('tx-form').reset()
  load()
})

load()
