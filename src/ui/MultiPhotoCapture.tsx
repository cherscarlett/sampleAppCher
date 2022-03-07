// Copyright (c) 2021 by Audere
//
// Use of this source code is governed by an MIT-style license that
// can be found in the LICENSE file distributed with this file.

import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  LayoutChangeEvent,
  NativeTouchEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BarCodeReadEvent,
  RNCamera,
  TakePictureResponse,
  Point,
} from 'react-native-camera';
import {
  BarcodeCapture,
  CaptureType,
  FlashStateType,
  MultiCaptureFlashMode,
  PhotoCapture,
} from '../types/types';
import {GUTTER} from '../styles';

import ActivityIndicator from './ActivityIndicator';
import CaptureOutline from './CaptureOutline';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React from 'react';
import Text from './Text';
import {reducePath} from '../utils/filePath';

const FADE_TIME = 500;
const SUCCESS_ANIM_TIME = 400;
const SUCCESS_GRACE_PERIOD = 300;

interface Props {
  captureSteps: (BarcodeCapture | PhotoCapture)[];
  onFinished?: () => void;
  cameraFlashState?: FlashStateType;
  onCameraFlashToggled?: () => void;
  onCameraMountError?: (error: {message: string}) => void;
}

export enum AnimState {
  FadingIn = 'FadingIn',
  DoneAnimating = 'DoneAnimating',
  FadingOut = 'FadingOut',
  ScanSuccess = 'ScanSuccess',
}

interface FocusCirclePosition {
  top: number,
  left: number,
}

interface State {
  cameraReady: boolean;
  capturing: boolean;
  captureStepIndex: number;
  animationState: AnimState;
  barcodeScanSuccessful: boolean;
  previewPaused: boolean;
  cameraFlashState: FlashStateType;
  autoFocusPoint: Point | undefined;
  cameraHeight: number;
  autoFocusIndicatorVisible: boolean;
  focusCirclePosition: FocusCirclePosition
}

type Label = {
  [key: string]: string
}

const LABELS: Label = {
  permissionTitle: 'Camera Permissions',
  permissionMsg: 'We need you to give us these permissions',
  ok: 'Ok',
  cancel: 'Cancel',
  skip: 'skip',
  flash: 'Flash ',
};

const t = (label: string): string => {
  return LABELS[label] || label;
};

class MultiPhotoCapture extends React.Component<Props, State> {
  state: State = {
    cameraReady: false,
    capturing: false,
    captureStepIndex: 0,
    animationState: AnimState.FadingIn,
    barcodeScanSuccessful: false,
    previewPaused: false,
    cameraFlashState: FlashStateType.on,
    autoFocusPoint: undefined,
    cameraHeight: height,
    autoFocusIndicatorVisible: false,
    focusCirclePosition: {top: 0, left: 0},
  };
  _camera: any;
  _tookPictureAnim = new Animated.Value(0);
  _outlineFadeValue = new Animated.Value(0);
  _outlineWidthValue = new Animated.Value(0);
  _outlineColorValue = new Animated.Value(0);
  _borderFadeValue = new Animated.Value(1);
  _permissionVariables = {
    title: t('permissionTitle'),
    message: t('permissionMsg'),
    buttonPositive: t('common:button:ok'),
    buttonNegative: t('common:button:cancel'),
  };
  _gracePeriodTimer: ReturnType<typeof setTimeout> | undefined;
  _useOutlineSuccessColor = false;

  constructor(props: Props) {
    super(props);
  }

  _getCaptureStep = () => {
    return this.props.captureSteps[this.state.captureStepIndex];
  };

  componentDidMount() {
    this._startStep();
  }

  componentWillUnmount() {
    this._clearTimer();
  }

