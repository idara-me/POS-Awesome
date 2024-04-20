
<template>
  <div class="boxed">
    <div class="orders-layout">
      <div class="orders scroll">
        <span class="order-item" :class="[table.occupied ? 'failed' : 'completed']" v-for="table in tables"
          :key="table.name" @click="changePage('Dine In', table.name)">
          <div class="order-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
              style="width: 100%; height: auto;">
              <path fill="currentColor"
                d="M18.06 23h1.66c.84 0 1.53-.65 1.63-1.47L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26c1.44 1.42 2.43 2.89 2.43 5.29zM1 22v-1h15.03v1c0 .54-.45 1-1.03 1H2c-.55 0-1-.46-1-1m15.03-7C16.03 7 1 7 1 15zM1 17h15v2H1z" />
            </svg>
          </div>

          <div class="order-body">
            <h3 class="order-title">{{ table.name }}</h3>
          </div>

          <span class="order-status">{{ table.occupied ? "Occupied" : "Free" }}</span>
        </span>
      </div>

      <div class="actions">
        <span class="btn-takeaway" @click="changePage('Take Away', '')">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
              style="width: 100%; height: auto;">
              <path fill="currentColor"
                d="M5.26 11h13.48l-.67 9H5.93zM9 4h5.97L19 7.38l1.59-1.59L22 7.21L19.21 10H4.79L2 7.21L3.41 5.8L5 7.38z" />
            </svg>

            <h3 class="btn-text">Take Away</h3>
          </div>
        </span>
        <span class="btn-drive2ru" @click="changePage('Drive 2ru', '')">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
              style="width: 100%; height: auto;">
              <path fill="currentColor"
                d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01l-1.97 5.67c-.07.21-.11.43-.11.66v7.16c0 .83.67 1.5 1.5 1.5S6 19.33 6 18.5V18h12v.5c0 .82.67 1.5 1.5 1.5c.82 0 1.5-.67 1.5-1.5v-7.16c0-.22-.04-.45-.11-.66zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15m11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5M5 10l1.27-3.82c.14-.4.52-.68.95-.68h9.56c.43 0 .81.28.95.68L19 10z" />
            </svg>

            <h3 class="btn-text">Drive 2ru</h3>
          </div>
        </span>
      </div>
    </div>
  </div>
</template>


<script>
import { evntBus } from "../../bus";

export default {
  data: function () {
    return {
      pos_profile: "",
      tables: []
    };
  },

  components: {
  },

  methods: {
    changePage(order_type, table) {
      evntBus.$emit("set_order_type", order_type)
      evntBus.$emit("set_table", table)
      evntBus.$emit('set_is_table_view', false)
    },
    get_table_names() {
      const vm = this;
      
      frappe.call({
        method: 'posawesome.posawesome.api.posapp.get_table_names_ui',
       callback: function (r) {
          if (r.message) {
            vm.tables = r.message;
          }
        },
      });
    },
  },

  computed: {
  },

  mounted: function () {
    this.get_table_names()
  },
  beforeDestroy() {
  },
};
</script>

<style lang="scss" scoped>
.boxed {
  width: 100%;
  height: 100%;
  margin-left: 0;
  margin-right: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
  }

  .orders-layout {
    display: grid;
    grid-template-columns: 80% 300px;
    padding: 10px;
    height: 100%;

    @media (max-width: 768px) {
      grid-template-columns: 100%;
    }

    .orders {
      display: grid;
      grid-template-columns: 24% 24% 24% 24%;
      grid-template-rows: 90px;
      align-content: start;
      gap: 10px;
      grid-row: 1 / 2;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 0;

      @media (max-width: 768px) {
        grid-template-columns: 100%;
      }
    }

    .actions {
      padding: 0 0 0 0;
      display: grid;
      grid-template-columns: 100%;
      align-items: center;
      gap: 10px;

      .btn-takeaway,
      .btn-drive2ru {
        font-size: 1.4rem;
        font-weight: 500;
        text-align: center;
        text-decoration: none;
        height: 100%;
        display: flex;
        box-shadow: rgba(24, 17, 17, 0.1) 0px 4px 12px;
        border-radius: 5px;

        .btn-icon {
          font-size: 4rem;
        }

        .btn-text {
          font-size: 1.2rem;
          font-weight: 600;
        }

        div {
          margin: auto;
        }
      }

      .btn-takeaway {
        background-color: #4793af;
        color: #fff;

        &:hover {
          background-color: #3b8ca9;
        }
      }

      .btn-drive2ru {
        background-color: #003c43;
        color: #fff;

        &:hover {
          background-color: #033035;
        }
      }
    }
  }
}

.order-item {
  --item-color: var(--text);
  --item-border: var(--border);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  border: 2px solid var(--item-border);
  height: 90px;
  text-decoration: none;

  .order-icon {
    border: 2px solid var(--item-border);
    color: var(--item-color);
    padding: 5px;
    width: 40px;
    min-width: 40px;
    height: 40px;
    min-height: 40px;
    margin-right: 10px;
    border-radius: 5px;
  }

  .order-body {
    .order-title {
      font-size: 18px;
      font-weight: bold;
      color: var(--item-color);
      margin-bottom: 5px;
    }

    .order-time {
      font-size: 14px;
      color: var(--muted);
      display: flex;
      align-items: center;

      .time-icon {
        margin-right: 5px;
        margin-left: 5px;
      }
    }
  }

  .order-status {
    font-size: 14px;
    font-weight: 600;
    margin-left: 10px;
    text-transform: capitalize;
    color: var(--item-color);
    margin-left: auto;
  }

  &.pending {
    --item-border: var(--border);
    --item-color: var(--text);
  }

  &.processing {
    --item-border: var(--primary);
    --item-color: var(--primary);
  }

  &.completed {
    --item-border: var(--success);
    --item-color: var(--success);
  }

  &.delayed {
    --item-border: var(--warning);
    --item-color: var(--warning);
  }

  &.failed {
    --item-border: var(--danger);
    --item-color: var(--danger);
  }
}</style>

