import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import HoaDon from '../views/HoaDon.vue';
import PhieuGiamGia from '../views/PhieuGiamGia.vue';
import DotGiamGia from '../views/DotGiamGia.vue';
import BanTaiQuay from '../views/BanTaiQuay.vue';
import QuanLySanPham from '../views/QuanLySanPham.vue';
import NhanVien from '../views/NhanVien.vue';
import KhachHang from '../views/KhachHang.vue';
import InvoiceDetail from '../views/InvoiceDetail.vue';
import ThemDotGiamGia from '../views/dotgiamgia/ThemDotGiamGia.vue';

const routes = [
  { path: '/', name: 'Home', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/hoa-don', name: 'HoaDon', component: HoaDon },
  { path: '/hoa-don/detail/:id', name: 'InvoiceDetail', component: InvoiceDetail },
  { path: '/phieu-giam-gia', name: 'PhieuGiamGia', component: PhieuGiamGia },
  { path: '/dot-giam-gia', name: 'DotGiamGia', component: DotGiamGia },
{ 
  path: '/them-dot-giam-gia', 
  name: 'ThemDotGiamGia', 
  component: ThemDotGiamGia 
},
  { path: '/ban-tai-quay', name: 'BanTaiQuay', component: BanTaiQuay },
  { path: '/quan-ly-san-pham', name: 'QuanLySanPham', component: QuanLySanPham },
  { path: '/nhan-vien', name: 'NhanVien', component: NhanVien },
  { path: '/khach-hang', name: 'KhachHang', component: KhachHang },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Kiểm tra tuyến đường đã đăng ký
console.log('Registered routes:', routes);

export default router;