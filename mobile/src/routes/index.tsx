import { Loading } from "@/components/Loading";
import { useAuth } from "@/hooks/useAuth";
import { AppRoutes } from "@/routes/app.routes";
import { AuthRoutes } from "@/routes/auth.routes";
import { Box, useTheme } from "@gluestack-ui/themed";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";

export function Routes() {
  const { colors } = useTheme()
  const { user, isLoadingUserStorageData } = useAuth()

  const theme = DefaultTheme;
  theme.colors.background = colors.gray[700];

  if (isLoadingUserStorageData) {
    return <Loading />
  }

  return (
    <Box flex={1} bg="$gray700">
      <NavigationContainer theme={theme}>
        {user.id ? <AppRoutes /> : <AuthRoutes />}
      </NavigationContainer>
    </Box>
  );
}
