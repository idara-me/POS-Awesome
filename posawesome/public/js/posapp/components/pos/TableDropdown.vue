<template>
  <div>
    <v-autocomplete
      dense
      clearable
      auto-select-first
      outlined
      color="primary"
      :label="frappe._('Table')"
      v-model="table"
      :items="tables"
      item-text="name"
      item-value="name"
      background-color="white"
      :no-data-text="__('Table not found')"
      hide-details
      :filter="customFilter"
      :disabled="readonly"
    >
      <template v-slot:item="data">
        <template>
          <v-list-item-content>
            <v-list-item-title
              class="primary--text subtitle-1"
              v-html="data.item.name"
            ></v-list-item-title>

            <v-list-item-subtitle
              v-if="data.item.occupied"
              v-html="`Occupied`"
            ></v-list-item-subtitle>

            <v-list-item-subtitle
              v-if="!data.item.occupied"
              v-html="`Free`"
            ></v-list-item-subtitle>
          </v-list-item-content>
        </template>
      </template>
    </v-autocomplete>
    
    <div class="mb-3">
    </div>
  </div>
</template>

<script>
import { evntBus } from '../../bus';
export default {
  data: () => ({
    pos_profile: '',
    tables: [],
    table: '',
    readonly: false,
    table_info: {},
  }),

  components: {
  },

  methods: {
    get_table_names() {
      const vm = this;
      
      if (this.tables.length > 0) {
        return;
      }
      
      if (vm.pos_profile.posa_local_storage && localStorage.table_storage) {
        vm.tables = JSON.parse(localStorage.getItem('table_storage'));
      }

      frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_table_names',
        args: {
          pos_profile: this.pos_profile.pos_profile,
        },
        callback: function (r) {
          if (r.message) {
            vm.tables = r.message;
            console.info('loadTables');
            
            if (vm.pos_profile.posa_local_storage) {
              localStorage.setItem('table_storage', '');
              localStorage.setItem(
                'table_storage',
                JSON.stringify(r.message)
              );
            }
          }
        },
      });
    },
    
    customFilter(item, queryText, itemText) {
      const textOne = item.name
        ? item.name.toLowerCase()
        : '';

      const searchText = queryText.toLowerCase();
      return textOne.indexOf(searchText) > -1;
    },
  },

  computed: {},

  created: function () {
    this.$nextTick(function () {
      evntBus.$on('register_pos_profile', (pos_profile) => {
        this.pos_profile = pos_profile;
        this.get_table_names();
      });
      evntBus.$on('payments_register_pos_profile', (pos_profile) => {
        this.pos_profile = pos_profile;
        this.get_table_names();
      });
      evntBus.$on('set_table', (table) => {
        this.table = table;
      });
      evntBus.$on('set_table_readonly', (value) => {
        this.readonly = value;
      });
      evntBus.$on('fetch_table_details', () => {
        this.get_table_names();
      });
    });
  },

  watch: {
    table() {
      evntBus.$emit('update_table', this.table);
    },
  },
};
</script>
