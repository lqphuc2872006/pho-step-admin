<template>
  <div class="container-fluid py-5">
    <h1 class="fs-4 fw-bold text-primary mb-5">Quản Lý Phiếu Giảm Giá</h1>

    <div class="card shadow-sm border-0 p-4 mb-4">
      <div class="filter-section mb-4">
        <div class="filters-and-search d-flex flex-wrap align-items-center gap-3">
          <CInputGroup class="flex-grow-1">
            <CFormInput
              v-model="searchQuery"
              placeholder="Nhập vào tên phiếu muốn tìm..."
              @keyup.enter="filterAndSearchCoupons"
              class="custom-input"
            />
          </CInputGroup>

          <CFormSelect v-model="filterCouponType" class="custom-select flex-grow-1">
            <option value="">Loại phiếu (Tất cả)</option>
            <option v-for="type in couponTypes" :key="type.value" :value="type.value">
              {{ type.text }}
            </option>
          </CFormSelect>

          <CFormSelect v-model="filterDiscountType" class="custom-select flex-grow-1">
            <option value="">Loại giảm giá (Tất cả)</option>
            <option v-for="type in discountTypes" :key="type.value" :value="type.value">
              {{ type.text }}
            </option>
          </CFormSelect>

          <CFormInput
            type="datetime-local"
            v-model="filterStartDate"
            class="custom-input flex-grow-1"
          />
          <CFormInput
            type="datetime-local"
            v-model="filterEndDate"
            class="custom-input flex-grow-1"
          />

          <CButton
            class="btn-primary ms-auto"
            @click="filterAndSearchCoupons"
          >
            <CIcon icon="cilSearch" class="me-2" /> Tìm kiếm
          </CButton>
          <CButton
            class="btn-outline-secondary"
            @click="refreshList"
          >
            <CIcon icon="cilReload" class="me-2" /> Làm mới
          </CButton>
        </div>
      </div>

      <div class="mb-4">
        <CButton
          class="btn-primary me-2"
          @click="createCoupon"
        >+ Thêm phiếu giảm giá</CButton>
      </div>

      <div class="loading-spinner" id="loadingSpinner" v-if="loadingTable"></div>

      <div
        id="phieu-giam-gia-container"
        class="table-container"
        :class="{ 'loading-overlay': loadingTable }"
      >
        <table class="custom-table">
          <thead>
            <tr>
              <th class="text-center">STT</th>
              <th class="text-center">Mã phiếu giảm giá</th>
              <th class="text-center">Tên phiếu giảm giá</th>
              <th class="text-center">Loại phiếu giảm giá</th>
              <th class="text-center">Loại giảm giá</th>
              <th class="text-end">Giá trị giảm</th>
              <th class="text-end">Hóa đơn tối thiểu</th>
              <th class="text-end">Giảm tối đa</th>
              <th class="text-center">Ngày bắt đầu</th>
              <th class="text-center">Ngày kết thúc</th>
              <th class="text-center status-cell">Trạng thái</th>
              <th class="text-center action-cell">Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="coupons.length === 0">
              <td colspan="12" class="text-center py-4">Không có phiếu giảm giá nào để hiển thị.</td>
            </tr>
            <tr v-for="(coupon, index) in coupons" :key="coupon.id">
              <td class="text-center">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
              <td class="text-center">{{ coupon.maPhieuGiamGia }}</td>
              <td class="text-center">{{ coupon.tenPhieuGiamGia }}</td>
              <td class="text-center">
                <span
                  :class="mapLoaiApDungClass(coupon.loaiApDung)"
                >
                  {{ mapLoaiApDungText(coupon.loaiApDung) }}
                </span>
              </td>
              <td class="text-center">{{ mapLoaiGiamGiaText(coupon.loaiGiamGia) }}</td>
              <td class="text-end">{{ formatCurrency(coupon.giaTriGiam, coupon.loaiGiamGia) }}</td>
              <td class="text-end">{{ formatCurrency(coupon.hoaDonToiThieu, 'SO_TIEN') }}</td>
              <td class="text-end">{{ formatCurrency(coupon.soTienGiamToiDa, 'SO_TIEN') }}</td>
              <td class="text-center">{{ formatDate(coupon.ngayBatDau) }}</td>
              <td class="text-center">{{ formatDate(coupon.ngayKetThuc) }}</td>
              <td class="text-center status-cell">
                <span
                  :class="mapTrangThaiClass(coupon.tenTrangThai)"
                >
                  {{ mapTrangThaiText(coupon.tenTrangThai) }}
                </span>
              </td>
              <td class="text-center action-cell">
                <CButton
                  class="btn-outline-primary btn-sm ms-1 px-2 py-1"
                  @click="openEditCouponModal(coupon)"
                >
                  <CIcon icon="cil-pencil" />
                </CButton>
                <CButton
                  class="btn-outline-danger btn-sm ms-1 px-2 py-1"
                  @click="deleteCoupon(coupon.id)"
                >
                  <CIcon icon="cil-trash" />
                </CButton>
                <CButton
                  class="btn-outline-info btn-sm ms-1 px-2 py-1"
                  @click="viewCouponDetails(coupon.id)"
                >
                  <CIcon icon="cil-list" />
                </CButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <CPagination align="center" class="mt-4">
        <CPaginationItem :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          Trước
        </CPaginationItem>
        <CPaginationItem
          v-for="page in safeTotalPages"
          :key="page"
          :active="page === currentPage"
          @click="changePage(page)"
        >
          {{ page }}
        </CPaginationItem>
        <CPaginationItem :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
          Sau
        </CPaginationItem>
      </CPagination>
    </div>

    <CModal :visible="showViewDetailsModal" @close="showViewDetailsModal = false" size="lg">
      <CModalHeader class="bg-primary text-white">
        <CModalTitle>Chi tiết phiếu giảm giá</CModalTitle>
        <CButtonClose @click="showViewDetailsModal = false" class="text-white" />
      </CModalHeader>
      <CModalBody v-if="viewingCoupon">
        <div class="row">
          <div class="col-md-6">
            <p><strong>Mã phiếu:</strong> {{ viewingCoupon.maPhieuGiamGia }}</p>
            <p><strong>Tên phiếu:</strong> {{ viewingCoupon.tenPhieuGiamGia }}</p>
            <p><strong>Loại phiếu:</strong> {{ mapLoaiApDungText(viewingCoupon.loaiApDung) }}</p>
            <p><strong>Loại giảm giá:</strong> {{ mapLoaiGiamGiaText(viewingCoupon.loaiGiamGia) }}</p>
            <p>
              <strong>Giá trị giảm:</strong>
              {{ formatCurrency(viewingCoupon.giaTriGiam, viewingCoupon.loaiGiamGia) }}
            </p>
          </div>
          <div class="col-md-6">
            <p>
              <strong>Giá trị đơn hàng tối thiểu:</strong>
              {{ formatCurrency(viewingCoupon.hoaDonToiThieu, 'SO_TIEN') }}
            </p>
            <p>
              <strong>Giá trị giảm tối đa:</strong>
              {{ formatCurrency(viewingCoupon.soTienGiamToiDa, 'SO_TIEN') }}
            </p>
            <p><strong>Ngày bắt đầu:</strong> {{ formatDate(viewingCoupon.ngayBatDau) }}</p>
            <p><strong>Ngày kết thúc:</strong> {{ formatDate(viewingCoupon.ngayKetThuc) }}</p>
            <p>
              <strong>Trạng thái:</strong>
              <span :class="mapTrangThaiClass(viewingCoupon.tenTrangThai)">
                {{ mapTrangThaiText(viewingCoupon.tenTrangThai) }}
              </span>
            </p>
          </div>
        </div>
        <div
          v-if="
            viewingCoupon.loaiApDung === 'KH_CU_THE' &&
            viewingCoupon.customerIds &&
            viewingCoupon.customerIds.length > 0
          "
        >
          <h6 class="mt-4 fw-bold">Khách hàng áp dụng:</h6>
          <ul class="list-unstyled">
            <li v-for="custId in viewingCoupon.customerIds" :key="custId">
              {{ getCustomerNameById(custId) }} (ID: {{ custId }})
            </li>
          </ul>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton
          class="btn-secondary"
          @click="showViewDetailsModal = false"
        >Đóng</CButton>
      </CModalFooter>
    </CModal>

    <EditCouponModal
      :visible="showEditModal"
      :couponData="selectedCoupon"
      @close="showEditModal = false"
      @updated="handleCouponUpdated"
    />
  </div>
