// Copyright (c) 2021 by Audere
//
// Use of this source code is governed by an MIT-style license that
// can be found in the LICENSE file distributed with this file.

import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import {AnimState} from './MultiPhotoCapture';
import {GUTTER} from '../styles';
import React from 'react';
import Text from './Text';

const screenWidth = Dimensions.get('window').width;
const viewfinderHeight = (screenWidth * 4) / 3;

const ORIGINAL_OUTLINE_WIDTH = 8;
const SUCCESS_OUTLINE_WIDTH = 10;
const SUCCESS_ICON_SIZE = 100;
const BORDER_OPACITY = Platform.OS === 'android' ? 0.6 : 0.7;

interface Props {
  aspectRatio: number;
  message?: string;
  heightPercent?: number;
  widthPercent?: number;
  animationState: AnimState;
  useOutlineSuccessColor: boolean;
  outlineFadeValue: Animated.Value;
  outlineColorValue: Animated.Value;
  outlineWidthValue: Animated.Value;
  borderFadeValue: Animated.Value;
}

function CaptureOutline(props: Props) {
  if (props.heightPercent && props.widthPercent) {
    throw Error(
      'CaptureOutline cannot have heightPercent AND widthPercent at the same time.',
    );
  }
  const {
    aspectRatio,
    message,
    heightPercent,
    widthPercent,
    animationState,
    useOutlineSuccessColor,
    outlineFadeValue,
    outlineColorValue,
    outlineWidthValue,
    borderFadeValue,
  } = props;
  const ORIGINAL_COLOR = 'white';
  const SUCCESS_COLOR = 'green';
  let outlineColor = outlineColorValue.interpolate({
    inputRange: [0, 1],
    outputRange: [ORIGINAL_COLOR, SUCCESS_COLOR],
  });
  let outlineWidth = outlineWidthValue.interpolate({
    inputRange: [0, 1],
    outputRange: [ORIGINAL_OUTLINE_WIDTH, SUCCESS_OUTLINE_WIDTH],
  });
  return (
    <View style={styles.overlayContainer}>
      <View style={styles.border} />
      {message && (
        <View style={styles.messageContainer}>
          <Animated.View style={{opacity: outlineFadeValue}}>
            <Text content={message} style={{color: 'white'}} />
          </Animated.View>
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.border} />
        <View
          style={[
            styles.outlineContainer,
            {
              height: heightPercent
                ? viewfinderHeight * heightPercent
                : (screenWidth * widthPercent!) / aspectRatio,
              width: heightPercent
                ? viewfinderHeight * heightPercent * aspectRatio
                : screenWidth * widthPercent!,
            },
          ]}>
          <Animated.View
            style={[
              styles.captureOutline,
              {
                backgroundColor: `rgba(51,51,51, ${BORDER_OPACITY})`,
                opacity: borderFadeValue,
              },
            ]}
          />
          <View style={[styles.captureOutline, styles.successIconContainer]}>
            {animationState === AnimState.ScanSuccess && (
              <Image
                style={styles.successIcon}
                source={require('../images/checkmark.gif')}
              />
            )}
          </View>
          <Animated.View
            style={[
              styles.captureOutline,
              animationState === AnimState.ScanSuccess
                ? {
                    borderColor: outlineColor,
                    borderWidth: outlineWidth,
                  }
                : {
                    borderColor: useOutlineSuccessColor
                      ? SUCCESS_COLOR
                      : ORIGINAL_COLOR,
                    opacity: outlineFadeValue,
                    borderWidth: ORIGINAL_OUTLINE_WIDTH,
                  },
            ]}
          />
        </View>
        <View style={styles.border} />
      </View>
      <View style={styles.border} />
    </View>
  );
}

export default CaptureOutline;

const styles = StyleSheet.create({
  overlayContainer: {
    left: 0,
    right: 0,
    position: 'absolute',
    top: 0,
    height: (screenWidth * 4) / 3,
  },
  messageContainer: {
    backgroundColor: `rgba(51,51,51, ${BORDER_OPACITY})`,
    paddingBottom: GUTTER / 2,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  border: {
    backgroundColor: `rgba(51,51,51, ${BORDER_OPACITY})`,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  outlineContainer: {
    flexDirection: 'row',
  },
  captureOutline: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  successIconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: SUCCESS_ICON_SIZE,
    height: SUCCESS_ICON_SIZE,
  },
});
