const URL = "https://expenses.codeschool.cloud";
Vue.createApp({
  data() {
    return {
      expenses: [],
      add_description_input: "",
      add_amount_input: 0,
      add_category_input: "",
      sort_order: "desc",
      search_input: "",

      editing: false,
      editing_expense: {},
      editing_indx: -1,
    };
  },
  methods: {
    //get_expenses: function () {
    //  fetch("data.json").then((response) => {
    //    response.json().then((data) => {
    //      this.expenses = data;
    //    });
    //  });
    //},

    get_expenses: async function () {
      let response = await fetch(`${URL}/expenses`);
      let data = await response.json();
      this.expenses = data;
    },

    clear_search: function () {
      this.search_input = "";
    },

    delete_expense: async function (indx) {
      let request_options = {
        method: "DELETE",
      };

      let response = await fetch(
        `${URL}/expenses/${this.expenses[indx]._id}`,
        request_options
      );

      if (response.status === 205) {
        this.expenses.splice(indx, 1);
      } else {
        alert("Failed to delete expense");
      }
    },

    add_expense: async function () {
      let obj = {
        description: this.add_description_input,
        amount: this.add_amount_input,
        category: this.add_category_input,
      };
      this.add_description_input = "";
      this.add_amount_input = 0;
      this.add_category_input = "";

      let my_headers = new Headers();
      my_headers.append("Content-Type", "application/x-www-form-urlencoded");
      let encoded_data =
        "description=" +
        encodeURIComponent(obj.description) +
        "&amount=" +
        encodeURIComponent(obj.amount) +
        "&category=" +
        encodeURIComponent(obj.category);

      let request_options = {
        method: "POST",
        body: encoded_data,
        headers: my_headers,
      };

      let response = await fetch(`${URL}/expenses`, request_options);

      if (response.status === 201) {
        let data = await response.json();
        this.expenses.push(data);
      } else {
        alert("Failed to add expense");
      }
    },

    edit_expense: function (indx) {
      this.editing = true;
      this.editing_indx = indx;
      this.editing_expense = Object.assign({}, this.expenses[indx]);
    },

    save_expense: async function () {
      let my_headers = new Headers();
      my_headers.append("Content-Type", "application/x-www-form-urlencoded");
      let encoded_data =
        "description=" +
        encodeURIComponent(this.editing_expense.description) +
        "&amount=" +
        encodeURIComponent(this.editing_expense.amount) +
        "&category=" +
        encodeURIComponent(this.editing_expense.category);

      let request_options = {
        method: "PUT",
        body: encoded_data,
        headers: my_headers,
      };

      let expense_id = this.expenses[this.editing_indx]._id;

      let response = await fetch(
        `${URL}/expenses/${expense_id}`,
        request_options
      );
      if (response.status == 204) {
        this.expenses[this.editing_indx].description =
          this.editing_expense.description;
        this.expenses[this.editing_indx].amount = parseFloat(
          this.editing_expense.amount
        );
        this.expenses[this.editing_indx].category =
          this.editing_expense.category;
      } else {
        alert("Failed to save expense");
      }

      this.editing = false;
    },

    sort_expenses: function () {
      if (this.sort_order == "asc") {
        function compare(a, b) {
          if (a.amount > b.amount) {
            return -1;
          }
          if (a.amount < b.amount) {
            return 1;
          }
          return 0;
        }
        this.sort_order = "desc";
      } else {
        function compare(a, b) {
          if (a.amount < b.amount) {
            return -1;
          }
          if (a.amount > b.amount) {
            return 1;
          }
          return 0;
        }
        this.sort_order = "asc";
      }
      this.expenses.sort(compare);
    },
  },
  computed: {
    balance: function () {
      let new_total = 0;
      this.filtered_expenses.forEach((element) => {
        if (element.amount != "") {
          new_total += parseInt(element.amount);
        }
      });
      return new_total;
    },
    filtered_expenses: function () {
      return this.expenses.filter((expense) => {
        return expense.description
          .toLowerCase()
          .includes(this.search_input.toLowerCase());
      });
    },
  },

  created: function () {
    this.get_expenses();
  },
}).mount("#app");
