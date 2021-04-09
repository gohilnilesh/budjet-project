// BUDGET CONTROLLER

var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };
Expense.prototype.calcPercentage = function (TotalIncome) {
    if (TotalIncome > 0){
        this.percentage = Math.round((this.value / TotalIncome) * 100);

    }
    else{
        this.percentage = -1;
    }
};
Expense.prototype.getPercentage = function () {
    return this.percentage;
}


    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }; 

    var  data = {
        allitems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allitems[type].forEach(function (cur) {
            sum = sum + cur.value; // sum += cur.value;
        });

        data.totals[type] = sum;
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            // create an ID unique ID
            //[1 2 3 4 5] = next id is 6
            // [1 2 4 6 8] = next id is 9
            // Id  = last id + 1

            // Create A New ID
            if (data.allitems[type].length > 0) {
                ID = data.allitems[type][data.allitems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // create new item based on 'inc' or 'exp' type.
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push data into data structure
            data.allitems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        calculateBudget: function () {

            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;


            // calculate the percentage
           if(data.totals.inc>0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

            }else {
                data.percentage = -1;
            }
            // expense = 200 and income = 100 so perc= 200/100 = 0.5 * 100 
        },
        calculatePercentage : function (){

            data.allitems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentage : function () {
          var Per =   data.allitems.exp.map(function(cur){
              return cur.getPercentage();
          });
          return Per;


        },



        deleteItem : function (type, id) {
            var ids, index;

           ids =  data.allitems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allitems[type].splice(index,1);
            }
        },


          getBudget: function () {
              return{
                  budget : data.budget,
                  TotalIncome: data.totals.inc,
                  TotalExpenses : data.totals.exp,
                  percentage : data.percentage
              };

          },

        testing: function () {
            console.log(data);
        }
    };
})();




// UI CONTROLLER
var UIController = (function () {


    var DOMString = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputvalue: '.add__value',
        InputBtn: '.add__btn',
        IncomeContainer: '.income__list',
        ExpenseContainer: '.expenses__list',
        BudgetLabel: '.budget__value',
        IncomeLabel: '.budget__income--value',
        ExpensesLabel : '.budget__expenses--value',
        PercentageLabel: '.budget__expenses--percentage',
        container: '.container',
        ExpensesPercLabel : '.item__percentage',
        yearLabel : '.budget__title--year'


    };
   var  formatNumber = function (num, type){
        var numSplit, int, dec,type;
        /*
        1. 2345.4567 --> 2,345.46
        '-' or '+' based on the type
         */

        num = Math.abs(num);
        num = num.toFixed(2);

        // add "," separator
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            // 2345
           int =  int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3);
            //input 23456 so output is 23,456
        }

        dec = numSplit[1];

        // add + or - sign
        return (type === 'exp' ? '-' : '+') + ' ' + int +'.' +  dec;

    };
    
    var nodelistForEach = function (list, callback) {
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };


    return {
        getinput: function () {
            return {
                type: document.querySelector(DOMString.inputType).value, // will be inc or exp
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputvalue).value)

            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create a HTML String

            if (type === 'inc') {
                element = DOMString.IncomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'exp') {
                element = DOMString.ExpenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // replace the string with actual data received by obj
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            // insert the HTML in the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function () {
            var fields, FieldsArr;

            fields = document.querySelectorAll(DOMString.inputDescription + ', ' + DOMString.inputvalue);

            FieldsArr = Array.prototype.slice.call(fields);

            FieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            FieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type === 'inc' : 'exp';
            document.querySelector(DOMString.BudgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMString.IncomeLabel).textContent = formatNumber(obj.TotalIncome,'inc');
            document.querySelector(DOMString.ExpensesLabel).textContent = formatNumber(obj.TotalExpenses,'exp');
           
            
           if(obj.percentage > 0) {
            document.querySelector(DOMString.PercentageLabel).textContent = obj.percentage + '%';

           }else {
            document.querySelector(DOMString.PercentageLabel).textContent = '---';
           }

        },

        deleteList: function (SelectorID) {
            var el =  document.getElementById(SelectorID);

          el.parentNode.removeChild(el);


        },
        displayPercentages : function (percentages) {

           var fields =  document.querySelectorAll(DOMString.ExpensesPercLabel);


           nodelistForEach(fields, function (current, index){
               if(percentages[index] > 0){
                current.textContent = percentages[index] + '%';

               }else{
                current.textContent = '---';
               }

           })
        },
        displayYear: function() {
            var now,month,months,date, year;

            now = new Date();
            date = now.getDate();
            year = now.getFullYear();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMString.yearLabel).textContent = date +' - '+ months[month]+ ' - '+ year;

        },
        changeColor: function () {

            var fields = document.querySelectorAll(
                DOMString.inputType + ',' +
                DOMString.inputDescription + ',' + 
                DOMString.inputvalue
            );
            nodelistForEach(fields, function(cur){
                cur.classList.toggle('red-focus');

            });

            document.querySelector(DOMString.InputBtn).classList.toggle('red');
        },

        getDOMStrings: function () {
            return DOMString;
        }

    };
})();








// GLOBAL APP CONTROLLER
var Controller = (function (budgetCtrl, UIctrl) {

    var setupEventListener = function () {
        var DOM = UIctrl.getDOMStrings();
        document.querySelector(DOM.InputBtn).addEventListener('click', CtrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                CtrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteitem);

        document.querySelector(DOM.inputType).addEventListener('change',UIctrl.changeColor);
    };

    


    var updatebudget = function () {
        // 1. Calculate the Budget
        budgetCtrl.calculateBudget();

        // 2. Return The Budget
        var budget = budgetCtrl.getBudget();


        // 3. Display the budgt in UI
        UIctrl.displayBudget(budget);

    };

    var updatePercentages = function () {
        //1. Calculate the percentage
        budgetCtrl.calculatePercentage();

        //2.Read percentage from the budget controller
       var percentages =  budgetCtrl.getPercentage();


        //3. Update the budget with New Percentage
       UIctrl.displayPercentages(percentages);

    };


    var CtrlAddItem = function () {

        var input, newItem;
        // 1. get the field input data
        input = UIctrl.getinput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item in UI
            UIctrl.addListItem(newItem, input.type);

            //4. clear the input fields
            UIctrl.clearFields();

            // 5.update budget
            updatebudget();
            //6. update and calculate Percentages
            updatePercentages();
        }    
    };



    var  ctrlDeleteitem =  function (event) {
        var itemID, splitID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            //'inc-1'
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);    

            //1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. delete the item from the ui
            UIctrl.deleteList(itemID);

            //3. update and show the budget
            updatebudget();

            //4. update and calculate Percentages
              updatePercentages();
        }

      };

    return {
        init: function () {
            console.log('Application Has Started.');
            UIctrl.displayYear();
            UIctrl.displayBudget({
                budget : 0,
                TotalIncome: 0,
                TotalExpenses : 0,
                percentage : -1
            });

            setupEventListener();
        }
    }
})(budgetController, UIController);

Controller.init();
