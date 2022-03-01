import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {PhotoItem} from '../types/types';

export interface PhotosState {
  value: Array<PhotoItem>;
}

const initialState: PhotosState = {
  value: [],
};

export const photoSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    addPhoto: (state: PhotosState, action: PayloadAction<PhotoItem>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value.push(action.payload);
    },
    deletePhoto: (state: PhotosState, action: PayloadAction<PhotoItem>) => {
      state.value = state.value.filter(e => {
        return e.photoFilePath !==  action.payload.photoFilePath
      });
    }
  },
});

// Action creators are generated for each case reducer function
export const {addPhoto, deletePhoto} = photoSlice.actions;

export default photoSlice.reducer;
