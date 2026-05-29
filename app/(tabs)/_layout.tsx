import { Tabs } from "expo-router";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

type TabIconProps = {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

function TabIcon({ focused, icon, color }: TabIconProps) {
  return (
    <Ionicons
      name={icon}
      size={focused ? 23 : 21}
      color={color}
      style={{ opacity: focused ? 1 : 0.7 }}
    />
  );
}

export default function TabsLayout() {
  return <InnerTabs />;
}

function InnerTabs() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.borderSoft,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Task",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              icon={focused ? "checkbox" : "checkbox-outline"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Statistik",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              icon={focused ? "bar-chart" : "bar-chart-outline"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Pengaturan",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              icon={focused ? "settings" : "settings-outline"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
