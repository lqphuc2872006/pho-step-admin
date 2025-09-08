<template>
  <CModal v-model:visible="localVisible" alignment="center" size="lg" scrollable>
    <CModalHeader>
      <CModalTitle>Sửa Phiếu Giảm Giá</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <div class="p-3">
        <div class="mb-3">
          <label class="form-label">Mã phiếu giảm giá</label>
          <input v-model="form.maPhieuGiamGia" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Tên phiếu giảm giá</label>
          <input v-model="form.tenPhieuGiamGia" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Loại giảm giá</label>
          <select
            v-model="form.loaiGiamGia"
            class="form-select"
            @change="handleLoaiGiamGiaChange"
          >
            <option disabled value="">-- Chọn --</option>
            <option value="PHAN_TRAM">Phần trăm</option>
            <option value="SO_TIEN_CO_DINH">Số tiền cố định</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">{{ labelGiaTriGiam }}</label>
          <input
            v-model.number="form.giaTriGiam"
            type="number"
            class="form-control"
          />
        </div>

        <div class="mb-3" v-if="form.loaiGiamGia === 'PHAN_TRAM'">
          <label class="form-label">Số tiền giảm tối đa</label>
          <input
            v-model.number="form.soTienGiamToiDa"
            type="number"
            class="form-control"
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Hoá đơn tối thiểu</label>
          <input
            v-model.number="form.hoaDonToiThieu"
            type="number"
            class="form-control"
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Ngày bắt đầu</label>
          <input
            v-model="form.ngayBatDau"
            type="datetime-local"
            class="form-control"
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Ngày kết thúc</label>
          <input
            v-model="form.ngayKetThuc"
            type="datetime-local"
            class="form-control"
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Loại áp dụng</label>
          <select
            v-model="form.loaiApDung"
            class="form-select"
            @change="handleLoaiApDungChange"
          >
            <option disabled value="">-- Chọn --</option>
            <option value="TOAN_BO">Công khai</option>
            <option value="KH_CU_THE">Khách hàng cụ thể</option>
          </select>
        </div>

        <div v-if="showCustomerTable" class="mb-3">
          <h5>Chọn khách hàng áp dụng</h5>
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
                  <input
                    type="checkbox"
                    v-model="selectedCustomers"
                    :value="kh.id"
                  />
                </td>
                <td>{{ kh.tenKhachHang }}</td>
                <td>{{ kh.email }}</td>
                <td>{{ kh.soDienThoai }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" @click="closeModal">Đóng</CButton>
      <CButton color="primary" @click="updateCoupon">Cập nhật</CButton>
    </CModalFooter>
  </CModal>
</template>

<script>
import axios from "axios";

// Helper functions (giữ nguyên)
function toLocalDateTime(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  return d.toISOString().slice(0, 19);
}
function toInputDateTime(dt) {
  if (!dt) return "";
  return dt.slice(0, 16);
}

export default {
  name: "EditCouponModal",
  props: {
    visible: { type: Boolean, required: true },
    couponData: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      localVisible: this.visible,
      form: {
        id: null,
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
      return this.form.loaiGiamGia === "SO_TIEN_CO_DINH"
        ? "Giá trị giảm (VND)"
        : "Giá trị giảm (%)";
    },
  },
  watch: {
    visible(val) {
      this.localVisible = val;
      if (val && this.couponData) {
        this.form = {
          ...this.couponData,
          ngayBatDau: toInputDateTime(this.couponData.ngayBatDau),
          ngayKetThuc: toInputDateTime(this.couponData.ngayKetThuc),
        };
        this.selectedCustomers = this.couponData.customerIds || [];
        this.showCustomerTable = this.form.loaiApDung === "KH_CU_THE";
      }
    },
    localVisible(val) {
      if (!val) this.$emit("close");
    },
  },
  methods: {
    handleLoaiGiamGiaChange() {
      if (this.form.loaiGiamGia === "SO_TIEN_CO_DINH") {
        this.form.soTienGiamToiDa = null;
      }
    },
    handleLoaiApDungChange() {
      if (this.form.loaiApDung === "KH_CU_THE") {
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
        console.error("Lỗi tải khách hàng:", err);
      }
    },
    closeModal() {
      this.localVisible = false;
    },
    async updateCoupon() {
      // ===== Validate =====
      if (!this.form.maPhieuGiamGia.trim()) {
        alert("Mã phiếu không được để trống");
        return;
      }
      if (!this.form.tenPhieuGiamGia.trim()) {
        alert("Tên phiếu không được để trống");
        return;
      }
      if (this.form.loaiGiamGia === "PHAN_TRAM") {
        if (
          this.form.giaTriGiam == null ||
          this.form.giaTriGiam < 1 ||
          this.form.giaTriGiam > 100
        ) {
          alert("Giá trị giảm phải trong khoảng 1% - 100%");
          return;
        }
        if (
          this.form.soTienGiamToiDa == null ||
          this.form.soTienGiamToiDa <= 0
        ) {
          alert("Số tiền giảm tối đa phải lớn hơn 0");
          return;
        }
      } else if (this.form.loaiGiamGia === "SO_TIEN_CO_DINH") {
        if (this.form.giaTriGiam == null || this.form.giaTriGiam <= 0) {
          alert("Giá trị giảm (VND) phải lớn hơn 0");
          return;
        }
      } else {
        alert("Vui lòng chọn loại giảm giá");
        return;
      }

      if (this.form.hoaDonToiThieu == null || this.form.hoaDonToiThieu <= 0) {
        alert("Hoá đơn tối thiểu phải lớn hơn 0");
        return;
      }

      if (!this.form.ngayBatDau || !this.form.ngayKetThuc) {
        alert("Ngày bắt đầu và kết thúc không được để trống");
        return;
      }
      if (new Date(this.form.ngayKetThuc) <= new Date(this.form.ngayBatDau)) {
        alert("Ngày kết thúc phải sau ngày bắt đầu");
        return;
      }

      // ===== Nếu hợp lệ thì gửi lên BE =====
      try {
        const dataToSend = {
          ...this.form,
          ngayBatDau: toLocalDateTime(this.form.ngayBatDau),
          ngayKetThuc: toLocalDateTime(this.form.ngayKetThuc),
          customerIds: this.selectedCustomers,
        };

        await axios.put(
          `http://localhost:8080/api/phieu-giam-gia/${this.form.id}`,
          dataToSend
        );
        alert("Cập nhật phiếu thành công!");
        this.$emit("updated");
        this.closeModal();
      } catch (err) {
        console.error("Lỗi cập nhật phiếu:", err);
        alert("Không thể cập nhật phiếu!");
      }
    },
  },
  mounted() {
    this.fetchCustomers();
  },
};
</script>


<style scoped>
/* Bạn có thể thêm các style tùy chỉnh tại đây */
</style>
