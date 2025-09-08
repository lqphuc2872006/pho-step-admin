<template>
  <div class="main-container">
    <div class="form-card">
      <div class="form-header">
        <h1>Thêm Phiếu Giảm Giá Mới</h1>
      </div>
      <div class="form-body">
        <div class="form-group">
          <label class="form-label">Mã phiếu giảm giá</label>
          <div class="input-with-button">
            <input v-model="coupon.maPhieuGiamGia" type="text" class="form-control" />
            <button class="btn btn-secondary ms-2" @click="generateCode">Tự sinh</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Tên phiếu giảm giá</label>
          <input v-model="coupon.tenPhieuGiamGia" type="text" class="form-control" />
        </div>

        <div class="form-group">
          <label class="form-label">Loại giảm giá</label>
          <select v-model="coupon.loaiGiamGia" class="form-select" @change="handleLoaiGiamGiaChange">
            <option disabled value="">-- Chọn --</option>
            <option value="PHAN_TRAM">Phần trăm</option>
            <option value="SO_TIEN_CO_DINH">Số tiền cố định</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">{{ labelGiaTriGiam }}</label>
          <input v-model.number="coupon.giaTriGiam" type="number" class="form-control" />
        </div>

        <div class="form-group" v-if="coupon.loaiGiamGia === 'PHAN_TRAM'">
          <label class="form-label">Số tiền giảm tối đa</label>
          <input v-model.number="coupon.soTienGiamToiDa" type="number" class="form-control" />
        </div>

        <div class="form-group">
          <label class="form-label">Hoá đơn tối thiểu</label>
          <input v-model.number="coupon.hoaDonToiThieu" type="number" class="form-control" />
        </div>

        <div class="form-group">
          <label class="form-label">Ngày bắt đầu</label>
          <input v-model="coupon.ngayBatDau" type="datetime-local" class="form-control" />
        </div>

        <div class="form-group">
          <label class="form-label">Ngày kết thúc</label>
          <input v-model="coupon.ngayKetThuc" type="datetime-local" class="form-control" />
        </div>

        <div class="form-group">
          <label class="form-label">Loại áp dụng</label>
          <select v-model="coupon.loaiApDung" class="form-select" @change="handleLoaiApDungChange">
            <option disabled value="">-- Chọn --</option>
            <option value="TOAN_BO">Toàn bộ</option>
            <option value="KH_CU_THE">Khách hàng cụ thể</option>
          </select>
        </div>

        <div v-if="showCustomerTable" class="form-group">
          <h5 class="mt-4">Chọn khách hàng áp dụng</h5>
          <div class="table-responsive">
            <table class="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Chọn</th>
                  <th>Tên khách hàng</th>
                  <th>Email</th>
                  <th>SĐT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="kh in customers" :key="kh.id">
                  <td>
                    <input type="checkbox" v-model="selectedCustomers" :value="kh.id" />
                  </td>
                  <td>{{ kh.tenKhachHang }}</td>
                  <td>{{ kh.email }}</td>
                  <td>{{ kh.soDienThoai }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="form-actions mt-4 text-end">
          <button class="btn btn-cancel me-2" @click="closeModal">Hủy</button>
          <button class="btn btn-submit" @click="submitForm">
            Thêm Phiếu Giảm Giá
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { inject } from 'vue';

export default {
  name: 'AddCouponPage',
  emits: ['close-modal', 'coupon-added'],
  setup() {
    const toast = inject('$toast');
    return { toast };
  },
  data() {
    return {
      coupon: {
        maPhieuGiamGia: "",
        tenPhieuGiamGia: "",
        giaTriGiam: null,
        hoaDonToiThieu: null,
        soTienGiamToiDa: null,
        ngayBatDau: "",
        ngayKetThuc: "",
        loaiGiamGia: "",
        loaiApDung: "",
      },
      customers: [],
      selectedCustomers: [],
      showCustomerTable: false,
    };
  },
  computed: {
    labelGiaTriGiam() {
      return this.coupon.loaiGiamGia === "SO_TIEN_CO_DINH"
        ? "Giá trị giảm (VND)"
        : "Giá trị giảm (%)";
    },
  },
  mounted() {
    this.resetForm();
  },
  methods: {
    closeModal() {
      this.$emit('close-modal');
    },
    resetForm() {
      this.coupon = {
        maPhieuGiamGia: "",
        tenPhieuGiamGia: "",
        giaTriGiam: null,
        hoaDonToiThieu: null,
        soTienGiamToiDa: null,
        ngayBatDau: "",
        ngayKetThuc: "",
        loaiGiamGia: "",
        loaiApDung: "",
      };
      this.selectedCustomers = [];
      this.showCustomerTable = false;
    },
    generateCode() {
      this.coupon.maPhieuGiamGia =
        "PGG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    },
    handleLoaiGiamGiaChange() {
      if (this.coupon.loaiGiamGia === "SO_TIEN_CO_DINH") {
        this.coupon.soTienGiamToiDa = null;
      }
    },
    handleLoaiApDungChange() {
      if (this.coupon.loaiApDung === "KH_CU_THE") {
        this.showCustomerTable = true;
        this.fetchCustomers();
      } else {
        this.showCustomerTable = false;
        this.selectedCustomers = [];
      }
    },
    async fetchCustomers() {
      try {
        const res = await axios.get("http://localhost:8080/api/khach-hang");
        this.customers = Array.isArray(res.data)
          ? res.data
          : res.data.content || [];
      } catch (err) {
        this.toast.error("Lỗi tải danh sách khách hàng!");
        console.error("Lỗi tải khách hàng:", err);
      }
    },
    validateForm() {
      if (!this.coupon.maPhieuGiamGia.trim()) {
        this.toast.error("Mã phiếu giảm giá không được để trống!");
        return false;
      }
      if (!this.coupon.tenPhieuGiamGia.trim()) {
        this.toast.error("Tên phiếu giảm giá không được để trống!");
        return false;
      }
      if (!this.coupon.loaiGiamGia) {
        this.toast.error("Vui lòng chọn loại giảm giá!");
        return false;
      }
      if (this.coupon.loaiGiamGia === "PHAN_TRAM") {
        if (
          !this.coupon.giaTriGiam ||
          this.coupon.giaTriGiam <= 0 ||
          this.coupon.giaTriGiam > 100
        ) {
          this.toast.error("Giá trị giảm phải từ 1 đến 100 (%)!");
          return false;
        }
        if (!this.coupon.soTienGiamToiDa || this.coupon.soTienGiamToiDa <= 0) {
          this.toast.error("Số tiền giảm tối đa phải lớn hơn 0!");
          return false;
        }
      }
      if (this.coupon.loaiGiamGia === "SO_TIEN_CO_DINH") {
        if (!this.coupon.giaTriGiam || this.coupon.giaTriGiam <= 0) {
          this.toast.error("Giá trị giảm (VND) phải lớn hơn 0!");
          return false;
        }
      }
      if (this.coupon.hoaDonToiThieu !== null && this.coupon.hoaDonToiThieu < 0) {
        this.toast.error("Hóa đơn tối thiểu không được nhỏ hơn 0!");
        return false;
      }
      if (!this.coupon.ngayBatDau || !this.coupon.ngayKetThuc) {
        this.toast.error("Vui lòng chọn ngày bắt đầu và ngày kết thúc!");
        return false;
      }
      if (this.coupon.ngayBatDau >= this.coupon.ngayKetThuc) {
        this.toast.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!");
        return false;
      }
      return true;
    },
    async submitForm() {
      if (!this.validateForm()) return;
      try {
        const formatDateTime = (dt) => (dt ? dt + ":00" : null);
        const dataToSend = {
          ...this.coupon,
          ngayBatDau: formatDateTime(this.coupon.ngayBatDau),
          ngayKetThuc: formatDateTime(this.coupon.ngayKetThuc),
          customerIds: this.selectedCustomers,
        };
        const res = await axios.post(
          "http://localhost:8080/api/phieu-giam-gia/create",
          dataToSend, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 201) {
          this.toast.success("Thêm phiếu giảm giá thành công!");
          this.$emit('coupon-added');
        }
      } catch (err) {
        let errorMessage = "Đã xảy ra lỗi khi thêm phiếu giảm giá.";
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        this.toast.error(errorMessage);
        console.error("Lỗi thêm phiếu:", err.response || err);
      }
    },
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.form-card {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.form-header h1 {
  text-align: center;
  color: #333;
  font-size: 24px;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: bold;
  color: #555;
  margin-bottom: 8px;
}

.form-control,
.form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}

.input-with-button {
  display: flex;
  gap: 10px;
}

.input-with-button .form-control {
  flex-grow: 1;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #ffffff;
  white-space: nowrap;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #5a6268;
}

.btn-cancel {
  background-color: #D3D3D3;
  border-color: #D3D3D3;
  color: #000000;
  padding: 10px 20px;
  border-radius: 6px;
}

.btn-submit {
  background-color: #8B0000;
  border-color: #8B0000;
  color: #FFFFFF;
  padding: 10px 20px;
  border-radius: 6px;
}

.btn-submit:hover {
  filter: brightness(1.1);
}

.table-responsive {
  max-height: 200px;
  overflow-y: auto;
}

.table-responsive table {
  width: 100%;
}
</style>
