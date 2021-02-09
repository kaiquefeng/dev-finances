
function isModal() {
  document.querySelector('.modal-overlay')
      .classList.toggle('active')
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances")) || []
  },
  set(transactions) {
    localStorage.setItem("dev.finances", JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },
  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0
    Transaction.all.forEach((transaction) => {
      if( transaction.amount > 0 ) {
        income += transaction.amount
      }

    } )
    return income
  },

  expenses() {
    let expenses = 0
    Transaction.all.forEach((transaction) => {
      if( transaction.amount < 0 ) {
        expenses += transaction.amount
      }

    } )
    return expenses
  },

  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

const Utils = {
  formatAmount(value){
    value = Number(value) * 100

    return value
  },
  formatDate(date) {
    const splittedDate = date.split('-')

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')

    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  }
}

const DOM = {
  transactionContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionContainer.appendChild(tr)

  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
    <td class="info-transaction">
      <p class="description">${transaction.description}</p>
      <p class="${CSSclass}">${amount}</p>
    </td>
    <td class="date">${transaction.date}</td>
    <td class="delete"><span onclick="Transaction.remove(${index})" class="material-icons">delete_outline</span></td>
    `

    return html
  },
  updateBalance() {
    document.querySelector('#incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.querySelector('#expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document.querySelector('#totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },
  clearTransactions() {
    DOM.transactionContainer.innerHTML = ''
  },
  contentTotal() {
    const hiddenValue = document.querySelector('#totalDisplay').innerHTML === 'R$ ---'
    const icon = document.querySelector('.value-total span')

    const incomesValue = document.querySelector('#incomeDisplay')
    const expensesValue = document.querySelector('#expenseDisplay')

    // const itensIncome = document.querySelectorAll('.income')

    if(hiddenValue) {
      document.querySelector('#totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
      incomesValue.innerHTML = Utils.formatCurrency(Transaction.incomes())
      expensesValue.innerHTML = Utils.formatCurrency(Transaction.expenses())

      icon.innerHTML = 'visibility'
    } else {
      document.querySelector('#totalDisplay').innerHTML = 'R$ ---'
      incomesValue.innerHTML = 'R$ ---'
      expensesValue.innerHTML = 'R$ ---'
      
      icon.innerHTML = 'visibility_off'
    }
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues() 
    
    if( description.trim() === '' || amount.trim() === '' || date.trim() === '' ) {
      throw new Error('Por favor, preencha todos os campos')
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues() 

    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields()
      const transaction = Form.formatValues()

      Transaction.add(transaction)

      Form.clearFields()

      isModal()

    } catch (error) {

    }
  }
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)

      Storage.set(Transaction.all)
    })
    DOM.updateBalance()
    
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()