import Swal from 'sweetalert2'

export const useAlert = () => {
  // Success alert with auto-close
  const success = (title: string, text?: string, timer: number = 3000) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      timer,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonText: 'OK',
      confirmButtonColor: '#10B981',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium'
      }
    })
  }

  // Error alert with auto-close
  const error = (title: string, text?: string, timer: number = 4000) => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      timer,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonText: 'OK',
      confirmButtonColor: '#EF4444',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium'
      }
    })
  }

  // Warning alert with auto-close
  const warning = (title: string, text?: string, timer: number = 4000) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      timer,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonText: 'OK',
      confirmButtonColor: '#F59E0B',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium'
      }
    })
  }

  // Info alert with auto-close
  const info = (title: string, text?: string, timer: number = 3000) => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      timer,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3B82F6',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium'
      }
    })
  }

  // Confirmation dialog
  const confirm = (title: string, text?: string, confirmText: string = 'Yes', cancelText: string = 'No') => {
    return Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium mr-2',
        cancelButton: 'px-6 py-2 rounded-lg font-medium'
      }
    })
  }

  // Loading alert
  const loading = (title: string = 'Loading...', text?: string) => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      },
      customClass: {
        popup: 'rounded-xl'
      }
    })
  }

  // Close any open alert
  const close = () => {
    Swal.close()
  }

  // Custom alert with full control
  const custom = (options: any) => {
    return Swal.fire({
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium',
        cancelButton: 'px-6 py-2 rounded-lg font-medium'
      },
      ...options
    })
  }

  return {
    success,
    error,
    warning,
    info,
    confirm,
    loading,
    close,
    custom
  }
}
