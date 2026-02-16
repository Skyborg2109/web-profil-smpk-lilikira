import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
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

export const MySwal = Swal.mixin({
    customClass: {
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
        popup: 'swal-popup-custom'
    },
    buttonsStyling: false,
    confirmButtonText: 'Ya',
    cancelButtonText: 'Tidak',
    reverseButtons: true
});

export const showAlert = {
    success: (title: string, text?: string) => {
        return MySwal.fire({
            icon: 'success',
            title,
            text,
            iconColor: '#8276dd',
        });
    },
    error: (title: string, text?: string) => {
        return MySwal.fire({
            icon: 'error',
            title,
            text,
            iconColor: '#ef4444',
        });
    },
    info: (title: string, text?: string) => {
        return MySwal.fire({
            icon: 'info',
            title,
            text,
            iconColor: '#3b82f6',
        });
    },
    confirm: (title: string, text: string, confirmText = 'Ya', cancelText = 'Tidak', icon: 'warning' | 'question' | 'error' | 'success' | 'info' = 'warning') => {
        return MySwal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            iconColor: icon === 'warning' ? '#f59e0b' : (icon === 'question' ? '#3b82f6' : (icon === 'error' ? '#ef4444' : '#8276dd')),
        });
    }
};
