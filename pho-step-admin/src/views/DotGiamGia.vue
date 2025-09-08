<template>
  <div class="container-fluid py-5">
    <h1 class="fs-4 fw-bold text-primary mb-5">Quản Lý Đợt Giảm Giá</h1>

    <div class="card shadow-sm border-0 p-4 mb-4">
      <div class="filter-section mb-4">
        <div class="filters-and-search d-flex flex-wrap align-items-center gap-3">
          <CInputGroup class="flex-grow-1">
            <CFormInput
              v-model="searchQuery"
              placeholder="Nhập vào tên đợt muốn tìm..."
              @keyup.enter="filterAndSearchCampaigns"
              class="custom-input"
            />
          </CInputGroup>

          <CFormSelect v-model="filterStatus" class="custom-select flex-grow-1">
            <option value="">Trạng thái (Tất cả)</option>
            <option value="Đang diễn ra">Đang diễn ra</option>
            <option value="Đã kết thúc">Đã kết thúc</option>
          </CFormSelect>

          <CButton
            class="btn-primary ms-auto"
            @click="filterAndSearchCampaigns"
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
  <RouterLink
    to="them-dot-giam-gia"
    class="btn btn-primary me-2"
  >+ Thêm đợt giảm giá</RouterLink>
</div>

      <div class="loading-spinner" id="loadingSpinner" v-if="loadingTable"></div>

      <div
        id="dot-giam-gia-container"
        class="table-container"
        :class="{ 'loading-overlay': loadingTable }"
      >
        <table class="custom-table">
          <thead>
            <tr>
              <th class="text-center">STT</th>
              <th class="text-center">Mã đợt giảm giá</th>
              <th class="text-center">Tên đợt giảm giá</th>
              <th class="text-end">Giá trị</th>
              <th class="text-center">Thời gian bắt đầu</th>
              <th class="text-center">Thời gian kết thúc</th>
              <th class="text-center status-cell">Trạng thái</th>
              <th class="text-center action-cell">Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="campaigns.length === 0">
              <td colspan="8" class="text-center py-4">Không có đợt giảm giá nào để hiển thị.</td>
            </tr>
            <tr v-for="(campaign, index) in paginatedCampaigns" :key="campaign.maDotGiamGia">
              <td class="text-center">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
              <td class="text-center">{{ campaign.maDotGiamGia }}</td>
              <td class="text-center">{{ campaign.tenDotGiamGia }}</td>
              <td class="text-end">{{ campaign.giaTri }}%</td>
              <td class="text-center">{{ formatDate(campaign.thoiGianBatDau) }}</td>
              <td class="text-center">{{ formatDate(campaign.thoiGianKetThuc) }}</td>
              <td class="text-center status-cell">
                <span :class="mapTrangThaiClass(campaign.trangThai)">
                  {{ campaign.trangThai }}
                </span>
              </td>
              <td class="text-center action-cell">
                <CButton
                  class="btn-outline-primary btn-sm ms-1 px-2 py-1"
                  @click="editCampaign(campaign)"
                >
                  <CIcon icon="cil-pencil" />
                </CButton>
                <CButton
                  class="btn-outline-danger btn-sm ms-1 px-2 py-1"
                  @click="deleteCampaign(campaign)"
                >
                  <CIcon icon="cil-trash" />
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
          v-for="page in totalPages"
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
  </div>
</template>

<script>
import { CIcon } from '@coreui/icons-vue';
import * as icon from '@coreui/icons';
import { CFormSelect, CButton, CInputGroup, CFormInput, CPagination, CPaginationItem } from '@coreui/vue';
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'DotGiamGia',
  components: {
    CIcon,
    CFormSelect,
    CButton,
    CInputGroup,
    CFormInput,
    CPagination,
    CPaginationItem,
  },
  setup() {
    const toast = inject('$toast');
    const router = useRouter();
    return { toast, router };
  },
  data() {
    return {
      searchQuery: '',
      filterStatus: '',
      currentPage: 1,
      pageSize: 10,
      originalCampaigns: [],
      campaigns: [],
      loadingTable: false,
      trangThaiTypes: [
        { value: 'Đang diễn ra', text: 'Đang diễn ra' },
        { value: 'Đã kết thúc', text: 'Đã kết thúc' },
      ],
      pollingInterval: null,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.campaigns.length / this.pageSize);
    },
    paginatedCampaigns() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.campaigns.slice(start, start + this.pageSize);
    },
  },
  mounted() {
    this.loadCampaigns();
    this.startPolling();
  },
  unmounted() {
    this.stopPolling();
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
      this.filterAndSearchCampaigns();
    },
    filterStatus() {
      this.currentPage = 1;
      this.filterAndSearchCampaigns();
    },
  },
  methods: {
    async loadCampaigns() {
      this.loadingTable = true;
      try {
        const response = await axios.get('/api/dot-giam-gia');
        this.originalCampaigns = response.data;
        this.filterAndSearchCampaigns();
      } catch (error) {
        console.error('Lỗi khi tải đợt giảm giá:', error);
        if (this.toast) {
          this.toast.error(`Không thể tải đợt giảm giá: ${error.message || 'Lỗi không xác định'}`);
        }
        this.originalCampaigns = [];
        this.campaigns = [];
      } finally {
        this.loadingTable = false;
      }
    },
    filterAndSearchCampaigns() {
      let filtered = [...this.originalCampaigns];

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(campaign =>
          (campaign.tenDotGiamGia != null && String(campaign.tenDotGiamGia).toLowerCase().includes(query)) ||
          (campaign.maDotGiamGia != null && String(campaign.maDotGiamGia).toLowerCase().includes(query))
        );
      }

      if (this.filterStatus) {
        filtered = filtered.filter(campaign => campaign.trangThai === this.filterStatus);
      }

      this.campaigns = filtered;
      this.currentPage = 1;
    },
    refreshList() {
      this.searchQuery = '';
      this.filterStatus = '';
      this.loadCampaigns();
      if (this.toast) {
        this.toast.info('Đã làm mới danh sách đợt giảm giá.');
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    editCampaign(campaign) {
      if (this.toast) {
        this.toast.info(`Bạn đã chọn sửa đợt giảm giá: ${campaign.tenDotGiamGia}`);
      }
      this.router.push({ name: 'EditDotGiamGia', params: { id: campaign.maDotGiamGia } });
    },
    async deleteCampaign(campaign) {
      if (!confirm(`Bạn có chắc muốn xóa đợt giảm giá "${campaign.tenDotGiamGia}" không?`)) return;
      this.loadingTable = true;
      try {
        await axios.delete(`/api/dot-giam-gia/${campaign.maDotGiamGia}`);
        if (this.toast) {
          this.toast.success(`Đã xóa đợt giảm giá: ${campaign.tenDotGiamGia}`);
        }
        await this.loadCampaigns();
      } catch (error) {
        console.error('Lỗi khi xóa đợt giảm giá:', error);
        if (this.toast) {
          this.toast.error(`Không thể xóa đợt giảm giá: ${error.message || 'Lỗi không xác định'}`);
        }
      } finally {
        this.loadingTable = false;
      }
    },
    mapTrangThaiClass(value) {
      if (value === 'Đang diễn ra') return 'badge bg-success';
      if (value === 'Đã kết thúc') return 'badge bg-danger';
      return 'badge bg-secondary';
    },
    formatDate(dateString) {
      if (!dateString) return '---';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    },
    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.loadCampaigns();
      }, 300000);
    },
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
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

.bg-success { background-color: #059669; color: #ffffff; }
.bg-danger { background-color: #dc2626; color: #ffffff; }
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