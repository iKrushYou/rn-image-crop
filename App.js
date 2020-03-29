import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import ImageCrop from "./rn-image-crop";
import TestImageVertical from "./test-image-vertical.png";
import TestImageHorizontal from "./test-image.jpg";
import TestImage3 from "./test-image-3.png";

// <ImageCrop image={Image.resolveAssetSource(TestImage)} />
// necessary for a local image, might be useful later

export default function App() {
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(TestImageHorizontal);
  const [croppedImage, setCroppedImage] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text>Image Crop Test</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => {
              setImageToCrop(TestImageVertical);
              setShowImageCrop(true);
            }}
            style={{ flex: 1, height: 200 }}
          >
            <Image source={TestImageVertical} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setImageToCrop(TestImageHorizontal);
              setShowImageCrop(true);
            }}
            style={{ flex: 1, height: 200 }}
          >
            <Image source={TestImageHorizontal} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => {
              setImageToCrop(TestImage3);
              setShowImageCrop(true);
            }}
            style={{ flex: 1, height: 200 }}
          >
            <Image source={TestImage3} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, height: 200 }}>
          <Image source={croppedImage} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} />
        </View>
      </View>
      <ImageCrop
        open={showImageCrop}
        image={Image.resolveAssetSource(imageToCrop)}
        onClose={() => setShowImageCrop(false)}
        onCropImage={(image) => {
            setCroppedImage(image)
            setShowImageCrop(false)
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
