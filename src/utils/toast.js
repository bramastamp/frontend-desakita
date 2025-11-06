import { useToast } from "vue-toastification";

const toast = useToast();

export const toastSuccess = (message) => {
  toast.success(message, {
    timeout: 2000,
  });
};

export const toastError = (message) => {
  toast.error(message, {
    timeout: 2000,
  });
};

export const toastWarning = (message) => {
  toast.warning(message, {
    timeout: 2000,
  });
};
