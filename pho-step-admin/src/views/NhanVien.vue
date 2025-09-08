<template>
  <div class="container-fluid py-5 px-lg-5 bg-light-gray">
    <h1 class="fs-2 fw-bold mb-5 text-dark text-center-sm">
      <i class="bi bi-people-fill me-3 text-secondary"></i>Quản Lý Nhân Viên
    </h1>
    <div class="card p-4 p-md-5 shadow-lg border-0 rounded-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div class="input-group search-input-group flex-grow-1 me-md-3">
          <span class="input-group-text bg-white border-end-0 pe-0">
            <i class="bi bi-search text-muted fs-5"></i>
          </span>
          <input
            type="text"
            class="form-control border-start-0 ps-2 py-2"
            placeholder="Tìm kiếm theo tên, mã nhân viên hoặc email..."
            v-model="searchQuery"
            @input="debounceSearch"
          />
        </div>
        <div class="d-flex gap-3 flex-column flex-sm-row w-100 w-md-auto">
          <button @click="openAddModal" class="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2 flex-grow-1">
            <i class="bi bi-plus-circle fs-5"></i> Thêm Nhân Viên
          </button>
          <button class="btn btn-success btn-lg d-flex align-items-center justify-content-center gap-2 flex-grow-1" @click="exportToExcel">
            <i class="bi bi-file-earmark-excel fs-5"></i> Xuất Excel
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-3 text-muted">Đang tải dữ liệu nhân viên...</p>
      </div>

      <div v-else class="table-responsive-lg beautiful-table">
        <table class="table table-hover table-borderless align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-4">ID</th>
              <th scope="col" class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tên Nhân Viên</th>
              <th scope="col" class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Mã Nhân Viên</th>
              <th scope="col" class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Email</th>
              <th scope="col" class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Chức Vụ</th>
              <th scope="col" class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Trạng Thái</th>
              <th scope="col" class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="nhanVien in nhanViens" :key="nhanVien.id" class="table-row-hover">
              <td class="ps-4 text-dark font-weight-bold">{{ nhanVien.id }}</td>
              <td>
                <div class="d-flex px-2 py-1">
                  <div>
                    <img src="https://ui-avatars.com/api/?name=NV&background=0D8ABC&color=fff" class="avatar avatar-sm me-3" alt="user avatar">
                  </div>
                  <div class="d-flex flex-column justify-content-center">
                    <h6 class="mb-0 text-sm">{{ nhanVien.tenNhanVien }}</h6>
                    <p class="text-xs text-muted mb-0">{{ nhanVien.email }}</p>
                  </div>
                </div>
              </td>
              <td><p class="text-xs font-weight-bold mb-0">{{ nhanVien.maNhanVien }}</p></td>
              <td><p class="text-xs font-weight-bold mb-0">{{ nhanVien.email }}</p></td>
              <td>
                <p class="text-xs font-weight-bold mb-0">{{ nhanVien.chucVu?.tenChucVu || 'Chưa có' }}</p>
              </td>
              <td class="align-middle text-sm">
                <div class="form-check form-switch d-inline-block">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="'statusToggle-' + nhanVien.id"
                    :checked="nhanVien.trangThai?.tenTrangThai === 'hoat_dong'"
                    @change="toggleNhanVienStatus(nhanVien)"
                  >
                  <label class="form-check-label ms-2" :for="'statusToggle-' + nhanVien.id">
                    <span
                      :class="{
                        'badge bg-gradient-success': nhanVien.trangThai?.tenTrangThai === 'hoat_dong',
                        'badge bg-gradient-warning text-dark': nhanVien.trangThai?.tenTrangThai === 'nghi_viec',
                        'badge bg-gradient-secondary': !nhanVien.trangThai || nhanVien.trangThai?.tenTrangThai === 'khac'
                      }"
                      class="badge-pill"
                    >
                      {{ formatTrangThai(nhanVien.trangThai?.tenTrangThai) || 'N/A' }}
                    </span>
                  </label>
                </div>
              </td>
              <td class="text-center">
                <button
                  class="btn btn-icon-only btn-rounded btn-outline-warning mb-0 me-2"
                  @click="openEditModal(nhanVien)"
                  title="Sửa"
                >
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button
                  class="btn btn-icon-only btn-rounded btn-outline-danger mb-0"
                  @click="confirmDelete(nhanVien.id)"
                  title="Xóa"
                >
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>
            <tr v-if="!isLoading && nhanViens.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                <i class="bi bi-info-circle fs-4 mb-2 d-block"></i>
                Không tìm thấy nhân viên nào phù hợp với tìm kiếm của bạn.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Paginate
        v-if="totalPages > 1 && !isLoading"
        :page-count="totalPages"
        :page-range="3"
        :margin-pages="2"
        :click-handler="changePage"
        :prev-text="'&lsaquo; Trước'"
        :next-text="'Sau &rsaquo;'"
        :container-class="'pagination justify-content-center mt-5 mb-0'"
        :page-class="'page-item'"
        :page-link-class="'page-link rounded-circle'"
        :prev-class="'page-item'"
        :next-class="'page-item'"
        :prev-link-class="'page-link rounded-pill'"
        :next-link-class="'page-link rounded-pill'"
        :active-class="'active'"
      />
    </div>

    <div
      class="modal fade"
      id="nhanVienModal"
      tabindex="-1"
      aria-labelledby="nhanVienModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-3 shadow-lg">
          <div class="modal-header bg-gradient-primary text-white border-0 py-3 rounded-top-3">
            <h5 class="modal-title fw-bold text-center w-100" id="nhanVienModalLabel">
              <i :class="isEditMode ? 'bi bi-pencil-square' : 'bi bi-person-plus-fill'" class="me-2"></i>
              {{ isEditMode ? 'Cập Nhật Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="submitForm">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="tenNhanVien" class="form-label fw-semibold text-muted">Tên Nhân Viên <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control form-control-lg"
                    id="tenNhanVien"
                    v-model="form.tenNhanVien"
                    required
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="maNhanVien" class="form-label fw-semibold text-muted">Mã Nhân Viên <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control form-control-lg"
                    id="maNhanVien"
                    v-model="form.maNhanVien"
                    required
                    placeholder="NV001"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="email" class="form-label fw-semibold text-muted">Email <span class="text-danger">*</span></label>
                  <input
                    type="email"
                    class="form-control form-control-lg"
                    id="email"
                    v-model="form.email"
                    required
                    placeholder="email@example.com"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="chucVu" class="form-label fw-semibold text-muted">Chức Vụ <span class="text-danger">*</span></label>
                  <select class="form-select form-select-lg" id="chucVu" v-model="form.idChucVu" required>
                    <option value="" disabled selected>Chọn chức vụ</option>
                    <option v-for="chucVu in chucVus" :key="chucVu.id" :value="chucVu.id">
                      {{ chucVu.tenChucVu }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="mb-4">
                <label for="trangThai" class="form-label fw-semibold text-muted">Trạng Thái <span class="text-danger">*</span></label>
                <select class="form-select form-select-lg" id="trangThai" v-model="form.idTrangThai" required>
                  <option value="" disabled selected>Chọn trạng thái</option>
                  <option v-for="trangThai in trangThais" :key="trangThai.id" :value="trangThai.id">
                    {{ formatTrangThai(trangThai.tenTrangThai) }}
                  </option>
                </select>
              </div>
              <div class="d-flex justify-content-end gap-3 pt-4 border-top">
                <button type="button" class="btn btn-light btn-lg px-4" data-bs-dismiss="modal">
                  <i class="bi bi-x-circle me-2"></i>Hủy Bỏ
                </button>
                <button type="submit" class="btn btn-primary btn-lg px-4">
                  <i :class="isEditMode ? 'bi bi-check-circle' : 'bi bi-save-fill'" class="me-2"></i>
                  {{ isEditMode ? 'Cập Nhật' : 'Lưu' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { writeFile, utils } from 'xlsx';
import Paginate from 'vuejs-paginate-next';
import { Modal } from 'bootstrap';
import { debounce } from 'lodash';
import { useToast } from 'vue-toastification';

export default {
  name: 'NhanVien',
  components: { Paginate },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      nhanViens: [],
      chucVus: [],
      trangThais: [],
      // Cần tìm ID của trạng thái 'hoat_dong' và 'nghi_viec'
      hoatDongStatusId: null,
      nghiViecStatusId: null,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
      searchQuery: '',
      form: {
        id: null,
        tenNhanVien: '',
        maNhanVien: '',
        email: '',
        idChucVu: '', // Reset to empty string for disabled 'Chọn chức vụ' option
        idTrangThai: '', // Reset to empty string for disabled 'Chọn trạng thái' option
      },
      isEditMode: false,
      isLoading: false,
      modal: null,
      debounceSearch: debounce(this.fetchNhanViens, 300),
    };
  },
  mounted() {
    this.fetchTrangThais().then(() => {
        // Sau khi trạng thái được tải, tìm ID của 'hoat_dong' và 'nghi_viec'
        this.hoatDongStatusId = this.trangThais.find(t => t.tenTrangThai === 'hoat_dong')?.id;
        this.nghiViecStatusId = this.trangThais.find(t => t.tenTrangThai === 'nghi_viec')?.id;
        this.fetchNhanViens(); // Chỉ tải nhân viên sau khi có ID trạng thái
    });
    this.fetchChucVus();
    this.modal = new Modal(document.getElementById('nhanVienModal'));
  },
  methods: {
    async fetchNhanViens() {
      this.isLoading = true;
      try {
        const response = await axios.get('/api/nhan-vien', {
          params: {
            page: this.currentPage - 1,
            size: this.pageSize,
            search: this.searchQuery,
          },
        });
        this.nhanViens = response.data.content || [];
        this.totalPages = response.data.totalPages || 0;
      } catch (error) {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
        this.toast.error('Không thể tải danh sách nhân viên. Vui lòng thử lại sau.');
      } finally {
        this.isLoading = false;
      }
    },
    async fetchChucVus() {
      try {
        const response = await axios.get('/api/chuc-vu');
        this.chucVus = response.data || [];
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chức vụ:', error);
      }
    },
    async fetchTrangThais() {
      try {
        const response = await axios.get('/api/trang-thai');
        this.trangThais = response.data || [];
      } catch (error) {
        console.error('Lỗi khi lấy danh sách trạng thái:', error);
      }
    },
    openAddModal() {
      this.isEditMode = false;
      this.form = {
        id: null,
        tenNhanVien: '',
        maNhanVien: '',
        email: '',
        idChucVu: '', // Reset to empty string for disabled 'Chọn chức vụ' option
        idTrangThai: '', // Reset to empty string for disabled 'Chọn trạng thái' option
      };
      this.modal.show();
    },
    openEditModal(nhanVien) {
      this.isEditMode = true;
      this.form = {
        id: nhanVien.id,
        tenNhanVien: nhanVien.tenNhanVien,
        maNhanVien: nhanVien.maNhanVien,
        email: nhanVien.email,
        idChucVu: nhanVien.chucVu?.id || '',
        idTrangThai: nhanVien.trangThai?.id || '',
      };
      this.modal.show();
    },
    async submitForm() {
      try {
        if (this.isEditMode) {
          await axios.put(`/api/nhan-vien/${this.form.id}`, this.form);
          this.toast.success('Cập nhật thông tin nhân viên thành công!');
        } else {
          await axios.post('/api/nhan-vien', this.form);
          this.toast.success('Thêm nhân viên mới thành công!');
        }
        this.modal.hide();
        this.fetchNhanViens();
      } catch (error) {
        console.error('Lỗi khi lưu nhân viên:', error);
        this.toast.error('Có lỗi xảy ra khi lưu nhân viên. Vui lòng kiểm tra lại thông tin.');
      }
    },
    async confirmDelete(id) {
      this.toast.info('Đang chuẩn bị xóa nhân viên...', { timeout: 1000 });
      if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn nhân viên này? Hành động này không thể hoàn tác!')) {
        try {
          await axios.delete(`/api/nhan-vien/${id}`);
          this.toast.success('Đã xóa nhân viên thành công!');
          this.fetchNhanViens();
        } catch (error) {
          console.error('Lỗi khi xóa nhân viên:', error);
          this.toast.error('Không thể xóa nhân viên. Vui lòng thử lại.');
        }
      }
    },
    changePage(page) {
      this.currentPage = page;
      this.fetchNhanViens();
    },
    async exportToExcel() {
      this.toast.info('Đang chuẩn bị dữ liệu để xuất Excel...');
      try {
        // Fetch all data for export, not just current page
        const response = await axios.get('/api/nhan-vien', { params: { size: 9999 } });
        const allNhanViens = response.data.content || [];

        if (allNhanViens.length === 0) {
          this.toast.warning('Không có dữ liệu nhân viên để xuất.');
          return;
        }

        const data = allNhanViens.map(nv => ({
          ID: nv.id,
          'Tên Nhân Viên': nv.tenNhanVien,
          'Mã Nhân Viên': nv.maNhanVien,
          Email: nv.email,
          'Chức Vụ': nv.chucVu?.tenChucVu || 'N/A',
          'Trạng Thái': this.formatTrangThai(nv.trangThai?.tenTrangThai) || 'N/A',
        }));
        const ws = utils.json_to_sheet(data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, 'DanhSachNhanVien');
        writeFile(wb, 'DanhSachNhanVien.xlsx');
        this.toast.success('Dữ liệu đã được xuất ra file Excel thành công!');
      } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        this.toast.error('Có lỗi xảy ra khi xuất file Excel.');
      }
    },
    formatTrangThai(status) {
      if (!status) return 'Không rõ';
      switch (status.toLowerCase()) {
        case 'hoat_dong':
          return 'Hoạt Động';
        case 'nghi_viec':
          return 'Nghỉ Việc';
        default:
          return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); // Format "some_status" to "Some Status"
      }
    },
    async toggleNhanVienStatus(nhanVien) {
      // Xác định trạng thái mới dựa trên trạng thái hiện tại
      const currentStatusTen = nhanVien.trangThai?.tenTrangThai;
      let newStatusId;
      let newStatusText;

      if (currentStatusTen === 'hoat_dong') {
        newStatusId = this.nghiViecStatusId;
        newStatusText = 'Nghỉ Việc';
      } else {
        newStatusId = this.hoatDongStatusId;
        newStatusText = 'Hoạt Động';
      }

      // Đảm bảo có ID trạng thái hợp lệ
      if (!newStatusId) {
        this.toast.error('Không tìm thấy ID trạng thái phù hợp để chuyển đổi.');
        return;
      }

      // Tạo một đối tượng form tạm thời để gửi đi (chỉ cập nhật idTrangThai)
      const updatePayload = {
        idTrangThai: newStatusId,
        // Giữ các trường khác của nhân viên nếu API yêu cầu toàn bộ đối tượng,
        // nếu không, chỉ cần gửi idTrangThai
        // Trong trường hợp này, API của bạn dường như là PUT toàn bộ đối tượng
        // nên tôi sẽ sao chép các trường hiện có và chỉ thay đổi idTrangThai
        ...nhanVien,
        idChucVu: nhanVien.chucVu?.id, // Đảm bảo gửi id của chức vụ hiện tại
        idTrangThai: newStatusId // Cập nhật trạng thái mới
      };
      // Xóa các trường đối tượng lồng nhau để API không gặp lỗi nếu nó chỉ mong đợi ID
      delete updatePayload.chucVu;
      delete updatePayload.trangThai;


      try {
        await axios.put(`/api/nhan-vien/${nhanVien.id}`, updatePayload);
        this.toast.success(`Cập nhật trạng thái của nhân viên "${nhanVien.tenNhanVien}" thành "${newStatusText}" thành công!`);
        this.fetchNhanViens(); // Tải lại danh sách để cập nhật UI
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái nhân viên:', error);
        this.toast.error('Không thể cập nhật trạng thái nhân viên. Vui lòng thử lại.');
        // Revert the toggle visually if the API call fails
        // (This is implicitly handled by fetchNhanViens, but good to note)
      }
    },
  },
};
</script>

