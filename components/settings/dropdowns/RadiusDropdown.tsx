import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { RadiusDropdownProps } from "../types";

export function RadiusDropdown({
  options,
  selected,
  onSelect,
  styleWrapper,
}: RadiusDropdownProps) {
  const { isDark } = useTheme();
  const [menuLayout, setMenuLayout] = useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<View>(null);

  const selectedLabel =
    options.find((o) => o.value === selected)?.label ?? selected;

  const openMenu = () => {
    triggerRef.current?.measure((_fx, _fy, width, height, px, py) => {
      setMenuLayout({ x: px, y: py + height, width });
      setOpen(true);
    });
  };

  const closeMenu = () => setOpen(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    closeMenu();
  };

  return (
    <View className="mb-3" style={styleWrapper}>
      <TouchableOpacity
        ref={triggerRef}
        className={`flex-row items-center justify-between border-[1.5px] border-[#DDE6F5] dark:border-[#2D2D3F] px-4 py-[14px] bg-white dark:bg-[#1E1E2E] ${open
          ? "rounded-tl-[10px] rounded-tr-[10px] rounded-bl-none rounded-br-none"
          : "rounded-[10px]"
          }`}
        onPress={open ? closeMenu : openMenu}
        activeOpacity={0.8}
      >
        <Text className="text-[15px] text-[#1A1A2E] dark:text-[#E0E0E0] font-medium">
          {selectedLabel}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={isDark ? "#9090A8" : "#555"}
        />
      </TouchableOpacity>

      {open && menuLayout && (
        <Modal transparent animationType="none" statusBarTranslucent>
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={closeMenu}
          />
          <View
            style={{
              position: "absolute",
              top: menuLayout.y,
              left: menuLayout.x,
              width: menuLayout.width,
            }}
            className="border-[1.5px] border-t-0 border-[#DDE6F5] dark:border-[#2D2D3F] rounded-tl-none rounded-tr-none rounded-bl-[10px] rounded-br-[10px] bg-white dark:bg-[#1E1E2E] overflow-hidden"
          >
            <ScrollView>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  className={`flex-row items-center justify-between px-4 py-[13px] border-b border-[#F0F4FF] dark:border-[#2D2D3F] ${selected === opt.value ? "bg-[#F0F6FF] dark:bg-[#2D2D3F]" : ""
                    }`}
                  onPress={() => handleSelect(opt.value)}
                >
                  <Text
                    className={`text-sm ${selected === opt.value
                      ? "text-[#2D7CF6] font-semibold"
                      : "text-[#444] dark:text-[#9090A8]"
                      }`}
                  >
                    {opt.label}
                  </Text>
                  {selected === opt.value && (
                    <Ionicons name="checkmark" size={16} color="#2D7CF6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}
