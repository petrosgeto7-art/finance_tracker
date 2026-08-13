const api = '/api/transactions'

async function fetchTx() {
  const res = await fetch(api)
  return res.json()
}

function fmtMoney(v) {
  return (v>=0? '$' : '-$') + Math.abs(v).toFixed(2)
}

function render(txs) {
  const list = document.getElementById('tx-list')
  list.innerHTML = ''
  let total = 0
  txs.forEach(t => {
    total += t.amount
    const li = document.createElement('li')
    li.innerHTML = `
      <div>
        <div>${escapeHtml(t.description)}</div>
        <div class="tx-meta">${t.date}</div>
      </div>
      <div>
        <div class="amount ${t.amount<0? 'negative':''}">${fmtMoney(t.amount)}</div>
        <button class="delete" data-id="${t.id}">✕</button>
      </div>`
    list.appendChild(li)
  })
  document.getElementById('total').textContent = fmtMoney(total)
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
  await fetch(api, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({description, amount})})
  document.getElementById('tx-form').reset()
  load()
})

load()
