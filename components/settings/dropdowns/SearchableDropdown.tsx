import React, { useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SearchableDropdownProps } from "../types";

export function SearchableDropdown({
  options,
  selected,
  onSelect,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuLayout, setMenuLayout] = useState<{
    x: number;
    y: number;
    width: number;
  } | null>(null);
  const triggerRef = useRef<View>(null);

  const selectedLabel =
    options.find((o) => o.value === selected)?.label ?? selected;

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  const handleOpen = () => {
    triggerRef.current?.measure((_fx, _fy, width, height, px, py) => {
      setMenuLayout({ x: px, y: py + height + 4, width });
      setOpen(true);
    });
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
    setQuery("");
  };

  const handleClose = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <View className="mb-3 z-20">
      <TouchableOpacity
        ref={triggerRef}
        className="flex-row items-center justify-between border-[1.5px] border-[#DDE6F5] rounded-[10px] px-4 py-[14px] bg-white"
        onPress={open ? handleClose : handleOpen}
        activeOpacity={0.8}
      >
        <Text className="text-[15px] text-[#1A1A2E] font-medium">
          {selectedLabel}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#555"
        />
      </TouchableOpacity>

      {open && menuLayout && (
        <Modal transparent animationType="none" statusBarTranslucent>
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={handleClose}
          />
          <View
            style={{
              position: "absolute",
              top: menuLayout.y,
              left: menuLayout.x,
              width: menuLayout.width,
            }}
            className="border-[1.5px] border-[#DDE6F5] rounded-[10px] bg-white overflow-hidden max-h-[290px]"
          >
            <ScrollView
              className="max-h-[220px]"
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {filtered.length > 0 ? (
                filtered.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    className={`flex-row items-center justify-between px-4 py-[13px] border-b border-[#F0F4FF] ${
                      selected === opt.value ? "bg-[#F0F6FF]" : ""
                    }`}
                    onPress={() => handleSelect(opt.value)}
                  >
                    <Text
                      className={`text-sm ${
                        selected === opt.value
                          ? "text-[#2D7CF6] font-semibold"
                          : "text-[#444]"
                      }`}
                    >
                      {opt.label}
                    </Text>
                    {selected === opt.value && (
                      <Ionicons name="checkmark" size={16} color="#2D7CF6" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View className="py-4 items-center">
                  <Text className="text-[13px] text-[#9AA5BE]">
                    შედეგი არ მოიძებნა
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}