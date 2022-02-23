import React, {FC, ReactElement} from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import Text from './Text';
import {Link} from 'react-router-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {store} from '../store';
import {expandPath} from '../utils/filePath';

const PhotoListView: FC = (): ReactElement => {
  const content = [];
  for (let i = 0; i < 50; i++) {
    content.push(<Text content={'Welcome' + i} key={i} />);
  }
  return (
    <ScrollView>
      <View>
        <Link to="/capture" activeOpacity={0.8}>
          <View style={styles.takePhotoButton}>
            <Icon name="camera" style={styles.cameraItemIcon} />
            <Text content="New Item" />
          </View>
        </Link>
      </View>
      <View>
        {store.getState().photos.value.map(photoItem => {
          return (
            <View>
              <Image
                source={{uri: expandPath(photoItem.photoFilePath)}}
                style={{width: 75, height: 100}}
              />
              <Text content={photoItem.lotNumber || 'No lot number'} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  takePhotoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 30,
  },
  cameraItemIcon: {
    color: 'black',
    fontSize: 45,
  },
});

export default PhotoListView;
