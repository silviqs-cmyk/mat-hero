import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Modal({ open, title, children, actions }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="mh-modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="mh-modal w-full max-w-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="mh-heading-lg">{title}</h2>
          {actions}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