<style scoped>
/* Base Layout & General Styling */
.bg-light-gray {
  background-color: #f8f9fa; /* Lighter background for the entire page */
  min-height: 100vh;
}

.dark .bg-light-gray {
  background-color: #1f2937;
}

.container-fluid {
  max-width: 1400px; /* Max width for content */
}

/* Card Styling */
.card {
  border: none;
  border-radius: 1.25rem; /* More rounded corners */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); /* Softer, deeper shadow */
  background: #ffffff;
  transition: all 0.3s ease;
}

.dark .card {
  background: #2d3748;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

/* Typography & Colors */
.text-dark {
  color: #212529 !important; /* Dark text for titles, etc. */
}

.text-primary {
  color: #007bff !important; /* Consistent primary color */
}

.text-secondary {
  color: #6c757d !important; /* Used for icons and subtle text */
}

.dark .text-dark {
  color: #e2e8f0 !important; /* Light text in dark mode */
}

.dark .text-primary {
  color: #60a5fa !important;
}

.dark .text-secondary {
  color: #9ca3af !important;
}

.fs-2 {
  font-size: 2.25rem !important; /* Larger main title */
}

.fw-bold {
  font-weight: 700 !important;
}

.text-center-sm {
  text-align: center;
}

@media (min-width: 768px) {
  .text-center-sm {
    text-align: left; /* Align left on larger screens */
  }
}

/* Search Bar */
.search-input-group .form-control {
  border: 1px solid #ced4da;
  border-radius: 0 0.75rem 0.75rem 0; /* Match card roundedness */
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  padding-left: 0.75rem;
}

.search-input-group .form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.search-input-group .input-group-text {
  border: 1px solid #ced4da;
  border-right: none;
  border-radius: 0.75rem 0 0 0.75rem;
  background: #f1f5f9; /* Slightly different background for the icon part */
  padding-right: 0.25rem; /* Adjust padding to bring icon closer to input */
}

.dark .search-input-group .input-group-text {
  background: #4a5568;
  border-color: #4a5568;
}

.dark .search-input-group .form-control {
  background: #4a5568;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark .search-input-group .form-control::placeholder {
  color: #a0aec0;
}

/* Buttons (Add & Export) */
.btn-primary, .btn-success {
  border-radius: 0.75rem; /* Match card roundedness */
  padding: 0.75rem 1.5rem; /* More generous padding */
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.15); /* Subtle shadow for primary */
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); /* Smoother transition */
}

