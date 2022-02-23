// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an MIT-style license that
// can be found in the LICENSE file distributed with this file.

import {
  GestureResponderEvent,
  Image,
  ImageStyle,
  Linking,
  StyleProp,
  StyleSheet,
  TextStyle,
} from 'react-native';

import {Text as PaperText} from 'react-native-paper';
import React from 'react';

interface Props {
  center?: boolean;
  content: string;
  italic?: boolean;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
  inlineImageStyle?: StyleProp<ImageStyle>;
  numberOfLines?: number;
  onPress?: (event: GestureResponderEvent) => void;
}

interface LinkData {
  startIndex: number;
  length: number;
  title: string;
  url: string;
}

function findMarkdownLinks(text: string): LinkData[] {
  const linkRegex = /\[(.+?)\]\((.+?)\)/;
  let toProcess = text;
  const links: LinkData[] = [];
  while (toProcess.length > 0) {
    const match = toProcess.match(linkRegex);
    if (match) {
      const startIndex = match.index!;
      const length = match[0].length;

      links.push({
        startIndex,
        length,
        title: match[1],
        url: match[2],
      });

      toProcess = toProcess.substr(startIndex + length);
    } else {
      toProcess = '';
    }
  }

  return links;
}

interface ImageData {
  startIndex: number;
  length: number;
  uri: string;
}

function findImages(text: string): ImageData[] {
  const imageRegex = /\[\[image:(.+?)\]\]/;
  let toProcess = text;
  const images: ImageData[] = [];
  while (toProcess.length > 0) {
    const match = toProcess.match(imageRegex);
    if (match) {
      const startIndex = match.index!;
      const length = match[0].length;

      images.push({
        startIndex,
        length,
        uri: match[1],
      });

      toProcess = toProcess.substr(startIndex + length);
    } else {
      toProcess = '';
    }
  }

  return images;
}

class Text extends React.PureComponent<Props> {
  _makeImage = (image: ImageData, index: number) => {
    const style = StyleSheet.flatten([
      styles.inlineImage,
      this.props.inlineImageStyle,
    ]);
    return (
      <Image source={{uri: image.uri}} style={style} key={`image${index}`} />
    );
  };

  _makeLink = (link: LinkData) => {
    const {linkStyle} = this.props;
    const onPress = () => {
      Linking.openURL(link.url);
    };

    return (
      <PaperText
        key={link.url + link.title}
        style={linkStyle}
        onPress={onPress}>
        {link.title}
      </PaperText>
    );
  };

  _makeImages = (text: string): (JSX.Element | string)[] => {
    const images = findImages(text);
    if (images.length === 0) {
      return [text];
    }

    const elements: (JSX.Element | string)[] = [];
    let toProcess = text;
    images.forEach((image, index) => {
      // Output whatever precedes the image as a pure string
      if (image.startIndex > 0) {
        elements.push(toProcess.substr(0, image.startIndex));
      }

      // Now the image itself
      elements.push(this._makeImage(image, index));

      toProcess = toProcess.substr(image.startIndex + image.length);
    });

    // Tack on anything that follows the final image
    if (toProcess.length > 0) {
      elements.push(toProcess);
    }

    return elements;
  };

  _makeLinks = (text: string): (JSX.Element | string)[] => {
    const links = findMarkdownLinks(text);
    if (links.length === 0) {
      return this._makeImages(text);
    }

    let elements: (JSX.Element | string)[] = [];
    let toProcess = text;
    links.forEach(link => {
      // Output whatever precedes the link as a pure string
      if (link.startIndex > 0) {
        elements = elements.concat(
          this._makeImages(toProcess.substr(0, link.startIndex)),
        );
      }

      // Now the link itself
      elements.push(this._makeLink(link));

      toProcess = toProcess.substr(link.startIndex + link.length);
    });

    // Tack on anything that follows the final link
    if (toProcess.length > 0) {
      elements = elements.concat(this._makeImages(toProcess));
    }

    return elements;
  };

  _makeFormat(
    content: string,
    style: StyleProp<TextStyle>,
    bold: boolean,
    italic: boolean,
    center: boolean,
    contentKey: string,
  ) {
    return bold || italic ? (
      <PaperText
        key={contentKey + content}
        style={[italic && styles.italic, center && styles.center, style]}>
        {this._makeLinks(content)}
      </PaperText>
    ) : (
      this._makeLinks(content)
    );
  }

  render() {
    const {center, content, italic, numberOfLines, style, onPress} = this.props;
    let makeBold = false,
      makeItalic = false,
      keyId = 0;
    const inlineComponents = content.split('--').map((str, m) => {
      if (m > 0) {
        makeItalic = !makeItalic;
      }
      return str.split('**').map((s, n) => {
        if (n > 0) {
          makeBold = !makeBold;
        }
        return this._makeFormat(
          s.replace(/\/\*/g, '*'),
          style,
          makeBold,
          makeItalic,
          !!center,
          (keyId++).toString(),
        );
      });
    });
    return (
      <PaperText
        selectable={false}
        style={[center && styles.center, italic && styles.italic, style]}
        accessibilityLabel={content}
        numberOfLines={numberOfLines}
        onPress={onPress}>
        {inlineComponents}
      </PaperText>
    );
  }
}

export default Text;

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  italic: {
    fontStyle: 'italic',
  },
  inlineImage: {
    resizeMode: 'contain',
    height: undefined,
    width: undefined,
  },
});
