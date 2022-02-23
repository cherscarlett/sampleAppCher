import React, {FC, ReactElement, useState} from 'react';
import {View} from 'react-native';
import {
  BarcodeCapture,
  CaptureType,
  MultiCaptureFlashMode,
  PhotoCapture,
} from '../types/types';
import MultiPhotoCapture from './MultiPhotoCapture';
import {RNCamera} from 'react-native-camera';
import {useDispatch} from 'react-redux';
import {addPhoto} from '../store/photos';

import {useNavigate} from 'react-router-native';

const QR_ASPECT_RATIO = 1;
const QR_WIDTH_PCT = 0.5;
const MINIMUM_BARCODE_SCAN_TIME = 1.5 * 1000;
const RDT_ASPECT_RATIO = 0.421;
const RDT_HEIGHT_PCT = 0.8;

function pullLotNumberFromBarcode(barcodeData: string): string | undefined {
  const dataParts = (barcodeData || '').split(',');
  const lotNumber = dataParts[1];
  if (lotNumber.length > 1) {
    return lotNumber;
  }
}

const PhotoCaptureView: FC = (): ReactElement => {
  const [lotNumber, setLotNumber] = useState<string>('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLotNumberScanned = (barcode: {
    barcodeData: string;
    barcodeType: keyof BarCodeType;
  }) => {
    const newlotNumber = pullLotNumberFromBarcode(barcode.barcodeData);
    if (newlotNumber) {
      setLotNumber(newlotNumber);
      return true;
    }
    return false;
  };

  const lotNumberStep: BarcodeCapture = {
    captureStepId: 'lotNumber',
    type: CaptureType.BarcodeCapture,
    message: 'Capture QR Code',
    skippable: true,
    showOutline: true,
    captureAreaAspectRatio: QR_ASPECT_RATIO,
    captureAreaWidthPercent: QR_WIDTH_PCT,
    barcodeType: RNCamera.Constants.BarCodeType.qr,
    gracePeriodTime: MINIMUM_BARCODE_SCAN_TIME,
    onBarcodeScanned: onLotNumberScanned,
  };

  const photoCaptureStep: PhotoCapture = {
    captureStepId: 'rdtCapture',
    type: CaptureType.PhotoCapture,
    message: 'Take item photo',
    skippable: false,
    showOutline: true,
    captureAreaAspectRatio: RDT_ASPECT_RATIO,
    captureAreaHeightPercent: RDT_HEIGHT_PCT,
    flashMode: MultiCaptureFlashMode.manual,
    onCapturedPhoto: async (_uri: string, _isEmulator: boolean) => {
      dispatch(
        addPhoto({
          photoFilePath: _uri,
          lotNumber: lotNumber,
        }),
      );
    },
  };

  return (
    <View style={{flex: 1}}>
      <MultiPhotoCapture
        captureSteps={[lotNumberStep, photoCaptureStep]}
        onFinished={() => navigate('/', {replace: true})}
      />
    </View>
  );
};

export default PhotoCaptureView;
