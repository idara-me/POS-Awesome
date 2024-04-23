<template>
  <div>
    <v-autocomplete
      dense
      clearable
      auto-select-first
      outlined
      color="primary"
      :label="frappe._('Order Type')"
      v-model="order_type"
      :items="order_types"
      item-text="name"
      item-value="name"
      background-color="white"
      :no-data-text="__('Order Type not found')"
      hide-details
      :disabled="readonly"
    >
      <template v-slot:item="data">
        <template>
          <v-list-item-content>
            <v-list-item-title
              class="primary--text subtitle-1"
              v-html="data.item.name"
            ></v-list-item-title>
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
    order_types: [
      { name: "Dine In" },
      { name: "Drive 2ru" },
      { name: "Take Away" },
    ],
    order_type: '',
    readonly: true,
  }),

  components: {
  },

  methods: {
  },

  computed: {},

  created: function () {
    this.$nextTick(function () {
      evntBus.$on('set_order_type', (order_type) => {
        this.order_type = order_type;
      });
      evntBus.$on('set_order_type_readonly', (value) => {
        this.readonly = value;
      });
    });
  },

  watch: {
    order_type() {
      evntBus.$emit('update_order_type', this.order_type);
    },
  },
};
</script>
