import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// ── Mock data ──────────────────────────────────────────────────────────────────
const HISTORY_DATA = [
  {
    title: "დღეს",
    data: [
      {
        id: "1",
        preview:
          "ტრანსკრიფციის სერვისი ხმას ტექსტად გარდაქმნის სწრაფად და მარტივად. მომხმარებელს შეუძ...",
      },
      {
        id: "2",
        preview:
          "ტრანსკრიფციის სერვისი ხმას ტექსტად გარდაქმნის სწრაფად და მარტივად. მომხმარებელს შეუძ...",
      },
    ],
  },
  {
    title: "გუშინ",
    data: [
      {
        id: "3",
        preview:
          "ტრანსკრიფციის სერვისი ხმას ტექსტად გარდაქმნის სწრაფად და მარტივად. მომხმარებელს შეუძ...",
      },
      {
        id: "4",
        preview:
          "ტრანსკრიფციის სერვისი ხმას ტექსტად გარდაქმნის სწრაფად და მარტივად. მომხმარებელს შეუძ...",
      },
    ],
  },
  {
    title: "11 მარტი",
    data: [
      {
        id: "5",
        preview:
          "ტრანსკრიფციის სერვისი ხმას ტექსტად გარდაქმნის სწრაფად და მარტივად. მომხმარებელს შეუძ...",
      },
      {
        id: "6",
        preview:
          "ტრანსკრიფციის სერვისი ხმას ტექსტად გარდაქმნის სწრაფად და მარტივად. მომხმარებელს შეუძ...",
      },
    ],
  },
];

// ── Language options ───────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "ka", label: "ქართული", flag: "🇬🇪" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

type HistoryItem = { id: string; preview: string };

// ── User Profile Row ───────────────────────────────────────────────────────────
function UserProfileRow() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

  const handleSelect = (lang: (typeof LANGUAGES)[0]) => {
    setSelectedLang(lang);
    setDropdownOpen(false);
  };

  return (
    <View style={styles.profileRow}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>A</Text>
      </View>

      {/* Email + Badge */}
      <View style={styles.profileInfo}>
        <Text style={styles.profileEmail}>achi.teruashvili777@gmail.com</Text>
        <View style={styles.badgeWrapper}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>პრემიუმი</Text>
          </View>
          <Ionicons
            name="star"
            size={12}
            color="#F9A825"
            style={styles.starIcon}
          />
        </View>
      </View>

      {/* Language Selector */}
      <View>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setDropdownOpen((v) => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.flagEmoji}>{selectedLang.flag}</Text>
          <Ionicons
            name={dropdownOpen ? "chevron-up" : "chevron-down"}
            size={14}
            color="#555"
            style={styles.chevron}
          />
        </TouchableOpacity>

        {/* Dropdown */}
        {dropdownOpen && (
          <>
            {/* Backdrop to close on outside tap */}
            <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            <View style={styles.dropdown}>
              {LANGUAGES.map((lang, index) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.dropdownItem,
                    index === 0 && styles.dropdownItemFirst,
                    index === LANGUAGES.length - 1 && styles.dropdownItemLast,
                    index < LANGUAGES.length - 1 && styles.dropdownItemBorder,
                    selectedLang.code === lang.code &&
                      styles.dropdownItemActive,
                  ]}
                  onPress={() => handleSelect(lang)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownFlag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.dropdownLabel,
                      selectedLang.code === lang.code &&
                        styles.dropdownLabelActive,
                    ]}
                  >
                    {lang.label}
                  </Text>
                  {selectedLang.code === lang.code && (
                    <Ionicons name="checkmark" size={14} color="#2D7CF6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

// ── History Card ───────────────────────────────────────────────────────────────
function HistoryCard({ item }: { item: HistoryItem }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardEditBtn}>
        <Ionicons name="create-outline" size={20} color="#2D7CF6" />
      </TouchableOpacity>
      <Text style={styles.cardText} numberOfLines={2}>
        {item.preview}
      </Text>
      <TouchableOpacity style={styles.cardDeleteBtn}>
        <Ionicons name="trash-outline" size={20} color="#2D7CF6" />
      </TouchableOpacity>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
        <UserProfileRow />
      </View>

      {/* ── List ── */}
      <SectionList
        sections={HISTORY_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => <HistoryCard item={item} />}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 42,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e7e5e5",
    zIndex: 100,
    overflow: "visible",
  },
  backBtn: {
    padding: 8,
  },

  // Profile Row
  profileRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#A8E6B0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
  },

  // Badge
  badgeWrapper: {
    alignSelf: "flex-start",
    marginTop: 3,
  },
  premiumBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2E7D32",
  },
  starIcon: {
    position: "absolute",
    top: -6,
    right: -6,
  },

  // Language button
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    paddingLeft: 4,
  },
  flagEmoji: {
    fontSize: 24,
  },
  chevron: {
    marginLeft: 3,
    marginTop: 1,
  },

  // Backdrop
  backdrop: {
    position: "absolute",
    top: -200,
    left: -400,
    right: -400,
    bottom: -1000,
    zIndex: 200,
  },

  // Dropdown
  dropdown: {
    position: "absolute",
    top: 36,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e8ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 160,
    zIndex: 300,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  dropdownItemFirst: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  dropdownItemLast: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  dropdownItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  dropdownItemActive: {
    backgroundColor: "#F0F6FF",
  },
  dropdownFlag: {
    fontSize: 18,
    marginRight: 10,
  },
  dropdownLabel: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  dropdownLabelActive: {
    color: "#5086d7",
    fontWeight: "600",
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 2,
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e8ff",
    padding: 14,
    marginBottom: 10,
  },
  cardEditBtn: {
    padding: 4,
    marginRight: 10,
  },
  cardText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  cardDeleteBtn: {
    padding: 4,
    marginLeft: 10,
  },
});
