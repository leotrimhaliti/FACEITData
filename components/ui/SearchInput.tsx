import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSearch: () => void;
    placeholder?: string;
}

export function SearchInput({ value, onChangeText, onSearch, placeholder = "Search player..." }: SearchInputProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.container, { borderColor: colors.gridLine || '#ccc', backgroundColor: isDark ? '#000' : '#fff' }]}>
            <TextInput
                style={[styles.input, { color: colors.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.icon}
                onSubmitEditing={onSearch}
                returnKeyType="search"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
                    <Ionicons name="close" size={20} color={colors.icon} />
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onSearch} style={[styles.searchButton, { backgroundColor: colors.tint }]}>
                <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        height: 48,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 8,
    },
    clearButton: {
        padding: 4,
    },
    searchButton: {
        padding: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
});
