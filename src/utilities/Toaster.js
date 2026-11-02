import { toast } from 'react-toastify';

const print_toast = (_toast_type, _toast_message, options = {}) => {
  const config = {
    position: 'top-right',
    autoClose: options.duration || (_toast_type === "error" ? 10000 : 6000),
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored", // Using colored theme for more "attractive" look
    ...options
  };

  switch (_toast_type) {
    case "success":
      toast.success(_toast_message, config);
      break;
    case "error":
      toast.error(_toast_message, config);
      break;
    case "warning":
      toast.warning(_toast_message, config);
      break;
    case "info":
      toast.info(_toast_message, config);
      break;
    default:
      toast(_toast_message, config);
      break;
  }
};

export default print_toast;
