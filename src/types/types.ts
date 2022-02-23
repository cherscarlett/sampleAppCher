export enum MultiCaptureFlashMode {
  manual = 'manual',
  alwaysOn = 'alwaysOn',
  alwaysOff = 'alwaysOff',
  auto = 'auto',
}

export enum FlashStateType {
  on = 'on',
  off = 'off',
  auto = 'auto',
}
export enum CaptureType {
  BarcodeCapture = 'barcodeCapture',
  PhotoCapture = 'photoCapture',
}

export interface CaptureStep {
  captureStepId: string;
  type: CaptureType;
  message?: string;
  skippable: boolean;
  showOutline?: boolean;
  outlineColor?: string;
  captureAreaAspectRatio?: number;
  captureAreaHeightPercent?: number; // at least one out of captureAreaHeightPercent and
  captureAreaWidthPercent?: number; // captureAreaWidthPercent should be specified
  flashMode?: MultiCaptureFlashMode;
}

export interface BarcodeCapture extends CaptureStep {
  type: CaptureType.BarcodeCapture;
  barcodeType: keyof BarCodeType;
  onBarcodeScanned: (result: {
    barcodeData: string;
    barcodeType: keyof BarCodeType;
  }) => boolean;
  gracePeriodTime?: number;
}

export interface PhotoCapture extends CaptureStep {
  type: CaptureType.PhotoCapture;
  onCameraFocused?: () => void;
  onCapturedPhoto: (uri: string, isEmulator: boolean) => Promise<void>;
}

export interface PhotoItem {
  photoFilePath: string;
  lotNumber?: string;
}
