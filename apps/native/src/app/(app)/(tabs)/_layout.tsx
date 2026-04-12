import { router, Tabs } from "expo-router";
import {
  ClipboardList,
  Grid2X2,
  House,
  MessageCircle,
  type LucideProps,
  User,
} from "lucide-react-native";
import { Platform, TouchableOpacity } from "react-native";
import { ProtectedTabsLayout } from "@/src/components/navigation/ProtectedTabsLayout";
import { useDebounce } from "@/src/hooks/useDebounce";
import {
  AUTH_GET_STARTED_ROUTE,
  TECH_ROOT_ROUTE,
} from "@/src/lib/navigation-routes";
import { useBottomTabMetrics } from "@/src/lib/tab-bar-config";
import { useThemeColors } from "@/src/lib/theme";

const APP_CHATBOT_ROUTE = "/(app)/(chatbot)" as const;
const CHAT_FAB_SIZE = 56;

interface ChatFabProps {
  readonly bottom: number;
  readonly onPress: () => void;
  readonly primaryColor: string;
  readonly surfaceColor: string;
}

function HomeTabIcon({ color, size }: Readonly<LucideProps>) {
  return <House size={size} color={color} strokeWidth={1.8} />;
}

function CategoriesTabIcon({ color, size }: Readonly<LucideProps>) {
  return <Grid2X2 size={size} color={color} strokeWidth={1.8} />;
}

function OrdersTabIcon({ color, size }: Readonly<LucideProps>) {
  return <ClipboardList size={size} color={color} strokeWidth={1.8} />;
}

function ProfileTabIcon({ color, size }: Readonly<LucideProps>) {
  return <User size={size} color={color} strokeWidth={1.8} />;
}

function ChatFab({
  bottom,
  onPress,
  primaryColor,
  surfaceColor,
}: ChatFabProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        position: "absolute",
        right: 20,
        bottom,
        width: CHAT_FAB_SIZE,
        height: CHAT_FAB_SIZE,
        borderRadius: CHAT_FAB_SIZE / 2,
        backgroundColor: primaryColor,
        alignItems: "center",
        justifyContent: "center",
        elevation: Platform.OS === "android" ? 6 : 0,
        shadowColor: primaryColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: Platform.OS === "ios" ? 0.35 : 0,
        shadowRadius: Platform.OS === "ios" ? 10 : 0,
      }}
    >
      <MessageCircle size={26} color={surfaceColor} strokeWidth={1.8} />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const themeColors = useThemeColors();
  const { tabBarHeight } = useBottomTabMetrics();
  const goToChatbot = useDebounce(() => router.push(APP_CHATBOT_ROUTE));

  return (
    <ProtectedTabsLayout
      allowedUserType="user"
      unauthenticatedRedirect={AUTH_GET_STARTED_ROUTE}
      wrongRoleRedirect={TECH_ROOT_ROUTE}
      overlay={(
        <ChatFab
          onPress={goToChatbot}
          bottom={tabBarHeight + 12}
          primaryColor={themeColors.primary}
          surfaceColor={themeColors.surfaceOnPrimary}
        />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tabs.Screen
        name="(categories)"
        options={{
          title: "Categories",
          tabBarIcon: CategoriesTabIcon,
        }}
      />
      <Tabs.Screen
        name="(orders)"
        options={{
          title: "My Orders",
          tabBarIcon: OrdersTabIcon,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "My Profile",
          tabBarIcon: ProfileTabIcon,
        }}
      />
    </ProtectedTabsLayout>
  );
}
