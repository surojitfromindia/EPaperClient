interface ModelProps<TOkPayload> {
  isOpen: boolean;
  onClose: () => void;
  onOk?: (ok_payload: TOkPayload) => void;
}

export type { ModelProps };
