import React, {FC, ReactElement} from 'react';
import {Image, ScrollView, StyleSheet, View, TouchableOpacity} from 'react-native';
import Text from './Text';
import {Link} from 'react-router-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RootState} from '../store';
import {expandPath} from '../utils/filePath';
import {PhotoItem} from '../types/types';
import {useDispatch, useSelector} from 'react-redux';
import {deletePhoto} from '../store/photos';

const PhotoListView: FC = (): ReactElement => {
  const dispatch = useDispatch();

  const store = useSelector((state: RootState) => state);

  const content = [];
  for (let i = 0; i < 50; i++) {
    content.push(<Text content={'Welcome' + i} key={i} />);
  }
  function removeItem(photoItem: PhotoItem) {
    dispatch(
      deletePhoto(photoItem),
    );
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

      <View style={styles.container}>
        {store.photos.value.map((photoItem: PhotoItem)=> {
          return (
            <View key={photoItem.photoFilePath} style={[styles.photoItem, {
              flexDirection: "row"
            }]}>
              <View style={{flex: 1, flexDirection: "column", justifyContent: "space-between"}}>
                <Text style={styles.heading} content={photoItem.lotNumber || 'No lot number'} />
                <TouchableOpacity onPress={() => removeItem(photoItem)}>
                  <Icon name="trash-can-outline" style={styles.trashItemIcon} />
                </TouchableOpacity>
              </View>
              <View style={{borderRadius: 8, overflow: 'hidden'}}>
                <Image
                  source={{uri: expandPath(photoItem.photoFilePath)}}
                  style={{width: 75, height: 100}}
                />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: 'lightgray',
    borderBottomWidth: 2,
    margin: 10,
  },
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
  photoItem: {
    backgroundColor: 'white',
    justifyContent: 'space-between',
    flex: 1,
    paddingTop: 14,
    paddingRight: 10,
    paddingBottom: 14,
    paddingLeft: 10,
    borderColor: 'lightgray',
    borderTopWidth: 2,
  },
  trashItemIcon: {
    color: "red",
    fontSize: 24,
  },
  heading: {
    fontSize: 24, 
    fontWeight: "600",
  }
});

export default PhotoListView;