  _startStep = () => {
    if (this.state.previewPaused) {
      // throws an exception if you call before pausing.
      this._camera.resumePreview();
    }
    this.setState({
      animationState: AnimState.FadingIn,
      previewPaused: false,
    });
    const newCaptureStep = this._getCaptureStep();
    Animated.parallel([
      Animated.timing(this._outlineFadeValue, {
        toValue: 1,
        duration: FADE_TIME,
        useNativeDriver: true,
      }),
      Animated.timing(this._borderFadeValue, {
        toValue: 0,
        duration: FADE_TIME,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (
        newCaptureStep.type === CaptureType.BarcodeCapture &&
        newCaptureStep.gracePeriodTime
      ) {
        this._gracePeriodTimer = setTimeout(
          this._onGracePeriodTimeout,
          newCaptureStep.gracePeriodTime,
        );
      }
      this.setState({animationState: AnimState.DoneAnimating});
    });
  };

  _onGracePeriodTimeout = () => {
    this._gracePeriodTimer = undefined;
    if (this.state.barcodeScanSuccessful) {
      this._onScanSuccess();
    }
  };

  _goToNextStep = () => {
    this._clearTimer();
    this.setState({
      animationState: AnimState.FadingOut,
    });
    if (this.state.captureStepIndex === this.props.captureSteps.length - 1) {
      this.props.onFinished && this.props.onFinished();
    } else {
      Animated.parallel([
        Animated.timing(this._outlineFadeValue, {
          toValue: 0,
          duration: FADE_TIME,
          useNativeDriver: true,
        }),
        Animated.timing(this._borderFadeValue, {
          toValue: 1,
          duration: FADE_TIME,
          useNativeDriver: true,
        }),
      ]).start(() => {
        this._useOutlineSuccessColor = false;
        this.setState({
          captureStepIndex: this.state.captureStepIndex + 1,
          barcodeScanSuccessful: false,
        });
        this._startStep();
      });
    }
  };

  _onScanSuccess = () => {
    this.setState({
      animationState: AnimState.ScanSuccess,
    });
    Animated.parallel([
      Animated.sequence([
        Animated.timing(this._outlineWidthValue, {
          toValue: 1,
          duration: SUCCESS_ANIM_TIME / 2,
          useNativeDriver: false,
        }),
        Animated.timing(this._outlineWidthValue, {
          toValue: 0,
          duration: SUCCESS_ANIM_TIME / 2,
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(this._borderFadeValue, {
        toValue: 1,
        duration: SUCCESS_ANIM_TIME,
        useNativeDriver: true,
      }),
      Animated.timing(this._outlineColorValue, {
        toValue: 1,
        duration: SUCCESS_ANIM_TIME,
        useNativeDriver: false,
      }),
    ]).start(() => {
      this._useOutlineSuccessColor = true;
      setTimeout(() => {
        this._goToNextStep();
      }, SUCCESS_GRACE_PERIOD);
    });
  };

  _clearTimer = () => {
    if (this._gracePeriodTimer) {
      clearTimeout(this._gracePeriodTimer);
      this._gracePeriodTimer = undefined;
    }
  };

  _onStepSkipped = () => {
    if (this.state.animationState === AnimState.DoneAnimating) {
      this._goToNextStep();
    }
  };

  _onBarcodeScanned = (scanResult: BarCodeReadEvent) => {
    // Detect qr codes at every step to avoid re-rendering the RNCamera during
    // transitions between BarcodeCapture and PhotoCapture, but only process them
    // during the capture step.
    const captureStep = this._getCaptureStep();
    if (
      captureStep.type === CaptureType.BarcodeCapture &&
      scanResult.data &&
      scanResult.type === captureStep.barcodeType
    ) {
      const barcodeScanned = captureStep.onBarcodeScanned({
        barcodeData: scanResult.data,
        barcodeType: captureStep.barcodeType,
      });
      this.setState({
        barcodeScanSuccessful:
          this.state.barcodeScanSuccessful || barcodeScanned,
      });
      if (
        barcodeScanned &&
        this.state.animationState === AnimState.DoneAnimating &&
        !this._gracePeriodTimer
      ) {
        this._onScanSuccess();
      }
    }
  };

  _captureImage = async () => {
    if (this._camera && this.state.cameraReady && !this.state.capturing) {
      this.setState({capturing: true});

      Animated.sequence([
        Animated.timing(this._tookPictureAnim, {
          delay: 200,
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(this._tookPictureAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      const isEmulator = await DeviceInfo.isEmulator();
      const options = {
        quality: isEmulator ? 0.95 : 1.0,
        orientation: 'portrait',
        fixOrientation: false,
        pauseAfterCapture: true,
      };
      let data: TakePictureResponse;

      try {
        data = await this._camera.takePictureAsync(options);
      } catch (e: any) {
        this.setState({capturing: false});
        this.props.onCameraMountError && this.props.onCameraMountError(e);
        return;
      }
      this.setState({previewPaused: true});

      const captureStep = this._getCaptureStep();
      captureStep.type === CaptureType.PhotoCapture &&
        (await captureStep.onCapturedPhoto(reducePath(data.uri), isEmulator));
      this._goToNextStep();
    }
  };

  _onCameraReady = () => {
    this.setState({cameraReady: true});
  };

  _toggleFlash = () => {
    this._onCameraFlashToggled();
  };

  _onCameraFlashToggled = () => {
    let newFlashState;
    switch (this.state.cameraFlashState) {
      case FlashStateType.off:
        newFlashState = FlashStateType.on;
        break;
      case FlashStateType.on:
        newFlashState = FlashStateType.auto;
        break;
      case FlashStateType.auto:
      default:
        newFlashState = FlashStateType.off;
    }
    this.setState({cameraFlashState: newFlashState});
  };

  _getFlashMode = (flashMode: MultiCaptureFlashMode) => {
    switch (flashMode) {
      case MultiCaptureFlashMode.alwaysOn:
        return RNCamera.Constants.FlashMode.on;
      case MultiCaptureFlashMode.alwaysOff:
        return RNCamera.Constants.FlashMode.off;
      case MultiCaptureFlashMode.manual:
        return RNCamera.Constants.FlashMode[this.state.cameraFlashState];
      case MultiCaptureFlashMode.auto:
      default:
        return RNCamera.Constants.FlashMode.auto;
    }
  };

  _getFlashIconName = () => {
    switch (this.state.cameraFlashState) {
      case FlashStateType.on:
        return 'flash';
      case FlashStateType.auto:
        return 'flash-auto';
      case FlashStateType.off:
        return 'flash-off';
    }
  };
  _getFlashToggleButton = () => {
    const {cameraFlashState} = this.state;
    return (
      <View style={styles.flashToggleContainer}>
        <TouchableOpacity
          onPress={this._toggleFlash}
          disabled={this.state.animationState !== AnimState.DoneAnimating}>
          <View style={styles.flashToggleButton}>
            <Icon
              name={this._getFlashIconName()!}
              style={styles.feedbackItemIcon}
            />
            <Text
              content={t('flash') + t(cameraFlashState)}
              style={{color: 'white'}}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  _getSkipButton = () => {
    return (
      <View style={styles.skipButtonContainer}>
        <TouchableOpacity
          onPress={this._onStepSkipped}
          disabled={this.state.animationState !== AnimState.DoneAnimating}>
          <View style={styles.skipButton} testID="skipButton">
            <Icon color={'white'} name="close" size={50} />
            <Text content={t('skip')} style={{color: 'white'}} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  _getChrome = () => {
    const captureStep = this._getCaptureStep();
    const {skippable, flashMode} = captureStep;
    return (
      <Animated.View
        style={[
          styles.chromeRow,
          {
            opacity:
              this.state.animationState === AnimState.FadingIn &&
              this.state.captureStepIndex === 0
                ? this._outlineFadeValue
                : 1,
          },
        ]}>
        <View style={{flex: 1}} />
        <View style={{flex: 1}}>
          {captureStep.type === CaptureType.PhotoCapture ? (
            <View style={styles.captureButton}>
              <TouchableOpacity
                style={styles.outerCircle}
                onPress={this._captureImage}
                disabled={
                  this.state.capturing ||
                  this.state.animationState !== AnimState.DoneAnimating
                }>
                <View style={styles.circle} />
              </TouchableOpacity>
            </View>
          ) : (
            skippable && this._getSkipButton()
          )}
        </View>
        <View style={{flex: 1}}>
          {flashMode === MultiCaptureFlashMode.manual &&
            this._getFlashToggleButton()}
        </View>
      </Animated.View>
    );
  };

  _handleTap = () => {
    // don't know if this works
    
    // if (x && y) {

    //   //this.setState({autoFocusPoint: {x, y}});
    // }

    // this.setState({autoFocusIndicatorVisible: true});

    // setTimeout(() => this.setState({autoFocusIndicatorVisible: false}),
    //   2000
    // )
  }

  _handlePress = (event: GestureResponderEvent) => {
    const { locationX: x, locationY: y} = event.nativeEvent;

    if (x && y) {
      this.setState({focusCirclePosition: {top: y, left: x}});
      this.setState({autoFocusIndicatorVisible: true});
      this.setState({autoFocusPoint: {x: x/width, y: y/height}});

      setTimeout(() => this.setState({autoFocusIndicatorVisible: false}),
        2000
      );
    }
  }

  _setCameraHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    this.setState({cameraHeight: height});
  }

  render() {
    const captureStep = this._getCaptureStep();
    const {
      flashMode,
      showOutline,
      captureAreaAspectRatio,
      captureAreaHeightPercent,
      captureAreaWidthPercent,
    } = captureStep;
    const {cameraReady, capturing, autoFocusPoint} = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.camera} onLayout={this._setCameraHeight}>
          <RNCamera
            onTap={this._handleTap}
            autoFocusPointOfInterest={autoFocusPoint}
            androidCameraPermissionOptions={this._permissionVariables}
            captureAudio={false}
            flashMode={flashMode && this._getFlashMode(flashMode)}
            ref={ref => {
              this._camera = ref;
            }}
            style={styles.camera}
            type={RNCamera.Constants.Type.back}
            onCameraReady={this._onCameraReady}
            onMountError={this.props.onCameraMountError}
            onBarCodeRead={this._onBarcodeScanned}
            barCodeTypes={
              captureStep.type === CaptureType.BarcodeCapture
                ? [captureStep.barcodeType]
                : undefined
            }
          >
          </RNCamera>
        </View>
        {showOutline && (
          <CaptureOutline
            aspectRatio={captureAreaAspectRatio!}
            heightPercent={captureAreaHeightPercent!}
            widthPercent={captureAreaWidthPercent!}
            animationState={this.state.animationState}
            message={captureStep.message && t(captureStep.message)}
            useOutlineSuccessColor={this._useOutlineSuccessColor}
            outlineFadeValue={this._outlineFadeValue}
            outlineColorValue={this._outlineColorValue}
            outlineWidthValue={this._outlineWidthValue}
            borderFadeValue={this._borderFadeValue}
          />
        )}
        {this._getChrome()}
        {(!cameraReady ||
          capturing ||
          this.state.animationState !== AnimState.DoneAnimating) && (
          <ActivityIndicator
            isInvisible={
              cameraReady &&
              !capturing &&
              this.state.animationState !== AnimState.DoneAnimating
            }
            showWithDelay={!cameraReady}
          />
        )}
        {capturing && (
          <Animated.View
            style={[
              styles.overlayContainer,
              styles.flashBackground,
              {opacity: this._tookPictureAnim},
            ]}
          />
        )}

        <TouchableOpacity style={styles.fakeCameraArea} onPress={this._handlePress}>
          {this.state.autoFocusIndicatorVisible && 
            <View
              style={[styles.focusCircle, 
                    {
                      position: 'absolute', 
                      left: this.state.focusCirclePosition.left, 
                      top: this.state.focusCirclePosition.top,
                      marginLeft: FocusCircleHeight/2 * -1,
                      marginTop: FocusCircleHeight/2 * -1,
                    }]} 
            />
          }
        </TouchableOpacity>
      </View>
    );
  }
}

export default MultiPhotoCapture;

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const FocusCircleHeight = 64;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
    height: height,
    flexDirection: 'column',
  },
  camera: {
    width: '100%',
    height: (width * 4) / 3,
  },
  fakeCameraArea: {
    justifyContent: 'center',
    left: 0,
    right: 0,
    position: 'absolute',
    top: 0,
    height: (width * 4) / 3,
  },
  overlayContainer: {
    justifyContent: 'center',
    left: 0,
    right: 0,
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  chromeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureOutlineContainter: {
    left: 0,
    right: 0,
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  skipButtonContainer: {
    marginLeft: GUTTER / 2,
    marginRight: GUTTER / 2,
    flex: 1,
    justifyContent: 'center',
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 100,
  },
  flashBackground: {
    backgroundColor: 'white',
  },
  flashToggleContainer: {
    marginRight: GUTTER / 2,
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'center',
  },
  flashToggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  feedbackItemIcon: {
    color: 'white',
    fontSize: 45,
    marginBottom: GUTTER / 2,
  },
  captureButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    alignItems: 'center',
    borderColor: 'white',
    borderRadius: 30,
    borderWidth: 7,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  circle: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 0,
    height: 40,
    width: 40,
  },
  focusCircle: {
    backgroundColor: 'transparent',
    borderRadius: FocusCircleHeight/2,
    borderWidth: 2,
    borderColor: 'white',
    height: FocusCircleHeight,
    width: FocusCircleHeight,
  },
});
