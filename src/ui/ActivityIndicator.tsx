import {Animated, Modal, StyleSheet, View} from 'react-native';

import {ActivityIndicator as ActivityIndicatorPaper} from 'react-native-paper';
import React from 'react';
import Text from './Text';

const FADE_TIME = 300;
const DELAY_TIME = 1000;

interface Props {
  showWithDelay?: boolean;
  isInvisible?: boolean;
  label?: string;
}

class ActivityIndicator extends React.Component<Props> {
  _fadeAnim = new Animated.Value(0);

  componentDidMount() {
    if (!this.props.isInvisible) {
      if (this.props.showWithDelay) {
        Animated.timing(this._fadeAnim, {
          toValue: 1,
          duration: FADE_TIME,
          delay: DELAY_TIME,
          useNativeDriver: true,
        }).start();
      } else {
        this._fadeAnim.setValue(1);
      }
    }
  }

  componentWillUnmount() {}

  render() {
    const {label, isInvisible} = this.props;

    const backgroundStyle = StyleSheet.flatten([
      styles.overlayContainer,
      isInvisible ? styles.invisibleOverlayContainer : {},
    ]);
    return (
      <Modal transparent={true} animationType="none" visible={true}>
        {!isInvisible ? (
          <Animated.View style={[{opacity: this._fadeAnim}, backgroundStyle]}>
            {
              <ActivityIndicatorPaper
                color="#000"
                animating={true}
                size="large"
              />
            }
            {label && <Text center content={label} />}
          </Animated.View>
        ) : (
          <View style={backgroundStyle} />
        )}
      </Modal>
    );
  }
}

export default ActivityIndicator;

const styles = StyleSheet.create({
  overlayContainer: {
    justifyContent: 'center',
    left: 0,
    right: 0,
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  invisibleOverlayContainer: {
    opacity: 0,
  },
});
