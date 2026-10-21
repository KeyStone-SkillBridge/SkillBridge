import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import DashBoard from "../../../assets/images/Dashboard.svg";
import Jobs from "../../../assets/images/Jobs.svg";
import Learning from "../../../assets/images/Learning.svg";
import Profile from "../../../assets/images/Profile.svg";
import Roadmap from "../../../assets/images/Roadmap.svg";
import SkillGap from "../../../assets/images/Skill.svg";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#731F94",
        tabBarInactiveTintColor: "#4A4150",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {/* 1. Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <DashBoard size={24} color={color} />
          ),
        }}
      />

      {/* 2. Skill Gap */}
      <Tabs.Screen
        name="skills"
        options={{
          title: "Skill Gap",
          tabBarIcon: ({ color, focused }) => (
            <SkillGap size={24} color={color} />
          ),
        }}
      />

      {/* 3. Roadmap */}
      <Tabs.Screen
        name="roadmap"
        options={{
          title: "Roadmap",
          tabBarIcon: ({ color, focused }) => (
            <Roadmap size={22} color={color} />
          ),
        }}
      />

      {/* 4. Learning */}
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learning",
          tabBarIcon: ({ color, focused }) => (
            <Learning size={24} color={color} />
          ),
        }}
      />

      {/* 5. Jobs */}
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color, focused }) => <Jobs size={22} color={color} />,
        }}
      />

      {/* 6. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Profile size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0E5EE",
    height: 75,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    // marginBottom: 10,
  },
  tabBarItem: {
    paddingVertical: 2,
    paddingBottom: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginTop: 2,
  },
});
