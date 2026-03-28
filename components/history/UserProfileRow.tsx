import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export const LANGUAGES = [
    { code: "ka", label: "ქართული", flag: "🇬🇪" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
];

function getInitials(email: string): string {
    const local = email.split("@")[0];
    const parts = local.split(/[._\-]/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return local.slice(0, 2).toUpperCase();
}

interface UserProfileRowProps {
    email: string;
}

const UserProfileRow: React.FC<UserProfileRowProps> = ({ email }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const initials = getInitials(email);

    const handleSelect = (lang: (typeof LANGUAGES)[0]) => {
        setSelectedLang(lang);
        setDropdownOpen(false);
    };

    return (
        <View className="flex-1 flex-row items-center ml-1">
            {/* Avatar */}
            <View className="w-[38px] h-[38px] rounded-full bg-[#A8E6B0] items-center justify-center mr-[10px]">
                <Text className="text-base font-bold text-[#2E7D32]">{initials}</Text>
            </View>

            {/* Profile Info */}
            <View className="flex-1">
                <Text className="text-[13px] font-semibold text-[#111]">{email}</Text>
                <View className="self-start mt-[3px]">
                    <View className="bg-[#E8F5E9] rounded-md px-2 py-0.5">
                        <Text className="text-[11px] font-semibold text-[#2E7D32]">
                            პრემიუმი
                        </Text>
                    </View>
                    <Ionicons
                        name="star"
                        size={12}
                        color="#F9A825"
                        style={{ position: "absolute", top: -6, right: -6 }}
                    />
                </View>
            </View>

            {/* Language Selector */}
            <View>
                <TouchableOpacity
                    className="flex-row items-center pr-2 pl-1"
                    onPress={() => setDropdownOpen((v) => !v)}
                    activeOpacity={0.7}
                >
                    <Text className="text-2xl">{selectedLang.flag}</Text>
                    <Ionicons
                        name={dropdownOpen ? "chevron-up" : "chevron-down"}
                        size={14}
                        color="#555"
                        style={{ marginLeft: 3, marginTop: 1 }}
                    />
                </TouchableOpacity>

                {dropdownOpen && (
                    <>
                        <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
                            <View
                                style={{
                                    position: "absolute",
                                    top: -200,
                                    left: -400,
                                    right: -400,
                                    bottom: -1000,
                                    zIndex: 200,
                                }}
                            />
                        </TouchableWithoutFeedback>

                        <View
                            style={{
                                position: "absolute",
                                top: 36,
                                right: 0,
                                zIndex: 300,
                                minWidth: 160,
                            }}
                            className="bg-white rounded-xl border border-[#e0e8ff] shadow-md overflow-hidden"
                        >
                            {LANGUAGES.map((lang, index) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    className={`flex-row items-center px-[14px] py-[11px] ${index < LANGUAGES.length - 1
                                        ? "border-b border-b-[#eee]"
                                        : ""
                                        } ${selectedLang.code === lang.code ? "bg-[#F0F6FF]" : ""}`}
                                    onPress={() => handleSelect(lang)}
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-lg mr-[10px]">{lang.flag}</Text>
                                    <Text
                                        className={`flex-1 text-sm font-medium ${selectedLang.code === lang.code
                                            ? "text-[#5086d7] font-semibold"
                                            : "text-[#333]"
                                            }`}
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
};

export default UserProfileRow;
