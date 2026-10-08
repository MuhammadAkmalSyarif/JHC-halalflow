import Swal from 'sweetalert2';

export const showConfirm = async (text, title = 'Konfirmasi') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#059669', // emerald-600
    cancelButtonColor: '#94a3b8', // slate-400
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal',
    customClass: {
      popup: 'rounded-2xl shadow-xl',
      title: 'text-xl font-bold text-slate-800',
      htmlContainer: 'text-slate-600 font-medium',
      confirmButton: 'rounded-lg px-5 py-2.5 font-semibold text-white shadow-sm',
      cancelButton: 'rounded-lg px-5 py-2.5 font-semibold text-white shadow-sm'
    }
  });
  return result.isConfirmed;
};

export const showAlert = (text, icon = 'error', title = '') => {
  if (!title) {
    title = icon === 'error' ? 'Oops...' : icon === 'success' ? 'Berhasil!' : 'Perhatian';
  }
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: '#059669',
    customClass: {
      popup: 'rounded-2xl shadow-xl',
      title: 'text-xl font-bold text-slate-800',
      htmlContainer: 'text-slate-600 font-medium',
      confirmButton: 'rounded-lg px-5 py-2.5 font-semibold text-white shadow-sm'
    }
  });
};

export const showToast = (text, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon,
    title: text
  });
};
