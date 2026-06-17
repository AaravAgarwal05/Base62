import { toast as sonnerToast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Info,
  Trash2,
  Copy,
  type LucideIcon,
} from "lucide-react";

const iconProps = { size: 18, strokeWidth: 1.5 };

export const toast = {
  success: (message: string) =>
    sonnerToast.success(message, {
      icon: <CheckCircle {...iconProps} className="text-primary" />,
    }),

  error: (message: string) =>
    sonnerToast.error(message, {
      icon: <XCircle {...iconProps} className="text-[#ff6b6b]" />,
    }),

  info: (message: string) =>
    sonnerToast.info(message, {
      icon: <Info {...iconProps} className="text-[#64b5f6]" />,
    }),

  deleted: (message = "URL deleted.") =>
    sonnerToast.info(message, {
      icon: <Trash2 {...iconProps} className="text-on-surface-variant" />,
    }),

  copied: (message = "Copied to clipboard!") =>
    sonnerToast.success(message, {
      icon: <Copy {...iconProps} className="text-primary" />,
    }),
};