.btn-success {
  box-shadow: 0 4px 10px rgba(40, 167, 69, 0.15); /* Subtle shadow for success */
}

.btn-primary:hover, .btn-success:hover {
  transform: translateY(-2px); /* More pronounced lift on hover */
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.25); /* Stronger shadow on hover */
}

.dark .btn-primary {
  background-color: #60a5fa;
  border-color: #60a5fa;
  color: #1f2937;
  box-shadow: 0 4px 10px rgba(96, 165, 250, 0.25);
}

.dark .btn-success {
  background-color: #4CAF50; /* A bit brighter green for dark mode */
  border-color: #4CAF50;
  color: #e2e8f0;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.25);
}
.dark .btn-primary:hover {
  box-shadow: 0 8px 20px rgba(96, 165, 250, 0.35);
}
.dark .btn-success:hover {
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.35);
}

.btn-lg {
  font-size: 1rem;
}

/* Table Styling */
.beautiful-table {
  background-color: #ffffff;
  border-radius: 1rem; /* Consistent roundedness */
  overflow: hidden; /* Ensures rounded corners apply to content */
}

.dark .beautiful-table {
  background-color: #2d3748;
}

.table {
  --bs-table-bg: none; /* Override Bootstrap's table background */
  color: #2d3748; /* Default text color for table content */
}

