import {
  Roboto_400Regular,
  Roboto_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto";
import { Center, GluestackUIProvider, Text } from "@gluestack-ui/themed";
import { config } from "config/gluestack-ui.config";
import { StatusBar, View } from "react-native";

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  return (
    <GluestackUIProvider config={config}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {fontsLoaded ? <Center bg="$gray100"><Text color="orange">Home</Text></Center> : <View />}
    </GluestackUIProvider>
  );
}