</template>

<script>
import { CIcon } from '@coreui/icons-vue'
import * as icon from '@coreui/icons'
import { CFormSelect } from '@coreui/vue'
import { inject, watch } from 'vue'
import axios from 'axios'
import EditCouponModal from './EditCouponModal.vue'

export default {
  name: 'PhieuGiamGia',
  components: {
    CIcon,
    CFormSelect,
    EditCouponModal,
  },
  setup() {
    const toast = inject('$toast')
    return { toast }
  },
  data() {
    return {
      searchQuery: '',
      filterCouponType: '',
      filterDiscountType: '',
      filterStartDate: '',
      filterEndDate: '',
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      coupons: [],
      allCoupons: [],
      showEditModal: false,
      selectedCoupon: null,
      showViewDetailsModal: false,
      viewingCoupon: null,
      allCustomers: [],
      loadingTable: false,
      couponTypes: [
        { value: 'TOAN_BO', text: 'Công khai' },
        { value: 'KH_CU_THE', text: 'Khách hàng cụ thể' },
      ],
      discountTypes: [
        { value: 'PHAN_TRAM', text: 'Phần trăm' },
        { value: 'SO_TIEN_CO_DINH', text: 'Số tiền cố định' },
      ],
      trangThaiTypes: [
        { value: 'CHUA_DIEN_RA', text: 'Chưa diễn ra' },
        { value: 'DANG_DIEN_RA', text: 'Đang diễn ra' },
        { value: 'DA_KET_THUC', text: 'Đã kết thúc' },
      ],
      pollingInterval: null,
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.pageSize)
    },
    safeTotalPages() {
      return Math.max(1, this.totalPages || 1)
    },
  },
  mounted() {
    this.loadAllCustomers()
    this.loadAllCoupons()
    this.startPolling()
  },
  unmounted() {
    this.stopPolling()
  },
  watch: {
    searchQuery() {
      this.currentPage = 1
      this.filterAndSearchCoupons()
    },
    filterCouponType() {
      this.currentPage = 1
      this.filterAndSearchCoupons()
    },
    filterDiscountType() {
      this.currentPage = 1
      this.filterAndSearchCoupons()
    },
    filterStartDate() {
      this.currentPage = 1
      this.filterAndSearchCoupons()
    },
    filterEndDate() {
      this.currentPage = 1
      this.filterAndSearchCoupons()
    },
  },
  methods: {
    mapLoaiApDungText(value) {
      const type = this.couponTypes.find((t) => t.value === value)
      return type ? type.text : value
    },
    mapLoaiApDungClass(value) {
      if (value === 'TOAN_BO') return 'badge bg-primary'
      if (value === 'KH_CU_THE') return 'badge bg-info'
      return 'badge bg-secondary'
    },
    mapLoaiGiamGiaText(value) {
      const type = this.discountTypes.find((t) => t.value === value)
      return type ? type.text : value
    },
    mapTrangThaiText(value) {
      const type = this.trangThaiTypes.find((t) => t.value === value)
      return type ? type.text : value
    },
    mapTrangThaiClass(value) {
      if (value === 'DANG_DIEN_RA') return 'badge bg-success'
      if (value === 'CHUA_DIEN_RA') return 'badge bg-secondary'
      if (value === 'DA_KET_THUC') return 'badge bg-danger'
      return 'badge bg-secondary'
    },

    async loadAllCoupons() {
      this.loadingTable = true
      try {
        const response = await axios.get('http://localhost:8080/api/phieu-giam-gia', {
          params: { page: 0, size: 1000, sort: 'ngayTao,desc' }
        })
        this.allCoupons = response.data.content
        this.filterAndSearchCoupons()
      } catch (error) {
        console.error('Lỗi khi tải phiếu giảm giá:', error)
        if (this.toast) {
          this.toast.error(`Không thể tải phiếu giảm giá: ${error.response?.data?.message || error.message}`)
        }
        this.allCoupons = []
        this.coupons = []
        this.totalItems = 0
      } finally {
        this.loadingTable = false
      }
    },

    filterAndSearchCoupons() {
      let filtered = [...this.allCoupons]

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase()
        filtered = filtered.filter(c =>
          c.tenPhieuGiamGia?.toLowerCase().includes(q) ||
          c.maPhieuGiamGia?.toLowerCase().includes(q)
        )
      }

      if (this.filterCouponType) {
        filtered = filtered.filter(c => c.loaiApDung === this.filterCouponType)
      }
      if (this.filterDiscountType) {
        filtered = filtered.filter(c => c.loaiGiamGia === this.filterDiscountType)
      }
      if (this.filterStartDate) {
        const start = new Date(this.filterStartDate)
        filtered = filtered.filter(c => new Date(c.ngayBatDau) >= start)
      }
      if (this.filterEndDate) {
        const end = new Date(this.filterEndDate)
        filtered = filtered.filter(c => new Date(c.ngayKetThuc) <= end)
      }

      this.totalItems = filtered.length
      const startIndex = (this.currentPage - 1) * this.pageSize
      const endIndex = startIndex + this.pageSize
      this.coupons = filtered.slice(startIndex, endIndex)
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.filterAndSearchCoupons()
      }
    },

    refreshList() {
      this.searchQuery = ''
      this.filterCouponType = ''
      this.filterDiscountType = ''
      this.filterStartDate = ''
      this.filterEndDate = ''
      this.currentPage = 1
      this.filterAndSearchCoupons()
    },

    async loadAllCustomers() {
      try {
        const response = await axios.get('http://localhost:8080/api/khach-hang')
        this.allCustomers = response.data
      } catch (error) {
        console.error('Lỗi khi tải danh sách khách hàng:', error)
        if (this.toast) {
          this.toast.error('Không thể tải danh sách khách hàng')
        }
      }
    },
    getCustomerNameById(customerId) {
      const customer = this.allCustomers.find((c) => c.id === customerId)
      return customer ? customer.tenKhachHang : 'Không tìm thấy'
    },

    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.loadAllCoupons()
      }, 300000)
    },
    stopPolling() {
      clearInterval(this.pollingInterval)
    },

    createCoupon() {
      this.$router.push({ name: 'ThemPhieuGiamGia' })
    },
    openEditCouponModal(coupon) {
      this.selectedCoupon = coupon
      this.showEditModal = true
    },
    handleCouponUpdated() {
      this.showEditModal = false
      this.selectedCoupon = null
      this.loadAllCoupons()
    },
    async viewCouponDetails(couponId) {
      if (!couponId) {
        if (this.toast) {
          this.toast.error('Không thể tải chi tiết phiếu: ID không hợp lệ')
        }
        return
      }
      this.loadingTable = true
      try {
        const response = await axios.get(`http://localhost:8080/api/phieu-giam-gia/${couponId}`)
        this.viewingCoupon = response.data
        this.showViewDetailsModal = true
      } catch (error) {
        console.error('Lỗi khi tải chi tiết phiếu:', error)
        if (this.toast) {
          this.toast.error(`Không thể tải chi tiết phiếu: ${error.response?.data?.message || error.message}`)
        }
      } finally {
        this.loadingTable = false
      }
    },
    async deleteCoupon(couponId) {
      if (!confirm('Bạn có chắc chắn muốn xóa phiếu giảm giá này không?')) return
      this.loadingTable = true
      try {
        await axios.delete(`http://localhost:8080/api/phieu-giam-gia/${couponId}`)
        if (this.toast) {
          this.toast.success('Xóa phiếu giảm giá thành công!')
        }
        await this.loadAllCoupons()
      } catch (error) {
        console.error('Lỗi khi xóa phiếu:', error)
        if (this.toast) {
          this.toast.error(`Không thể xóa phiếu: ${error.response?.data?.message || error.message}`)
        }
      } finally {
        this.loadingTable = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return '---'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    },
    formatCurrency(value, type) {
      if (value === null || value === undefined) {
        if (type === 'SO_TIEN_CO_DINH') return 'Không giới hạn'
        return '---'
      }
      if (type === 'PHAN_TRAM') return `${value}%`
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency', currency: 'VND',
        minimumFractionDigits: 0, maximumFractionDigits: 0,
      }).format(value)
    },
  },
  icons: {
    ...icon,
  },
}
</script>