.dark .table {
  color: #d1d5db;
}

.table-light {
  background: #f1f5f9 !important; /* Lighter header background */
}

.dark .table-light {
  background: #374151 !important;
}

.table-row-hover:hover {
  background: #e9f0f8; /* Softer hover background */
  transition: background 0.2s ease;
}

.dark .table-row-hover:hover {
  background: #4a5568;
}

.table th {
  font-size: 0.75rem; /* Smaller, uppercase headers */
  color: #6c757d;
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #e9ecef; /* Subtle border for headers */
  letter-spacing: 0.05em; /* Spacing for uppercase text */
  text-transform: uppercase;
}

.dark .table th {
  color: #a0aec0;
  border-bottom: 1px solid #4a5568;
}

.table td {
  font-size: 0.875rem; /* Slightly larger body text */
  padding: 1rem 0.75rem;
  border-top: 1px solid #e9ecef; /* Subtle border between rows */
}

.dark .table td {
  border-top: 1px solid #4a5568;
}

/* Avatar in table */
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0; /* Prevent shrinking */
}

/* Status Badges (Gradients for pop) */
.badge {
  padding: 0.5em 1em; /* More padding */
  border-radius: 1rem; /* Pill shape */
  font-weight: 600;
  font-size: 0.7rem;
  letter-spacing: 0.03em;
  display: inline-flex; /* For better alignment */
  align-items: center;
  justify-content: center;
  min-width: 90px; /* Consistent width */
}

