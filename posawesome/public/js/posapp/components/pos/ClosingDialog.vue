<template>
  <v-row justify="center">
    <v-dialog v-model="closingDialog" max-width="900px">
      <v-card>
        <v-card-title>
          <span class="headline primary--text">{{
            __('Closing POS Shift')
          }}</span>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-container>
            <v-row>
              <v-col cols="12" class="pa-1">
                <template>
                  <v-data-table
                    :headers="headers"
                    :items="dialog_data.payment_reconciliation"
                    item-key="mode_of_payment"
                    class="elevation-1"
                    :items-per-page="itemsPerPage"
                    hide-default-footer
                  >
                    <template v-slot:item.closing_amount="props">
                      <v-edit-dialog
                        :return-value.sync="props.item.closing_amount"
                      >
                        {{ formtCurrency(props.item.closing_amount) }}
                        <template v-slot:input>
                          <v-text-field
                            v-model="props.item.closing_amount"
                            :rules="[max25chars]"
                            :label="frappe._('Edit')"
                            single-line
                            counter
                            type="number"
                          ></v-text-field>
                        </template>
                      </v-edit-dialog>
                    </template>
                    <template v-slot:item.difference="{ item }">{{
                      (item.difference = formtCurrency(
                        item.expected_amount - item.closing_amount
                      ))
                    }}</template>
                    <template v-slot:item.opening_amount="{ item }">{{
                      formtCurrency(item.opening_amount)
                    }}</template>
                    <template v-slot:item.expected_amount="{ item }">{{
                      formtCurrency(item.expected_amount)
                    }}</template>
                  </v-data-table>
                </template>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" dark @click="close_dialog">{{
            __('Close')
          }}</v-btn>
          <v-btn color="success" dark @click="submit_dialog">{{
            __('Submit')
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    



    <v-dialog v-model="PosProfiles"  max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline primary--text">{{
            __('Switch POS Profile')
          }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  :items="pos_profiles"
                  :label="frappe._('POS Profile')"
                  v-model="pos_profile"
                ></v-autocomplete>
              </v-col>
              
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          
          <v-spacer></v-spacer>
          <v-btn color="danger" dark @click="close_dialog">close</v-btn> 
          <v-btn color="success" dark @click="submit_dialog1">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-row>
</template>

<script>
import { evntBus } from '../../bus';
export default {
  data: () => ({
    closingDialog: false,
    PosProfiles:false,
    itemsPerPage: 20,
    dialog_data: {},
    company: "Nextash",
    balance_details: 0,
    pos_profiles_data: [],
    pos_profiles: [],
    pos_profile: '',
    payments_method_data: [],
    payments_methods: [],
    headers: [
      {
        text: __('Mode of Payment'),
        value: 'mode_of_payment',
        align: 'start',
        sortable: true,
      },
      {
        text: __('Opening Amount'),
        align: 'end',
        sortable: true,
        value: 'opening_amount',
      },
      {
        text: __('Closing Amount'),
        value: 'closing_amount',
        align: 'end',
        sortable: true,
      },
      {
        text: __('Expected Amount'),
        value: 'expected_amount',
        align: 'end',
        sortable: false,
      },
      {
        text: __('Difference'),
        value: 'difference',
        align: 'end',
        sortable: false,
      },
    ],
    max25chars: (v) => v.length <= 20 || 'Input too long!', // TODO : should validate as number
    pagination: {},
  }),
  watch: {
    pos_profile(val) {
      this.payments_methods = [];
      this.payments_method_data.forEach((element) => {
        if (element.parent === val) {
          this.payments_methods.push({
            mode_of_payment: element.mode_of_payment,
            amount: 0,
          });
        }
      });
    },
  },
  methods: {
    submit_pos_profile() {
      const vm = this;
      frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_opening_dialog_data',
        args: {},
        callback: function (r) {
          if (r.message) {
            r.message.pos_profiles_data.forEach((element) => {
              vm.pos_profiles = r.message.pos_profiles_data;
            });
          }
        },
      });
    },

    get_opening_dialog_data() {
      const vm = this;
      frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_opening_dialog_data',
        args: {},
        callback: function (r) {
          if (r.message) {
            r.message.pos_profiles_data.forEach((element) => {
              vm.pos_profiles.push(element.name);
            });
            vm.payments_method_data = r.message.payments_method;

          }
        },
      });
    },
    new_pos_profile() {
        if(this.dialog_data.pos_profile != this.pos_profile){
        return frappe
          .call(
            'posawesome.posawesome.api.posapp.create_opening_voucher',
            {
              pos_profile: this.pos_profile,
              company : this.dialog_data.company,
              balance_details: this.payments_methods
            }
          )
          .then((r) => {
            if (r.message) {
              evntBus.$emit('open_PosProfiles', r.message);
            } else {
              console.log(r);
            }
            this.PosProfiles = false;
          });
        }
    },

    close_dialog() {
      this.closingDialog = false;
      this.PosProfiles = false;
    },
    submit_dialog() {
      evntBus.$emit('submit_closing_pos', this.dialog_data);
      this.closingDialog = false;
    },
    submit_dialog1() {
    if(this.dialog_data.pos_profile != this.pos_profile){  
      evntBus.$emit('submit_closing_pos', this.dialog_data);
      this.new_pos_profile()
    }else{
      evntBus.$emit('show_mesage', {
              text: `Already Logged In`,
              color: 'error',
            });
      this.PosProfiles = false;
      
    }

    },
    formtCurrency(value) {
      value = parseFloat(value);
      return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },
  },
  created: function () {
    evntBus.$on('open_ClosingDialog', (data) => {
      this.closingDialog = true;
      this.dialog_data = data;
    });

    evntBus.$on('open_PosProfiles', (data) => {
      this.PosProfiles = true;
      this.get_opening_dialog_data()
      this.dialog_data = data;
      // data.pos_profiles_data.forEach((element) => {
      //   this.pos_profiles.push(element.name);
      // });

    });
  }
};
</script>
