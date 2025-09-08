<template>
  
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-4 md:p-6 font-roboto">
    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
    </div>

    <div v-if="errorMessage" class="card bg-red-50 dark:bg-red-950 p-4 mb-6 rounded-3xl shadow-lg animate__animated animate__fadeIn">
      <p class="text-red-600 dark:text-red-300 font-medium">{{ errorMessage }}</p>
    </div>

    <!-- Bộ lọc giữ nguyên -->
    <div class="card bg-white dark:bg-gray-800 mb-6 rounded-3xl shadow-2xl animate__animated animate__fadeInUp">
      <div class="p-6 md:p-8">
        <h2 class="text-2xl baseURL:text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
          <iconify-icon icon="solar:filter-bold-duotone" class="text-4xl mr-4 text-blue-500" />
          Bộ Lọc Hóa Đơn
        </h2>
        <form @submit.prevent="filterInvoices" class="filter-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Mã hóa đơn</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Nhập mã hóa đơn..."
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-300"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Trạng thái</label>
            <select
              v-model="filters.trangThaiId"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-300"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="6">Chờ xác nhận</option>
              <option value="7">Chờ xử lý</option>
              <option value="8">Chờ vận chuyển</option>
              <option value="9">Đang vận chuyển</option>
              <option value="21">Đã hoàn thành</option>
              <option value="22">Đã hủy</option>
              <option value="23">Hoàn 1 phần</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Loại đơn hàng</label>
            <select
              v-model="filters.loaiDonHang"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-300"
            >
              <option value="">Tất cả loại đơn</option>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Từ ngày</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-300"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Đến ngày</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-300"
            />
          </div>
          <div class="flex items-end gap-3 lg:col-span-1">
            <button type="submit" class="btn-primary px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition duration-300 shadow-lg hover:shadow-xl flex-1">
              Lọc
            </button>
            <button
              type="button"
              @click="clearFilter"
              class="btn-secondary px-6 py-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition duration-300 shadow-lg hover:shadow-xl flex-1"
            >
              Xóa Lọc
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Bảng hóa đơn -->
    <div class="card bg-white dark:bg-gray-800 rounded-3xl shadow-2xl animate__animated animate__fadeInUp">
      <div class="p-6 md:p-8">
        <div class="tabs flex gap-4 mb-6 overflow-x-auto pb-2">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'tab px-6 py-2.5 cursor-pointer rounded-lg flex items-center whitespace-nowrap transition-all duration-300 font-semibold text-sm',
              { 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md': activeTab === tab.id, 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600': activeTab !== tab.id },
            ]"
            @click="switchTab(tab.id)"
          >
            <span>{{ tab.label }} ({{ getTabCount(tab.id) }})</span>
          </div>
        </div>

        <div class="card-body overflow-x-auto rounded-xl shadow-inner">
          <table class="table w-full min-w-[1100px] border-collapse">
            <thead>
              <tr class="bg-blue-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <th class="p-4 py-4 font-extrabold text-sm uppercase tracking-wider rounded-tl-xl">STT</th>
                <th class="p-4 py-4 font-extrabold text-sm uppercase tracking-wider">Mã Hóa Đơn</th>
                <th class="p-4 py-4 font-extrabold text-sm uppercase tracking-wider">Khách Hàng</th>
                <th class="p-4 py-4 font-extrabold text-sm uppercase tracking-wider">Số Điện Thoại</th>
                <th class="p-4 py-4 font-extrabold text-sm uppercase tracking-wider">Mã Vận Đơn</th>
                <th class="p-4 py-4 font-extrabold text-sm uppercase tracking-wider">Loại Đơn Hàng</th>
                <th class="p-4 py-4 font-extrabold text-sm uppercase tracking-wider">Ngày Tạo</th>
                <th class="p-4 py-4 text-right font-extrabold text-sm uppercase tracking-wider">Tổng Tiền</th>
                <th class="p-4 py-4 text-center font-extrabold text-sm uppercase tracking-wider">Trạng Thái</th>
                <th class="p-4 py-4 text-center font-extrabold text-sm uppercase tracking-wider rounded-tr-xl">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading" class="text-center">
                <td colspan="10" class="p-4.5">
                  <div class="flex justify-center items-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
                    <span class="ml-2 text-gray-600 dark:text-gray-300">Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredInvoices.length === 0" class="no-data">
                <td colspan="10" class="p-6 text-center">
                  <iconify-icon icon="solar:cloud-cross-linear" class="text-6xl text-gray-400 dark:text-gray-500 mb-3" />
                  <p class="text-gray-600 dark:text-gray-300 text-xl font-medium">Không có dữ liệu hóa đơn nào được tìm thấy.</p>
                </td>
              </tr>
              <tr v-for="(invoice, index) in paginatedInvoices" :key="invoice.id" class="border-b border-dashed border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <td class="p-4.5 text-gray-700 dark:text-gray-200">{{ (currentPage * pageSize) + index + 1 }}</td>
                <td class="p-4.5 font-bold text-gray-800 dark:text-gray-100">{{ invoice.maHoaDon }}</td>
                <td class="p-4.5 text-gray-700 dark:text-gray-200">{{ invoice.khachHang?.tenKhachHang || 'Khách lẻ' }}</td>
                <td class="p-4.5 text-gray-700 dark:text-gray-200">{{ invoice.khachHang?.soDienThoai || 'N/A' }}</td>
                <td class="p-4.5 text-gray-700 dark:text-gray-200">{{ invoice.maVanDon || 'Chưa có' }}</td>
                <td class="p-4.5 text-gray-700 dark:text-gray-200">
                  <span :class="getOrderTypeClass(invoice)">
                    {{ getOrderTypeText(invoice) }}
                  </span>
                </td>
                <td class="p-4.5 text-gray-700 dark:text-gray-200">{{ formatDate(invoice.ngayTao) }}</td>
                <td class="p-4.5 text-right font-bold text-gray-800 dark:text-gray-100">{{ formatCurrency(invoice.tongTienThanhToan) }}</td>
                <td class="p-4.5 text-center">
                  <span :class="getStatusColor(invoice.trangThai?.id)">
                    {{ getStatusText(invoice.trangThai?.id) }}
                  </span>
                </td>
                <td class="p-4.5 text-center flex justify-center gap-2">
                  <router-link
                    :to="{ name: 'InvoiceDetail', params: { id: invoice.id } }"
                    class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100/70 dark:bg-blue-900/70 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 shadow-sm hover:shadow-md"
                    title="Xem chi tiết"
                  >
                    <iconify-icon icon="solar:eye-bold" class="text-xl" />
                  </router-link>
                  <button
                    v-if="!invoice.isOnlineOrder"
                    @click="editInvoice(invoice)"
                    class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-yellow-100/70 dark:bg-yellow-900/70 text-yellow-600 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-200 shadow-sm hover:shadow-md"
                    title="Sửa hóa đơn"
                  >
                    <iconify-icon icon="solar:pencil-bold" class="text-xl" />
                  </button>
                  <button
                    v-if="!invoice.isOnlineOrder"
                    @click="confirmDelete(invoice.id)"
                    class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-100/70 dark:bg-red-900/70 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200 shadow-sm hover:shadow-md"
                    title="Xóa hóa đơn"
                  >
                    <iconify-icon icon="solar:trash-bin-bold" class="text-xl" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="pagination flex justify-between items-center gap-3 mt-6 px-4 py-2">
            <div class="text-sm text-gray-600 dark:text-gray-300">
              Hiển thị {{ (currentPage * pageSize) + 1 }}-{{ Math.min((currentPage + 1) * pageSize, filteredInvoices.length) }} của {{ filteredInvoices.length }} hóa đơn
            </div>
            <div class="flex gap-2">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 0"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100/70 dark:hover:bg-blue-800/70 transition-colors duration-200"
              >
                «
              </button>
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="changePage(page - 1)"
                :class="[
                  'px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl transition-colors duration-200',
                  { 'bg-blue-600 text-white shadow-md': currentPage === page - 1, 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100/70 dark:hover:bg-blue-800/70': currentPage !== page - 1 },
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages - 1"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100/70 dark:hover:bg-blue-800/70 transition-colors duration-200"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Sửa Hóa Đơn -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <iconify-icon icon="solar:pencil-bold" class="text-2xl mr-2 text-yellow-600" />
          Sửa Hóa Đơn
        </h3>
        <form @submit.prevent="updateInvoice">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Mã Hóa Đơn</label>
            <input
              v-model="editInvoiceData.maHoaDon"
              type="text"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Tên Khách Hàng</label>
            <input
              v-model="editInvoiceData.khachHang.tenKhachHang"
              type="text"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Số Điện Thoại</label>
            <input
              v-model="editInvoiceData.khachHang.soDienThoai"
              type="text"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Loại Đơn Hàng</label>
            <select
              v-model="editInvoiceData.loaiDonHang"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Trạng Thái</label>
            <select
              v-model="editInvoiceData.trangThai.id"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300"
            >
              <option value="6">Chờ xác nhận</option>
              <option value="7">Chờ xử lý</option>
              <option value="8">Chờ vận chuyển</option>
              <option value="9">Đang vận chuyển</option>
              <option value="21">Đã hoàn thành</option>
              <option value="22">Đã hủy</option>
              <option value="23">Hoàn 1 phần</option>
            </select>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              type="submit"
              class="btn-primary px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition duration-300 shadow-lg hover:shadow-xl flex-1"
            >
              Lưu
            </button>
            <button
              type="button"
              @click="showEditModal = false"
              class="btn-secondary px-6 py-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition duration-300 shadow-lg hover:shadow-xl flex-1"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Xác Nhận Xóa -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 animate__animated animate__fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <iconify-icon icon="solar:trash-bin-bold" class="text-2xl mr-2 text-red-600" />
          Xác Nhận Xóa
        </h3>
        <p class="text-gray-700 dark:text-gray-200 mb-6">Bạn có chắc chắn muốn xóa hóa đơn này? Hành động này không thể hoàn tác.</p>
        <div class="flex gap-3">
          <button
            @click="deleteInvoice"
            class="btn-primary px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition duration-300 shadow-lg hover:shadow-xl flex-1"
          >
            Xóa
          </button>
          <button
            @click="showDeleteModal = false"
            class="btn-secondary px-6 py-3 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition duration-300 shadow-lg hover:shadow-xl flex-1"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { getInvoices, updateInvoice, deleteInvoice, getOnlineOrders } from '@/services/api';
import mitt from 'mitt';

const emitter = mitt();
const router = useRouter();

export default {
  name: 'HoaDon',
  components: {
    'iconify-icon': Icon,
  },
  setup() {
    const toast = useToast();
    const isLoading = ref(false);
    const errorMessage = ref('');
    const allInvoices = ref([]);
    const currentPage = ref(0);
    const pageSize = ref(10);
    const filters = ref({
      search: '',
      trangThaiId: '',
      loaiDonHang: '',
      startDate: '',
      endDate: '',
    });
    const activeTab = ref('all');
    const showEditModal = ref(false);
    const showDeleteModal = ref(false);
    const editInvoiceData = ref({});
    const deleteInvoiceId = ref(null);

    const tabs = ref([
      { id: 'all', label: 'Tất cả' },
      { id: 'cho_xac_nhan', label: 'Chờ xác nhận', statusId: 6 },
      { id: 'pending', label: 'Chờ xử lý', statusId: 7 },
      { id: 'cho_van_chuyen', label: 'Chờ vận chuyển', statusId: 8 },
      { id: 'dang_van_chuyen', label: 'Đang vận chuyển', statusId: 9 },
      { id: 'completed', label: 'Đã hoàn thành', statusId: 21 },
      { id: 'canceled', label: 'Đã hủy', statusId: 22 },
      { id: 'hoan_mot_phan', label: 'Hoàn 1 phần', statusId: 23 },
    ]);

    const filteredInvoices = computed(() => {
      let result = allInvoices.value;

      const activeTabObj = tabs.value.find((tab) => tab.id === activeTab.value);
      if (activeTabObj?.statusId) {
        result = result.filter((invoice) => invoice.trangThai?.id === activeTabObj.statusId);
      } else if (filters.value.trangThaiId) {
        result = result.filter((invoice) => invoice.trangThai?.id === parseInt(filters.value.trangThaiId));
      }
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase();
        result = result.filter(
          (invoice) =>
            invoice.maHoaDon.toLowerCase().includes(searchTerm) ||
            invoice.khachHang?.tenKhachHang?.toLowerCase().includes(searchTerm) ||
            invoice.khachHang?.soDienThoai?.includes(searchTerm)
        );
      }
      if (filters.value.loaiDonHang) {
        result = result.filter((invoice) => {
          return filters.value.loaiDonHang === 'offline' ? !invoice.isOnlineOrder : invoice.isOnlineOrder;
        });
      }
      if (filters.value.startDate) {
        const start = new Date(filters.value.startDate);
        result = result.filter((invoice) => new Date(invoice.ngayTao) >= start);
      }
      if (filters.value.endDate) {
        const end = new Date(filters.value.endDate);
        end.setHours(23, 59, 59, 999);
        result = result.filter((invoice) => new Date(invoice.ngayTao) <= end);
      }

      return result;
    });

    const paginatedInvoices = computed(() => {
      const start = currentPage.value * pageSize.value;
      const end = start + pageSize.value;
      return filteredInvoices.value.slice(start, end);
    });

    const totalPages = computed(() => Math.ceil(filteredInvoices.value.length / pageSize.value) || 1);

    const displayedPages = computed(() => {
      const maxPagesToShow = 5;
      const total = totalPages.value;
      const current = currentPage.value + 1;
      let startPage = Math.max(1, current - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(total, startPage + maxPagesToShow - 1);
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    });

    const fetchAllInvoices = async () => {
      console.log('Bắt đầu tải hóa đơn...');
      isLoading.value = true;
      errorMessage.value = '';
      try {
        const [localResponse, onlineResponse] = await Promise.all([
          getInvoices().catch(() => ({ data: [] })),
          getOnlineOrders().catch(() => ({ data: [] }))
        ]);
        console.log('Hóa đơn local:', localResponse.data);
        console.log('Hóa đơn online:', onlineResponse.data);

        const onlineInvoices = onlineResponse.data.map(order => ({
          id: `ONLINE-${order.id}`,
          maHoaDon: order.orderNumber || `ONLINE-${order.id}`,
          khachHang: {
            tenKhachHang: order.customerName || order.tenKhachHang || 'Khách lẻ',
            soDienThoai: order.customerPhone || order.soDienThoai || 'N/A'
          },
          maVanDon: order.maVanDon || null,
          paymentHistory: [{ ghiChu: order.paymentMethod === 'cod' ? 'Tiền mặt' : 'Online' }],
          paymentMethod: order.paymentMethod || 'online',
          trangThai: { id: order.statusId || 6 },
          ngayTao: order.createdAt || new Date().toISOString(),
          tongTienThanhToan: order.totalAmount || order.totalPrice || 0,
          isOnlineOrder: true
        }));

        allInvoices.value = [
          ...(localResponse.data || []).map(invoice => ({ ...invoice, isOnlineOrder: false })),
          ...onlineInvoices
        ];

        if (allInvoices.value.length === 0) {
          errorMessage.value = 'Không tìm thấy hóa đơn nào.';
          toast.warning(errorMessage.value, { timeout: 4000 });
        } else {
          toast.success('Dữ liệu hóa đơn đã được tải thành công!', { timeout: 3000 });
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu hóa đơn:', error);
        errorMessage.value = `Lỗi khi tải dữ liệu hóa đơn: ${error.message}`;
        toast.error(errorMessage.value, { timeout: 5000 });
      } finally {
        isLoading.value = false;
        if (currentPage.value >= totalPages.value) {
          currentPage.value = Math.max(0, totalPages.value - 1);
        }
        console.log('Kết thúc tải hóa đơn:', allInvoices.value);
      }
    };

    const editInvoice = (invoice) => {
      if (invoice.isOnlineOrder) {
        toast.error('Không thể sửa hóa đơn online từ Mokky!');
        return;
      }
      editInvoiceData.value = {
        id: invoice.id,
        maHoaDon: invoice.maHoaDon,
        khachHang: {
          tenKhachHang: invoice.khachHang?.tenKhachHang || 'Khách lẻ',
          soDienThoai: invoice.khachHang?.soDienThoai || ''
        },
        loaiDonHang: invoice.isOnlineOrder ? 'online' : 'offline',
        trangThai: { id: invoice.trangThai?.id || 6 }
      };
      showEditModal.value = true;
    };

    const updateInvoice = async () => {
      if (!editInvoiceData.value.maHoaDon) {
        toast.error('Mã hóa đơn không được để trống!');
        return;
      }
      try {
        await updateInvoice(editInvoiceData.value.id, {
          maHoaDon: editInvoiceData.value.maHoaDon,
          khachHang: {
            tenKhachHang: editInvoiceData.value.khachHang.tenKhachHang || 'Khách lẻ',
            soDienThoai: editInvoiceData.value.khachHang.soDienThoai || ''
          },
          trangThai: { id: parseInt(editInvoiceData.value.trangThai.id) },
          paymentHistory: editInvoiceData.value.loaiDonHang === 'offline' ? [{ ghiChu: 'Tiền mặt' }] : [{ ghiChu: 'Online' }]
        });
        toast.success('Cập nhật hóa đơn thành công!');
        showEditModal.value = false;
        await fetchAllInvoices();
      } catch (error) {
        console.error('Lỗi khi cập nhật hóa đơn:', error.response ? error.response.data : error.message);
        toast.error(`Lỗi khi cập nhật hóa đơn: ${error.message}`);
      }
    };

    const confirmDelete = (id) => {
      const invoice = allInvoices.value.find(inv => inv.id === id);
      if (invoice?.isOnlineOrder) {
        toast.error('Không thể xóa hóa đơn online từ Mokky!');
        return;
      }
      deleteInvoiceId.value = id;
      showDeleteModal.value = true;
    };

    const deleteInvoice = async () => {
      try {
        await deleteInvoice(deleteInvoiceId.value);
        toast.success('Xóa hóa đơn thành công!');
        showDeleteModal.value = false;
        deleteInvoiceId.value = null;
        await fetchAllInvoices();
      } catch (error) {
        console.error('Lỗi khi xóa hóa đơn:', error.response ? error.response.data : error.message);
        toast.error(`Lỗi khi xóa hóa đơn: ${error.message}`);
      }
    };

    const getTabCount = (tabId) => {
      if (!allInvoices.value.length) return 0;
      if (tabId === 'all') return allInvoices.value.length;
      const tab = tabs.value.find((t) => t.id === tabId);
      if (!tab?.statusId) return 0;
      return allInvoices.value.filter((invoice) => invoice.trangThai?.id === tab.statusId).length;
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      try {
        return new Date(date).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (e) {
        console.error('Error formatting date:', date, e);
        return 'Invalid Date';
      }
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(value || 0);
    };

    const getStatusText = (statusId) => {
      const statusMap = {
        6: 'Chờ xác nhận',
        7: 'Chờ xử lý',
        8: 'Chờ vận chuyển',
        9: 'Đang vận chuyển',
        21: 'Đã hoàn thành',
        22: 'Đã hủy',
        23: 'Hoàn 1 phần'
      };
      return statusMap[statusId] || 'Không xác định';
    };

    const getStatusColor = (statusId) => {
      const colorMap = {
        6: 'text-orange-600 bg-orange-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
        7: 'text-amber-600 bg-amber-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
        8: 'text-cyan-600 bg-cyan-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
        9: 'text-green-600 bg-green-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
        21: 'text-lime-700 bg-lime-200 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
        22: 'text-red-700 bg-red-200 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase',
        23: 'text-rose-600 bg-rose-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase'
      };
      return colorMap[statusId] || 'text-gray-600 bg-gray-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase';
    };

    const getOrderTypeText = (invoice) => {
      return invoice.isOnlineOrder ? 'Online' : 'Offline';
    };

    const getOrderTypeClass = (invoice) => {
      return invoice.isOnlineOrder
        ? 'text-purple-600 bg-purple-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase'
        : 'text-blue-600 bg-blue-100 px-3.5 py-1.5 rounded-full font-bold text-xs uppercase';
    };

    const switchTab = (tabId) => {
      activeTab.value = tabId;
      const tab = tabs.value.find((t) => t.id === tabId);
      filters.value.trangThaiId = tab.statusId ? String(tab.statusId) : '';
      currentPage.value = 0;
    };

    const filterInvoices = () => {
      currentPage.value = 0;
      toast.success('Đã lọc dữ liệu hóa đơn!');
    };

    const clearFilter = () => {
      filters.value = { search: '', trangThaiId: '', loaiDonHang: '', startDate: '', endDate: '' };
      activeTab.value = 'all';
      currentPage.value = 0;
      toast.success('Đã xóa bộ lọc!');
    };

    const changePage = (page) => {
      if (page >= 0 && page < totalPages.value) {
        currentPage.value = page;
      }
    };

    const initChatbot = () => {
      const script = document.createElement('script');
      script.src = 'https://app.tudongchat.com/js/chatbox.js';
      script.async = true;
      script.onload = () => {
        if (window.TuDongChat) {
          const tudong_chatbox = new window.TuDongChat('rKnd8_19n6Lvrg-lDWmTs');
          tudong_chatbox.initial();
        } else {
          console.error('TuDongChat script loaded but TuDongChat is undefined');
        }
      };
      script.onerror = () => console.error('Failed to load TuDongChat script');
      document.body.appendChild(script);
    };

    emitter.on('invoiceCreated', () => {
      fetchAllInvoices();
      toast.info('Đã làm mới danh sách hóa đơn!');
    });

    watch([filters, activeTab], () => {
      currentPage.value = 0;
    }, { deep: true });

    onMounted(() => {
      fetchAllInvoices();
      initChatbot();
    });

    return {
      isLoading,
      errorMessage,
      filteredInvoices,
      paginatedInvoices,
      totalPages,
      currentPage,
      pageSize,
      filters,
      activeTab,
      tabs,
      displayedPages,
      formatDate,
      formatCurrency,
      getStatusText,
      getStatusColor,
      getOrderTypeText,
      getOrderTypeClass,
      switchTab,
      filterInvoices,
      clearFilter,
      changePage,
      getTabCount,
      showEditModal,
      showDeleteModal,
      editInvoiceData,
      editInvoice,
      updateInvoice,
      confirmDelete,
      deleteInvoice
    };
  }
};
</script>

<style scoped>
@import 'vue-toastification/dist/index.css';
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');

:root {
  --primary-blue: #3b82f6;
  --primary-blue-dark: #2563eb;
  --card-bg-light: #ffffff;
  --card-bg-dark: #1f2937;
  --text-color-light: #1f2937;
  --text-color-dark: #e5e7eb;
}

.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.card {
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: var(--card-bg-light);
}

.dark .card {
  background: var(--card-bg-dark);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.card-body {
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(145deg, #f9fafb, #ffffff);
}

.dark .card-body {
  background: linear-gradient(145deg, #1f2937, #2d3748);
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th,
.table td {
  padding: 18px 16px;
  text-align: left;
}

.table thead th {
  background: #e0f2f7;
  color: #212121;
  font-weight: 800;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
}

.dark .table thead th {
  background: #374151;
  color: #e5e7eb;
}

.table tbody tr {
  border-bottom: 1px dashed #e5e7eb;
  transition: background 0.3s ease;
}

.dark .table tbody tr {
  border-bottom: 1px dashed #4b5563;
}

.table tbody tr:last-child {
  border-bottom: none;
}

.table tbody tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

.dark .table tbody tr:hover {
  background: #374151;
}

.btn-primary {
  background: #10B981;
  color: white;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  background: #059669;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  background: #EF4444;
  color: white;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.btn-secondary:hover {
  background: #DC2626;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  color: #6b7280;
  font-size: 1.4rem;
  font-weight: 500;
}

.dark .no-data {
  color: #9ca3af;
}

.pagination button {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  min-width: 40px;
  text-align: center;
}

.dark .pagination button {
  background: #374151;
  color: #d1d5db;
  border: 1px solid #4b5563;
}

.pagination button:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.dark .pagination button:hover:not(:disabled) {
  background: #4b5563;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.tab {
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
}

.tab:hover:not(.active) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.tab.active {
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

@media (max-width: 1024px) {
  .filter-group {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .p-6 {
    padding: 1.25rem;
  }
  .md\:p-8 {
    padding: 1.5rem;
  }
}

@media (max-width: 640px) {
  .filter-group {
    grid-template-columns: 1fr;
  }

  .table th,
  .table td {
    padding: 12px;
    font-size: 0.85rem;
  }

  .tabs {
    gap: 0.75rem;
    padding-bottom: 0.5rem;
  }

  .tab {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }

  .pagination {
    flex-direction: column;
    align-items: center;
  }
}
</style>