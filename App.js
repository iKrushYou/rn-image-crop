import React, { useState } from "react";
import { Button, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import ImageCrop from "./rn-image-crop";
import * as ImageManipulator from "expo-image-manipulator";
import TestImage from "./assets/test-image.png";

export default function App() {
    const [croppedImage, setCroppedImage] = useState(null);
    const [showImageCrop, setShowImageCrop] = useState(false);

    const handleCropImage = async (image, crop) => {
        const result = await ImageManipulator.manipulateAsync(
            image.uri,
            [
                {
                    crop,
                },
            ],
            { format: "jpeg" }
        );

        setCroppedImage(result);
        setShowImageCrop(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={{ fontSize: 24 }}>React Native Image Crop Demo</Text>
            <View style={{ flex: 1, width: "100%" }}>
                <View style={{ flex: 1 }}>
                    <Image source={TestImage} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} />
                </View>
                <Button title={"Crop Image"} onPress={() => setShowImageCrop(true)} />
                <View style={{ flex: 1 }}>
                    <Image source={croppedImage} resizeMode={"contain"} style={{ width: "100%", height: "100%" }} />
                </View>
            </View>
            <ImageCrop
                open={showImageCrop}
                image={Image.resolveAssetSource(TestImage)}
                onClose={() => setShowImageCrop(false)}
                onCropImage={handleCropImage}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
