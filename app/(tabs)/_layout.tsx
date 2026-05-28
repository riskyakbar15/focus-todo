import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";

type TabIconProps = {
  focused: boolean;
  icon: string;
};

function TabIcon({ focused, icon }: TabIconProps) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.65 }}>
      {icon}
    </Text>
  );
}

export default function TabsLayout() {
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
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="✓" />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Statistik",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="▥" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Pengaturan",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="⚙" />,
        }}
      />
    </Tabs>
  );
}
