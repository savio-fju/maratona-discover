const Modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active')

        let bntSave = document.getElementById('save')
        let html = `<a onclick="Modal.close()" href="#" class="button cancel">Cancelar</a>
                    <button id="save">Salvar</button>`
        bntSave.innerHTML = html
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active')

        Form.clearFields()
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions",
            JSON.stringify(transactions))

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

        let income = 0;
        //pegar todas as transacoes
        //para cada transacao

        Transaction.all.forEach(transaction => {
            //se ela for maior que zero
            if (transaction.amount > 0) {

                //somar a uma variavel e retornar a variavel
                income += transaction.amount;
            }
        })

        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })

        return expense;
    },

    total() {

        return Transaction.incomes() + Transaction.expenses();

    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
         
         <td id="tb_description" class="description">${transaction.description}</td>
         <td class= "${CSSclass}">${amount}</td>
         <td class="date">${transaction.date}</td>
         <td class="button-td">
            <img id="remove" onclick="Form.removeTransaction(${index})" src="./assets/minus.svg" alt="Remover Transação">
            <img id="edit" onclick="DOM.editTransaction(${index})" src="./assets/editar.svg" alt="Botão Editar">
         </td>
     `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())

        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    negativeTotal() {

        var total = Transaction.total()
        if (total < 0) {
            document
                .querySelector('.total')
                .classList
                .add('negative')
        } else {
            document
                .querySelector('.total')
                .classList
                .remove('negative')
        }

    },

    editTransaction(transaction, index) {
        Modal.open()

        linha = Transaction.all;

        description = linha[transaction].description
        amount = linha[transaction].amount
        date = linha[transaction].date

        amount = amount / 100

        document.getElementById('description').value = description
        document.getElementById('amount').value = amount
        document.getElementById('date').value = date

        DOM.addNewBtn(transaction)
    },

    addNewBtn(transaction) {

        let bntSave = document.getElementById('save')

        let html = `<a onclick="Modal.close()" href="#" class="button cancel">Cancelar</a>
                    <button id="save" onclick="DOM.save(${transaction})">Salvar</button>`
        bntSave.innerHTML = html

    },

    save(transaction) {
        Transaction.remove(transaction)
    },

    wallpaperTransformation() {
        var currentTime = new Date().getHours();
        console.log(currentTime);
        if (6 <= currentTime && currentTime < 8) {
            document.querySelector('.wallpaper').classList.add('amanhecer');

        } else if (8 <= currentTime && currentTime < 16) {
            document.querySelector('.wallpaper').classList.add('dia');

        } else if (16 <= currentTime && currentTime < 18) {
            document.querySelector('.wallpaper').classList.add('por-do-sol');

        } else if (18 <= currentTime && currentTime < 19) {
            document.querySelector('.wallpaper').classList.add('anoitecer');

        } else if (19 <= currentTime && currentTime < 24) {
            document.querySelector('.wallpaper').classList.add('noite');

        } else if (0 <= currentTime && currentTime < 6) {
            document.querySelector('.wallpaper').classList.add('noite');

        }

    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }

}

const $html = document.querySelector('html')
const $checkbox = document.querySelector('#chkbx')

$checkbox.addEventListener('change', function() {
    $html.classList.toggle('dark-mode')
    document.querySelector('.wallpaper').classList.add('noite');

})



const Utils = {
    formatAmount(value) {
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
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

        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }

    },

    removeTransaction(index) {

        var resultado = confirm("Deseja excluir essa transação ?");
        if (resultado == true) {
            Transaction.remove(index)
            alert("Transação foi excluída da tabela!");
        } else {
            alert("Você desistiu de excluir a transação da tabela!");
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

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            // verificar se todas as informações foram preenchidas
            Form.validateFields()

            // formatar os dados para salvar
            const transaction = Form.formatValues()

            // salvar 
            Form.saveTransaction(transaction)

            // apagar os dados do formulario
            Form.clearFields()

            // modal feche
            Modal.close()

        } catch (error) {
            alert(error.message)
        }

    }
}

const App = {
    init() {

        DOM.wallpaperTransformation()

        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)

        DOM.negativeTotal()

    },

    reload() {
        DOM.clearTransactions()
        App.init()
    },
}


App.init()