<style scoped>
.container-fluid {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f5f7fb;
  min-height: 100vh;
}

.card {
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  border: none;
  background-color: #ffffff;
}

.text-primary {
  color: #0052cc !important;
}

.filter-section {
  background-color: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
}

.filters-and-search {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.custom-input,
.custom-select {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.custom-input:focus,
.custom-select:focus {
  border-color: #0052cc;
  box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
  outline: none;
}

.btn-primary {
  background-color: #0052cc;
  border-color: #0052cc;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #003d99;
  border-color: #003d99;
}

.btn-outline-secondary {
  border-color: #d1d5db;
  color: #374151;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.btn-outline-primary {
  border-color: #0052cc;
  color: #0052cc;
  border-radius: 6px;
}

.btn-outline-primary:hover {
  background-color: #e6f0ff;
}

.btn-outline-danger {
  border-color: #dc2626;
  color: #dc2626;
  border-radius: 6px;
}

.btn-outline-danger:hover {
  background-color: #fee2e2;
}

.btn-outline-info {
  border-color: #0284c7;
  color: #0284c7;
  border-radius: 6px;
}

.btn-outline-info:hover {
  background-color: #e0f2fe;
}

.btn-secondary {
  background-color: #6b7280;
  border-color: #6b7280;
  border-radius: 8px;
  color: #ffffff;
}

.btn-secondary:hover {
  background-color: #4b5563;
  border-color: #4b5563;
}

.table-container {
  position: relative;
  overflow-x: auto;
  border-radius: 8px;
  background-color: #ffffff;
}

.loading-overlay {
  opacity: 0.5;
  pointer-events: none;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0052cc;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1100px;
}

.custom-table th,
.custom-table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.custom-table th {
  background-color: #0052cc;
  color: #ffffff;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}

.custom-table tbody tr:hover {
  background-color: #f9fafb;
}

.custom-table tbody tr:last-child td {
  border-bottom: none;
}

.custom-table th:first-child,
.custom-table td:first-child {
  border-top-left-radius: 8px;
}
.custom-table th:last-child,
.custom-table td:last-child {
  border-top-right-radius: 8px;
}
.custom-table tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}
.custom-table tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
}

.badge {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.bg-primary { background-color: #0052cc; color: #ffffff; }
.bg-success { background-color: #059669; color: #ffffff; }
.bg-danger { background-color: #dc2626; color: #ffffff; }
.bg-info { background-color: #0284c7; color: #ffffff; }
.bg-secondary { background-color: #6b7280; color: #ffffff; }

.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-cell .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.CModalHeader {
  background-color: #0052cc;
  color: #ffffff;
  border-radius: 8px 8px 0 0;
}

.CModalTitle {
  color: #ffffff;
  font-weight: 600;
}

.CButtonClose {
  color: #ffffff;
}

.CModalFooter .btn {
  min-width: 80px;
  font-size: 0.9rem;
}

.page-item .page-link {
  color: #0052cc;
  border-color: #e5e7eb;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin: 0 0.25rem;
}

.page-item.active .page-link {
  background-color: #0052cc;
  border-color: #0052cc;
  color: #ffffff;
}

.page-item.disabled .page-link {
  color: #9ca3af;
}

@media (max-width: 992px) {
  .filters-and-search {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-and-search > * {
    width: 100%;
  }

  .filters-and-search .ms-auto {
    margin-left: 0 !important;
  }

  .custom-table th,
  .custom-table td {
    padding: 0.75rem;
    font-size: 0.85rem;
  }

  .action-cell .btn {
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .container-fluid {
    padding: 1rem;
  }

  .card {
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .filter-section {
    padding: 1rem;
  }

  .custom-input,
  .custom-select {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .custom-table th,
  .custom-table td {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .action-cell .btn {
    padding: 0.15rem 0.3rem;
    font-size: 0.7rem;
  }
}
</style>