import { View, Image, StyleSheet } from "react-native"
import { THEME_COLORS } from "../stores/familyStore"

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/family-logo.png-Yis7GcDKuPCdQxVm0UPmG7Zj7Pzczs.jpeg",
        }}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME_COLORS.background,
  },
  logo: {
    width: 200,
    height: 200,
  },
})