.badge.bg-gradient-success {
  background-image: linear-gradient(310deg, #17ad37 0%, #98ec2b 100%) !important;
  color: #fff;
}
.badge.bg-gradient-warning {
  background-image: linear-gradient(310deg, #f53939 0%, #ff8c00 100%) !important;
  color: #fff; /* Ensure white text for warning gradient */
}
.badge.bg-gradient-secondary {
  background-image: linear-gradient(310deg, #627594 0%, #a8b8d8 100%) !important;
  color: #fff;
}

/* Action Buttons (Icon-only, Rounded) */
.btn-icon-only {
  width: 40px;
  height: 40px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.btn-rounded {
  border-radius: 50% !important; /* Perfect circle */
}

.btn-outline-warning {
  color: #ff8c00;
  border-color: #ff8c00;
}
.btn-outline-warning:hover {
  background-color: #ff8c00;
  color: #fff;
  box-shadow: 0 4px 10px rgba(255, 140, 0, 0.2);
}

.btn-outline-danger {
  color: #f53939;
  border-color: #f53939;
}
.btn-outline-danger:hover {
  background-color: #f53939;
  color: #fff;
  box-shadow: 0 4px 10px rgba(245, 57, 57, 0.2);
}

.dark .btn-outline-warning {
  color: #fbbf24;
  border-color: #fbbf24;
}
.dark .btn-outline-warning:hover {
  background-color: #fbbf24;
  color: #1f2937;
}

.dark .btn-outline-danger {
  color: #ef4444;
  border-color: #ef4444;
}
.dark .btn-outline-danger:hover {
  background-color: #ef4444;
  color: #1f2937;
}

/* Pagination */
.pagination {
  margin-top: 2.5rem; /* More space above pagination */
}

.page-link {
  width: 45px; /* Larger circles */
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  border-radius: 50% !important;
  color: #007bff;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  margin: 0 5px; /* More space between items */
  box-shadow: 0 2px 5px rgba(0,0,0,0.05); /* Subtle shadow */
}

.page-link:hover {
  background: #e9ecef;
  border-color: #007bff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.dark .page-link {
  color: #60a5fa;
  border-color: #4a5568;
  background-color: #374151;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
}

.dark .page-link:hover {
  background: #4a5568;
  border-color: #60a5fa;
}

.page-item.active .page-link {
  background: #007bff;
  color: #ffffff;
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
}

.dark .page-item.active .page-link {
  background: #60a5fa;
  border-color: #60a5fa;
  color: #1f2937;
  box-shadow: 0 4px 8px rgba(96, 165, 250, 0.2);
}

/* Custom pagination prev/next */
.page-link.rounded-pill {
  border-radius: 2rem !important;
  width: auto;
  min-width: 80px;
  padding: 0.5rem 1rem;
}

/* Modal Styling */
.modal-content {
  border-radius: 1.25rem; /* Consistent roundedness */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2); /* Even stronger shadow for modals */
  background-color: #fff;
  overflow: hidden; /* Ensure rounded corners */
}

.dark .modal-content {
  background-color: #2d3748;
}

.modal-header {
  background: linear-gradient(195deg, #42424a, #191919); /* Gradient header */
  color: #fff;
  padding: 1.5rem 2rem;
  border-bottom: none; /* Remove default border */
  display: flex; /* Ensure flex for title centering */
  justify-content: center; /* Center the title horizontally */
  position: relative;
}

.dark .modal-header {
  background: linear-gradient(195deg, #374151, #1f2937);
}

.modal-title {
  font-size: 1.5rem; /* Larger, bolder modal title */
  font-weight: 700;
  text-align: center;
  flex-grow: 1; /* Allow title to take available space for centering */
}

.btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%); /* Make close button white */
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.btn-close-white:hover {
  opacity: 1;
}

.modal-body {
  padding: 2.5rem; /* More generous padding */
}

.form-label {
  color: #555; /* Softer label color */
  font-size: 0.9rem;
  margin-bottom: 0.6rem;
}

.dark .form-label {
  color: #a0aec0;
}

.form-control-lg, .form-select-lg {
  padding: 0.9rem 1.2rem; /* Larger input fields */
  border-radius: 0.75rem; /* Consistent roundedness */
  border: 1px solid #e2e8f0;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); /* Subtle inner shadow */
}

.form-control-lg:focus, .form-select-lg:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
}

.dark .form-control-lg, .dark .form-select-lg {
  background: #4a5568;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark .form-control-lg::placeholder, .dark .form-select-lg option {
  color: #a0aec0;
}

.modal-body .border-top {
  border-color: #e9ecef !important;
  padding-top: 2rem !important;
  margin-top: 2rem !important;
}

.dark .modal-body .border-top {
  border-color: #4a5568 !important;
}

.btn-light {
  background-color: #f0f2f5;
  border-color: #f0f2f5;
  color: #344767;
  font-weight: 600;
}
.btn-light:hover {
  background-color: #e2e8f0;
  border-color: #e2e8f0;
}

.dark .btn-light {
  background-color: #525252;
  border-color: #525252;
  color: #e2e8f0;
}
.dark .btn-light:hover {
  background-color: #636363;
  border-color: #636363;
}

/* Custom switch styling */
.form-switch .form-check-input {
    width: 2.5em; /* Kích thước công tắc */
    height: 1.25em;
    margin-top: 0.2em;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%236c757d'/%3e%3c/svg%3e");
    background-position: left center;
    border-radius: 1.25em;
    transition: background-position .15s ease-in-out;
}

.form-switch .form-check-input:focus {
    box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
}

.form-switch .form-check-input:checked {
    background-position: right center;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
    background-color: #17ad37; /* Màu xanh lá cho trạng thái hoạt động */
    border-color: #17ad37;
}

.form-switch .form-check-input:not(:checked) {
    background-color: #dc3545; /* Màu đỏ cho trạng thái nghỉ việc */
    border-color: #dc3545;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
}
</style>